import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { writeLog } from "@/lib/logs/write"
import { getBufferClient, isBufferConfigured, channelToBufferService } from "@/lib/buffer/client"

const PublishSchema = z.object({
  contentAssetId: z.string().uuid(),
  profileId: z.string().optional(),   // Buffer profile ID; auto-detect if omitted
  scheduledAt: z.string().optional(),  // ISO 8601; publish now if omitted
})

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    if (!isBufferConfigured()) {
      return apiError("Buffer not configured", 503)
    }

    const body = await request.json()
    const { contentAssetId, profileId, scheduledAt } = PublishSchema.parse(body)

    // Fetch the content asset
    const { data: asset, error: assetError } = await auth.supabase
      .from("content_assets")
      .select("*")
      .eq("id", contentAssetId)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (assetError || !asset) return apiError("Content asset not found", 404)
    if (asset.status !== "ready") return apiError("Content must be in 'ready' status to publish", 400)

    const client = getBufferClient()!

    // Find the right Buffer profile
    let targetProfileId = profileId
    if (!targetProfileId) {
      const profiles = await client.getProfiles()
      const service = channelToBufferService(asset.channel)
      const match = profiles.find((p) => p.service === service)
      if (!match) {
        return apiError(
          `No Buffer profile found for ${asset.channel}. Connect a ${asset.channel} account in Buffer first.`,
          400
        )
      }
      targetProfileId = match.id
    }

    // Build the post text
    let text = ""
    if (asset.asset_type === "post" || asset.asset_type === "thread") {
      // LinkedIn/Twitter: use body directly
      text = asset.body ?? asset.title ?? ""
    } else if (asset.asset_type === "email") {
      // Don't publish emails to Buffer
      return apiError("Email content cannot be published to Buffer. Use your ESP instead.", 400)
    } else if (asset.asset_type === "blog") {
      // Blog: post a teaser with link
      const seoTitle = (asset.metadata as any)?.seo_title ?? asset.title ?? ""
      text = seoTitle
      // If there's a blog URL in metadata, include it
      const blogUrl = (asset.metadata as any)?.url
      if (blogUrl) text += `\n\n${blogUrl}`
    } else {
      text = asset.body ?? asset.title ?? ""
    }

    if (!text.trim()) {
      return apiError("No content text to publish", 400)
    }

    // Publish to Buffer
    const result = await client.createUpdate({
      profileIds: [targetProfileId],
      text,
      now: !scheduledAt,
      scheduledAt,
      shorten: true,
    })

    if (!result.success) {
      return apiError("Buffer failed to queue the post", 500)
    }

    // Get the Buffer update ID for tracking
    const bufferUpdateId = result.updates?.[0]?.id ?? null

    // Update the content asset: mark as published, store Buffer update ID
    await auth.supabase
      .from("content_assets")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        metadata: {
          ...(asset.metadata ?? {}),
          buffer_update_id: bufferUpdateId,
          buffer_profile_id: targetProfileId,
          published_via: "buffer",
        },
      })
      .eq("id", contentAssetId)

    // Log the action
    await writeLog({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: "content.published",
      actor: "admin",
      entityType: "content_asset",
      entityId: contentAssetId,
      entityName: `${asset.channel} ${asset.asset_type}`,
      description: `Published ${asset.channel} ${asset.asset_type} via Buffer${scheduledAt ? " (scheduled)" : ""}`,
      implication: "Content is live on Buffer — metrics will sync automatically",
    })

    return NextResponse.json({
      success: true,
      bufferUpdateId,
      message: scheduledAt ? "Scheduled on Buffer" : "Published via Buffer",
    })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
