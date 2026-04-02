import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { inngest } from "@/lib/inngest/client"
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
      .update({ status: "approved" })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (updateError) return apiError("Failed to approve idea", 500)

    await inngest.send({
      name: "idea/approved",
      data: { ideaId: id, workspaceId: auth.workspaceId },
    })

    await writeLog({
      workspaceId: auth.workspaceId,
      userId: auth.userId,
      action: "idea.approved",
      actor: "admin",
      entityType: "idea",
      entityId: id,
      entityName: idea.title,
      description: `Approved idea: "${idea.title}"`,
      implication: `Content generation started for ${idea.channel} channel — LinkedIn, email, blog, and video assets queued`,
    })

    return NextResponse.json({ idea: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
