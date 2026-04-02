import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { writeLog } from "@/lib/logs/write"

const PatchSchema = z.object({
  status: z.enum(["ready", "published", "failed"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = PatchSchema.parse(body)

    const updatePayload: Record<string, unknown> = { status: parsed.status }
    if (parsed.status === "published") {
      updatePayload.published_at = new Date().toISOString()
    }

    try {
      const { data: asset, error } = await auth.supabase
        .from("content_assets")
        .update(updatePayload)
        .eq("id", id)
        .eq("workspace_id", auth.workspaceId)
        .select()
        .single()

      if (error || !asset) return apiError("Not found", 404)

      if (parsed.status === "published") {
        await writeLog({
          workspaceId: auth.workspaceId,
          userId: auth.userId,
          action: "content.published",
          actor: "admin",
          entityType: "content_asset",
          entityId: id,
          entityName: `${asset.channel} ${asset.asset_type}`,
          description: `Published ${asset.channel} ${asset.asset_type} content`,
          implication: "Content is live — experiment tracking will begin measuring performance",
        })
      }

      return NextResponse.json({ asset })
    } catch {
      return apiError("Content assets table not available", 503)
    }
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
