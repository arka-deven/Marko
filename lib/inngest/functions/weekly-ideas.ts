import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { SYSTEM_PROMPT, buildIdeaGenerationPrompt } from "@/lib/ai/prompts"
import { getThemeForWeek, getISOWeek } from "@/lib/ai/cialdini-brand"
import { logger } from "@/lib/logger"

// Runs every Monday at 9am UTC
export const weeklyIdeaGeneration = inngest.createFunction(
  { id: "weekly-idea-generation", triggers: [{ cron: "TZ=UTC 0 9 * * 1" }] },
  async ({ step }) => {
    await step.run("generate-ideas-for-all-workspaces", async () => {
      const supabase = createAdminClient()

      // Determine this week's Cialdini theme (rotates through 8 themes)
      const isoWeek = getISOWeek(new Date())
      const theme   = getThemeForWeek(isoWeek)

      logger.info({ isoWeek, theme }, "[weekly-ideas] Starting generation")

      const { data: workspaces } = await supabase.from("workspaces").select("id")
      if (!workspaces) return

      for (const workspace of workspaces) {
        try {
          // Pull recent titles to avoid repeating angles
          const { data: recentIdeas } = await supabase
            .from("ideas")
            .select("title")
            .eq("workspace_id", workspace.id)
            .order("created_at", { ascending: false })
            .limit(30)

          const recentTitles = (recentIdeas ?? []).map(i => i.title)

          const prompt = buildIdeaGenerationPrompt(theme, recentTitles)

          let message
          try {
            message = await tracedClaude("weekly-idea-generation", [{ role: "user", content: prompt }], {
              system: SYSTEM_PROMPT,
              workspaceId: workspace.id,
              cacheSystem: true, // system prompt is identical across all workspaces — cache it
            })
          } catch (err) {
            logger.error({ err, workspaceId: workspace.id }, "[weekly-ideas] Claude call failed")
            continue
          }

          const text = message.content[0].type === "text" ? message.content[0].text : ""

          let ideas: Array<{
            title: string
            rationale: string
            channel: string
            expectedLift: string
            effort: string
            audience: "b2b" | "b2c"
            theme: string
            hookType: string
            awarenessStage?: string
            ladderPosition?: string
            // Trend-jacking fields
            trendReactive?: boolean
            trendTopic?: string | null
            cialdiniBridgeQuote?: string | null
          }>

          try {
            // Strip markdown fences if Claude wraps output
            const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
            ideas = JSON.parse(cleaned)
          } catch {
            logger.error({ workspaceId: workspace.id, text }, "[weekly-ideas] JSON parse failed")
            continue
          }

          if (!Array.isArray(ideas) || ideas.length === 0) {
            logger.warn({ workspaceId: workspace.id }, "[weekly-ideas] Empty or invalid ideas array")
            continue
          }

          const rows = ideas.map(idea => ({
            workspace_id:         workspace.id,
            title:                idea.title,
            rationale:            idea.rationale,
            channel:              idea.channel,
            expected_lift:        idea.expectedLift,
            effort:               idea.effort,
            // Brand alignment fields
            audience:             idea.audience ?? "b2c",
            theme:                idea.theme    ?? theme,
            hook_type:            idea.hookType ?? null,
            // Marketing funnel fields (Schwartz + Brunson)
            awareness_stage:      idea.awarenessStage ?? "solution_aware",
            ladder_position:      idea.ladderPosition ?? "top_of_funnel",
            // Trend-jacking fields
            trend_reactive:       idea.trendReactive ?? false,
            trend_topic:          idea.trendTopic ?? null,
            cialdini_bridge_quote: idea.cialdiniBridgeQuote ?? null,
            status:               "queued",
            ai_model:             message.model,
            ai_prompt_tokens:     message.usage.input_tokens,
            ai_completion_tokens: message.usage.output_tokens,
          }))

          const { error } = await supabase.from("ideas").insert(rows)
          if (error) {
            logger.error({ error, workspaceId: workspace.id }, "[weekly-ideas] Insert failed")
          } else {
            const trendCount = rows.filter(r => r.trend_reactive).length
            logger.info(
              { workspaceId: workspace.id, count: rows.length, trendReactive: trendCount, theme },
              "[weekly-ideas] Ideas inserted"
            )
          }
        } catch (err) {
          logger.error({ err, workspaceId: workspace.id }, "[weekly-ideas] Failed for workspace")
          continue
        }
      }
    })
  }
)
