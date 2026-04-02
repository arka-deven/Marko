import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { CONTENT_SYSTEM_PROMPT, CHANNEL_CONTENT_MAP } from "@/lib/ai/content-prompts"
import { createAvatarVideo, isHighsfieldAvailable } from "@/lib/higgsfield/client"
import { logger } from "@/lib/logger"
import type { Idea } from "@/lib/types"

// Fired when admin approves an idea in the inbox.
// Generates content assets per channel, then triggers Higgsfield for video.
export const onIdeaApproved = inngest.createFunction(
  {
    id: "on-idea-approved",
    triggers: [{ event: "idea/approved" }],
    // Throttle: max 10 concurrent content generation runs to control API costs
    concurrency: { limit: 10 },
  },
  async ({ event, step }) => {
    const { ideaId, workspaceId } = event.data as { ideaId: string; workspaceId: string }

    const idea = await step.run("fetch-idea", async () => {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", ideaId)
        .single()
      return data as Idea | null
    })

    if (!idea) {
      logger.warn({ ideaId }, "[on-idea-approved] Idea not found")
      return
    }

    const contentTasks = CHANNEL_CONTENT_MAP[idea.channel] ?? []
    if (contentTasks.length === 0) {
      logger.info({ ideaId, channel: idea.channel }, "[on-idea-approved] No content tasks for channel")
      return
    }

    // Generate content for each channel asset in parallel (within the step)
    const generatedAssets = await step.run("generate-content-assets", async () => {
      const supabase = createAdminClient()
      const results: Array<{ channel: string; asset_type: string; success: boolean }> = []

      for (const task of contentTasks) {
        try {
          const prompt = task.promptFn(idea)

          const message = await tracedClaude(task.traceName, [
            { role: "user", content: prompt }
          ], {
            system: CONTENT_SYSTEM_PROMPT,
            workspaceId,
            cacheSystem: true, // Cache system prompt — same prompt hits repeatedly
          })

          const text = message.content[0]?.type === "text" ? message.content[0].text : ""

          let parsed: Record<string, unknown> = {}
          try {
            // Strip markdown code fences if present
            const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim()
            parsed = JSON.parse(cleaned)
          } catch {
            logger.warn({ ideaId, channel: task.channel }, "[on-idea-approved] Failed to parse content JSON")
          }

          // Determine title and body from parsed content based on asset type
          let title: string | null = null
          let body: string | null = null
          const metadata: Record<string, unknown> = { ...parsed }

          if (task.asset_type === "post" || task.asset_type === "thread") {
            body = (parsed.body as string) || text
            title = (parsed.hook as string) || null
          } else if (task.asset_type === "email") {
            title = (parsed.subject as string) || null
            body = (parsed.body as string) || text
          } else if (task.asset_type === "blog") {
            title = (parsed.seo_title as string) || null
            body = (parsed.body as string) || text
          } else if (task.asset_type === "video") {
            title = (parsed.title as string) || null
            body = (parsed.script as string) || text
          } else if (task.asset_type === "push") {
            title = (parsed.title as string) || null
            body = (parsed.body as string) || text
          } else if (task.asset_type === "ad") {
            title = "Ad Variants"
            body = JSON.stringify(parsed.variants || parsed)
          }

          await supabase.from("content_assets").insert({
            workspace_id: workspaceId,
            idea_id: ideaId,
            channel: task.channel,
            asset_type: task.asset_type,
            title,
            body,
            metadata,
            status: "ready",
          })

          results.push({ channel: task.channel, asset_type: task.asset_type, success: true })
        } catch (err) {
          logger.error({ err, ideaId, channel: task.channel }, "[on-idea-approved] Content generation failed")

          // Insert a failed placeholder so admin can see it
          await supabase.from("content_assets").insert({
            workspace_id: workspaceId,
            idea_id: ideaId,
            channel: task.channel,
            asset_type: task.asset_type,
            title: null,
            body: null,
            metadata: {},
            status: "failed",
          })

          results.push({ channel: task.channel, asset_type: task.asset_type, success: false })
        }
      }

      return results
    })

    // If Social channel and Higgsfield is available, submit the video script
    if (idea.channel === "Social" && isHighsfieldAvailable()) {
      await step.run("submit-higgsfield-video", async () => {
        const supabase = createAdminClient()

        // Find the video script asset we just generated
        const { data: videoAsset } = await supabase
          .from("content_assets")
          .select("id, body")
          .eq("idea_id", ideaId)
          .eq("asset_type", "video")
          .eq("status", "ready")
          .single()

        if (!videoAsset?.body) return

        try {
          const jobId = await createAvatarVideo({
            script: videoAsset.body,
            aspect_ratio: "9:16", // vertical for TikTok/Reels
          })

          // Update the asset with the Higgsfield job ID and set status back to generating
          await supabase
            .from("content_assets")
            .update({
              higgsfield_job_id: jobId,
              status: "generating", // will flip to ready when job completes
            })
            .eq("id", videoAsset.id)

          logger.info({ ideaId, jobId }, "[on-idea-approved] Higgsfield job submitted")
        } catch (err) {
          logger.error({ err, ideaId }, "[on-idea-approved] Higgsfield submission failed — script still available")
          // Don't fail the whole function — text script is still usable
        }
      })
    }

    // Update the Content Generation automation run stats
    await step.run("update-automation-stats", async () => {
      const supabase = createAdminClient()
      const { data: automation } = await supabase
        .from("automations")
        .select("id, run_count")
        .eq("workspace_id", workspaceId)
        .eq("name", "Content Generation")
        .single()

      if (automation?.id) {
        await supabase
          .from("automations")
          .update({
            run_count: (automation.run_count ?? 0) + 1,
            last_run_at: new Date().toISOString(),
          })
          .eq("id", automation.id)
      }
    })

    logger.info(
      { ideaId, generated: generatedAssets.filter(a => a.success).length },
      "[on-idea-approved] Content generation complete"
    )
    return { generated: generatedAssets }
  }
)
