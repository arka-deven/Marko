import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { ExperimentStatusSchema } from "@/lib/api/validate"

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["running"],
  running: ["winner", "failed", "paused"],
  paused: ["running", "failed"],
  winner: [],
  failed: [],
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
    const parsed = ExperimentStatusSchema.parse(body)

    const { data: experiment, error: fetchError } = await auth.supabase
      .from("experiments")
      .select("status")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (fetchError || !experiment) return apiError("Not found", 404)

    const allowed = VALID_TRANSITIONS[experiment.status] ?? []
    if (!allowed.includes(parsed.status)) {
      return apiError("Invalid status transition", 400)
    }

    const updates: Record<string, unknown> = { status: parsed.status }
    if (parsed.status === "running") updates.started_at = new Date().toISOString()
    if (parsed.status === "winner" || parsed.status === "failed") updates.ended_at = new Date().toISOString()

    const { data, error } = await auth.supabase
      .from("experiments")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Failed to update status", 500)

    return NextResponse.json({ experiment: data })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
