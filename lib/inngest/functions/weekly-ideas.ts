import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { SYSTEM_PROMPT, buildIdeaGenerationPrompt } from "@/lib/ai/prompts"
import { logger } from "@/lib/logger"

export const weeklyIdeaGeneration = inngest.createFunction(
  { id: "weekly-idea-generation", triggers: [{ cron: "TZ=UTC 0 9 * * 1" }] },
  async ({ step }) => {
    await step.run("generate-ideas-for-all-workspaces", async () => {
      const supabase = createAdminClient()

      const { data: workspaces } = await supabase.from("workspaces").select("id")
      if (!workspaces) return

      for (const workspace of workspaces) {
        try {
          // Check if this automation is paused for this workspace
          const { data: automation } = await supabase
            .from("automations")
            .select("id, status, run_count")
            .eq("workspace_id", workspace.id)
            .eq("name", "Weekly Idea Generation")
            .single()

          if (automation?.status === "paused") continue

          const { data: experiments } = await supabase
            .from("experiments")
            .select("name, channel, status")
            .eq("workspace_id", workspace.id)
            .limit(20)

          const prompt = buildIdeaGenerationPrompt(experiments ?? [], 5)

          let message
          try {
            message = await tracedClaude("weekly-idea-generation", [{ role: "user", content: prompt }], {
              system: SYSTEM_PROMPT,
              workspaceId: workspace.id,
            })
          } catch {
            continue
          }

          const text = message.content[0].type === "text" ? message.content[0].text : ""

          let ideas: Array<{
            title: string
            rationale: string
            channel: string
            expectedLift: string
            effort: string
          }>
          try {
            ideas = JSON.parse(text)
          } catch {
            continue
          }

          const rows = ideas.map((idea) => ({
            workspace_id: workspace.id,
            title: idea.title,
            rationale: idea.rationale,
            channel: idea.channel,
            expected_lift: idea.expectedLift,
            effort: idea.effort,
            status: "queued",
            ai_model: message.model,
            ai_prompt_tokens: message.usage.input_tokens,
            ai_completion_tokens: message.usage.output_tokens,
          }))

          await supabase.from("ideas").insert(rows)

          if (automation?.id) {
            await supabase.from("automations").update({
              run_count: (automation.run_count ?? 0) + 1,
              last_run_at: new Date().toISOString(),
            }).eq("id", automation.id)
          }
        } catch (err) {
          logger.error({ err, workspaceId: workspace.id }, "[weekly-ideas] Failed for workspace")
          continue
        }
      }
    })
  }
)
