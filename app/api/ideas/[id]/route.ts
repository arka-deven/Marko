import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { IdeaPatchSchema } from "@/lib/api/validate"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = IdeaPatchSchema.parse(body)

    const { data, error } = await auth.supabase
      .from("ideas")
      .update(parsed)
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Not found", 404)

    return NextResponse.json({ idea: data })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { error } = await auth.supabase
      .from("ideas")
      .update({ status: "dismissed" })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)

    if (error) return apiError("Failed to dismiss idea", 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
