import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { getBufferClient, isBufferConfigured } from "@/lib/buffer/client"
import { logger } from "@/lib/logger"

// Runs daily at 6am UTC — pulls metrics from Buffer for all published content
export const syncBufferMetrics = inngest.createFunction(
  { id: "sync-buffer-metrics", triggers: [{ cron: "TZ=UTC 0 6 * * *" }] },
  async ({ step }) => {
    if (!isBufferConfigured()) {
      logger.info("[sync-buffer-metrics] Buffer not configured, skipping")
      return { skipped: true }
    }

    const results = await step.run("pull-buffer-metrics", async () => {
      const supabase = createAdminClient()
      const client = getBufferClient()!

      // Find all published content assets that were published via Buffer
      // and have a buffer_update_id in their metadata
      const { data: assets } = await supabase
        .from("content_assets")
        .select("id, workspace_id, channel, asset_type, idea_id, metadata, published_at")
        .eq("status", "published")
        .not("metadata->buffer_update_id", "is", null)

      if (!assets || assets.length === 0) {
        logger.info("[sync-buffer-metrics] No Buffer-published assets found")
        return { synced: 0 }
      }

      let synced = 0
      let errors = 0

      for (const asset of assets) {
        try {
          const bufferUpdateId = (asset.metadata as any)?.buffer_update_id
          if (!bufferUpdateId) continue

          // Pull the update from Buffer to get latest stats
          const update = await client.getUpdate(bufferUpdateId)
          const stats = update.statistics ?? {}

          // Get idea context for denormalization
          let ideaContext: Record<string, unknown> = {}
          if (asset.idea_id) {
            const { data: idea } = await supabase
              .from("ideas")
              .select("awareness_stage, ladder_position, audience, theme, hook_type")
              .eq("id", asset.idea_id)
              .single()
            if (idea) ideaContext = idea
          }

          // Calculate engagement quality score
          const likes = stats.likes ?? stats.favorites ?? 0
          const comments = stats.comments ?? 0
          const shares = stats.retweets ?? stats.reshares ?? 0
          const clicks = stats.clicks ?? 0
          const engScore = comments * 2 + shares * 2 + likes

          const perfRow = {
            workspace_id: asset.workspace_id,
            content_asset_id: asset.id,
            channel: asset.channel,
            asset_type: asset.asset_type,
            clicks,
            likes,
            comments,
            shares,
            impressions: stats.reach ?? 0,  // Buffer sometimes provides reach
            engagement_quality_score: engScore,
            published_at: asset.published_at,
            measured_at: new Date().toISOString(),
            ...ideaContext,
          }

          // Upsert: update if exists, insert if not
          const { data: existing } = await supabase
            .from("content_performance")
            .select("id")
            .eq("content_asset_id", asset.id)
            .eq("workspace_id", asset.workspace_id)
            .single()

          if (existing) {
            await supabase
              .from("content_performance")
              .update(perfRow)
              .eq("id", existing.id)
          } else {
            await supabase
              .from("content_performance")
              .insert(perfRow)
          }

          synced++
          logger.info(
            { assetId: asset.id, clicks, likes, comments, shares },
            "[sync-buffer-metrics] Synced metrics"
          )
        } catch (err) {
          errors++
          logger.error(
            { err, assetId: asset.id },
            "[sync-buffer-metrics] Failed to sync metrics for asset"
          )
        }

        // Small delay to avoid Buffer rate limit (60 req/min)
        await new Promise((r) => setTimeout(r, 1100))
      }

      return { synced, errors, total: assets.length }
    })

    logger.info(results, "[sync-buffer-metrics] Sync complete")
    return results
  }
)
