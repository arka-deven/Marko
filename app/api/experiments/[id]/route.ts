import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { ExperimentPatchSchema } from "@/lib/api/validate"
import { inngest } from "@/lib/inngest/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data, error } = await auth.supabase
      .from("experiments")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (error || !data) return apiError("Not found", 404)

    return NextResponse.json({ experiment: data })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = ExperimentPatchSchema.parse(body)

    const updates: Record<string, unknown> = { ...parsed }
    if (parsed.status === "running") updates.started_at = new Date().toISOString()
    if (parsed.status === "winner" || parsed.status === "failed") updates.ended_at = new Date().toISOString()

    const { data, error } = await auth.supabase
      .from("experiments")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Not found", 404)

    if (parsed.status !== undefined) {
      await inngest.send({
        name: "experiment/status-changed",
        data: { experimentId: data.id, newStatus: data.status, workspaceId: data.workspace_id },
      })
    }

    return NextResponse.json({ experiment: data })
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

    const { data, error: fetchError } = await auth.supabase
      .from("experiments")
      .select("id")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (fetchError || !data) return apiError("Not found", 404)

    const { error } = await auth.supabase
      .from("experiments")
      .delete()
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)

    if (error) return apiError("Failed to delete experiment", 500)

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
