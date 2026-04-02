import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { getBufferClient, isBufferConfigured, channelToBufferService } from "@/lib/buffer/client"
import { writeLog } from "@/lib/logs/write"
import { logger } from "@/lib/logger"

// Channels that can be published to Buffer
const BUFFER_CHANNELS = new Set(["LinkedIn", "Twitter", "Facebook", "Instagram"])

// Asset types that shouldn't go to Buffer
const SKIP_BUFFER = new Set(["email", "blog", "push", "ad"])

export async function POST() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    // Get all ready assets for this workspace
    const { data: assets, error } = await auth.supabase
      .from("content_assets")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .eq("status", "ready")
      .order("created_at", { ascending: true })

    if (error) return apiError("Failed to fetch assets", 500)
    if (!assets || assets.length === 0) {
      return NextResponse.json({ published: 0, results: [], message: "No ready content to publish" })
    }

    const bufferConfigured = isBufferConfigured()
    const client = bufferConfigured ? getBufferClient() : null

    // Pre-fetch Buffer profiles once
    let bufferProfiles: Array<{ id: string; service: string }> = []
    if (client) {
      try {
        bufferProfiles = await client.getProfiles()
      } catch (err) {
        logger.error({ err }, "[publish-batch] Failed to fetch Buffer profiles")
      }
    }

    const results: Array<{
      id: string
      channel: string
      asset_type: string
      status: "published" | "skipped" | "failed"
      reason?: string
    }> = []

    for (const asset of assets) {
      // Determine if this asset can go to Buffer
      const canBuffer = bufferConfigured && client
        && BUFFER_CHANNELS.has(asset.channel)
        && !SKIP_BUFFER.has(asset.asset_type)

      if (canBuffer) {
        // Find matching Buffer profile
        const service = channelToBufferService(asset.channel)
        const profile = bufferProfiles.find(p => p.service === service)

        if (!profile) {
          results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "skipped", reason: `No Buffer profile for ${asset.channel}` })
          continue
        }

        // Build post text
        let text = ""
        if (asset.asset_type === "post" || asset.asset_type === "thread") {
          text = asset.body ?? asset.title ?? ""
        } else if (asset.asset_type === "video") {
          // Post the caption for video, not the script
          text = (asset.metadata as Record<string, unknown>)?.caption as string ?? asset.title ?? ""
        } else {
          text = asset.body ?? asset.title ?? ""
        }

        if (!text.trim()) {
          results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "skipped", reason: "No content text" })
          continue
        }

        try {
          const bufferResult = await client!.createUpdate({
            profileIds: [profile.id],
            text,
            now: true,
            shorten: true,
          })

          if (bufferResult.success) {
            const bufferUpdateId = bufferResult.updates?.[0]?.id ?? null

            await auth.supabase
              .from("content_assets")
              .update({
                status: "published",
                published_at: new Date().toISOString(),
                metadata: {
                  ...(asset.metadata ?? {}),
                  buffer_update_id: bufferUpdateId,
                  buffer_profile_id: profile.id,
                  published_via: "buffer",
                },
              })
              .eq("id", asset.id)

            results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "published" })
          } else {
            results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "failed", reason: "Buffer rejected the post" })
          }
        } catch (err) {
          logger.error({ err, assetId: asset.id }, "[publish-batch] Buffer publish failed")
          results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "failed", reason: "Buffer API error" })
        }
      } else {
        // Non-Buffer channels (Email, Blog, Push, Ad) — mark as published manually
        await auth.supabase
          .from("content_assets")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            metadata: {
              ...(asset.metadata ?? {}),
              published_via: "manual",
            },
          })
          .eq("id", asset.id)

        results.push({ id: asset.id, channel: asset.channel, asset_type: asset.asset_type, status: "published" })
      }
    }

    const publishedCount = results.filter(r => r.status === "published").length

    // Log the batch action
    await writeLog({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: "content.batch_published",
      actor: "admin",
      description: `Batch published ${publishedCount} of ${assets.length} content assets`,
      implication: "Content is live — metrics will sync automatically for Buffer posts",
      metadata: { results },
    })

    return NextResponse.json({
      published: publishedCount,
      total: assets.length,
      results,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
