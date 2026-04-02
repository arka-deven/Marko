import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { writeLog } from "@/lib/logs/write"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: idea, error: fetchError } = await auth.supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (fetchError || !idea) return apiError("Not found", 404)

    const { data: updated, error: updateError } = await auth.supabase
      .from("ideas")
      .update({ status: "rejected" })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (updateError) return apiError("Failed to reject idea", 500)

    await writeLog({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: "idea.rejected",
      actor: "admin",
      entityType: "idea",
      entityId: id,
      entityName: idea.title,
      description: `Rejected idea: "${idea.title}"`,
      implication: `Idea removed from pipeline — no content will be generated`,
    })

    return NextResponse.json({ idea: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
