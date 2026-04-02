import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

const ContentPatchSchema = z.object({
  status: z.enum(["ready", "published", "failed"]).optional(),
  published_at: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, { message: "No fields to update" })

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = ContentPatchSchema.parse(body)

    // Auto-set published_at when marking as published
    const updateData: Record<string, unknown> = { ...parsed }
    if (parsed.status === "published" && !parsed.published_at) {
      updateData.published_at = new Date().toISOString()
    }

    const { data, error } = await auth.supabase
      .from("content_assets")
      .update(updateData)
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Not found", 404)

    return NextResponse.json({ asset: data })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
