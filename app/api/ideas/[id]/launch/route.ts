import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: idea, error: ideaError } = await auth.supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (ideaError || !idea) return apiError("Not found", 404)

    const { data: experiment, error: expError } = await auth.supabase
      .from("experiments")
      .insert({
        workspace_id: auth.workspaceId,
        name: idea.title,
        description: idea.rationale,
        channel: idea.channel,
        status: "draft",
        idea_id: idea.id,
        created_by: auth.userId,
      })
      .select()
      .single()

    if (expError) return apiError("Failed to create experiment", 500)

    await auth.supabase
      .from("ideas")
      .update({ status: "launched" })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)

    return NextResponse.json({ experiment })
  } catch (err) {
    return handleApiError(err)
  }
}
