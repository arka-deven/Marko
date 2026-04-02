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

    const { data: idea, error } = await auth.supabase
      .from("ideas")
      .update({ status: "rejected" })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !idea) return apiError("Idea not found", 404)

    return NextResponse.json({ idea })
  } catch (err) {
    return handleApiError(err)
  }
}
