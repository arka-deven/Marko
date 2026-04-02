import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { getVideoJob } from "@/lib/higgsfield/client"
import { logger } from "@/lib/logger"

// Polls Higgsfield for pending video jobs every 10 minutes.
// Updates content_asset status to 'ready' with video URL on completion.
export const checkHighsfieldJobs = inngest.createFunction(
  {
    id: "check-higgsfield-jobs",
    triggers: [{ cron: "TZ=UTC */10 * * * *" }], // every 10 minutes
  },
  async ({ step }) => {
    if (!process.env.HIGGSFIELD_API_KEY) {
      return { skipped: true, reason: "HIGGSFIELD_API_KEY not set" }
    }

    const pendingAssets = await step.run("fetch-pending-video-assets", async () => {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from("content_assets")
        .select("id, workspace_id, higgsfield_job_id")
        .eq("status", "generating")
        .not("higgsfield_job_id", "is", null)
        .limit(50)
      return data ?? []
    })

    if (pendingAssets.length === 0) return { checked: 0, completed: 0 }

    let completed = 0

    await step.run("poll-and-update-jobs", async () => {
      const supabase = createAdminClient()

      for (const asset of pendingAssets) {
        if (!asset.higgsfield_job_id) continue

        try {
          const job = await getVideoJob(asset.higgsfield_job_id)

          if (job.status === "completed" && job.video_url) {
            await supabase
              .from("content_assets")
              .update({
                status: "ready",
                higgsfield_video_url: job.video_url,
              })
              .eq("id", asset.id)

            completed++
            logger.info(
              { assetId: asset.id, jobId: asset.higgsfield_job_id },
              "[check-higgsfield-jobs] Video ready"
            )

            // Update Higgsfield automation stats
            const { data: automation } = await supabase
              .from("automations")
              .select("id, run_count")
              .eq("workspace_id", asset.workspace_id)
              .eq("name", "Higgsfield Video Render")
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
          } else if (job.status === "failed") {
            await supabase
              .from("content_assets")
              .update({ status: "failed" })
              .eq("id", asset.id)

            logger.warn(
              { assetId: asset.id, jobId: asset.higgsfield_job_id, error: job.error },
              "[check-higgsfield-jobs] Video generation failed"
            )
          }
          // status === "pending" | "processing" → leave as generating, check again next run
        } catch (err) {
          logger.error({ err, assetId: asset.id }, "[check-higgsfield-jobs] Poll error")
        }
      }
    })

    return { checked: pendingAssets.length, completed }
  }
)
