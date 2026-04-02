import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

const MetricsSchema = z.object({
  impressions: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  saves: z.number().min(0).optional(),
  replies: z.number().min(0).optional(),
  time_on_page_seconds: z.number().min(0).optional(),
  email_captures: z.number().min(0).optional(),
  book_clicks: z.number().min(0).optional(),
  training_inquiries: z.number().min(0).optional(),
  cmct_inquiries: z.number().min(0).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const metrics = MetricsSchema.parse(body)

    // Verify the content asset exists and belongs to workspace
    const { data: asset, error: assetError } = await auth.supabase
      .from("content_assets")
      .select("id, workspace_id, channel, asset_type, idea_id")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (assetError || !asset) return apiError("Content not found", 404)

    // Get idea context for denormalization
    let ideaContext: Record<string, unknown> = {}
    if (asset.idea_id) {
      const { data: idea } = await auth.supabase
        .from("ideas")
        .select("awareness_stage, ladder_position, audience, theme, hook_type")
        .eq("id", asset.idea_id)
        .single()

      if (idea) {
        ideaContext = {
          awareness_stage: idea.awareness_stage,
          ladder_position: idea.ladder_position,
          audience: idea.audience,
          theme: idea.theme,
          hook_type: idea.hook_type,
        }
      }
    }

    // Calculate engagement quality score
    // Formula: saves*3 + comments*2 + shares*2 + likes*1
    const engScore =
      (metrics.saves ?? 0) * 3 +
      (metrics.comments ?? 0) * 2 +
      (metrics.shares ?? 0) * 2 +
      (metrics.likes ?? 0)

    // Calculate conversion score
    const convScore =
      (metrics.email_captures ?? 0) * 5 +
      (metrics.book_clicks ?? 0) * 3 +
      (metrics.training_inquiries ?? 0) * 10 +
      (metrics.cmct_inquiries ?? 0) * 10

    const perfRow = {
      workspace_id: auth.workspaceId,
      content_asset_id: id,
      channel: asset.channel,
      asset_type: asset.asset_type,
      ...metrics,
      engagement_quality_score: engScore,
      conversion_score: convScore,
      measured_at: new Date().toISOString(),
      ...ideaContext,
    }

    // Upsert: if metrics already exist for this asset, update them
    const { data: existing } = await auth.supabase
      .from("content_performance")
      .select("id")
      .eq("content_asset_id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    let result
    if (existing) {
      const { data, error } = await auth.supabase
        .from("content_performance")
        .update(perfRow)
        .eq("id", existing.id)
        .select()
        .single()
      if (error) return apiError("Failed to update metrics", 500)
      result = data
    } else {
      const { data, error } = await auth.supabase
        .from("content_performance")
        .insert(perfRow)
        .select()
        .single()
      if (error) return apiError("Failed to save metrics", 500)
      result = data
    }

    return NextResponse.json({ performance: result })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid metrics data", 400)
    return handleApiError(err)
  }
}
