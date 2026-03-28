import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { z } from "zod"

const PatchSchema = z.object({ status: z.enum(["connected", "disconnected"]) })

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = PatchSchema.parse(await request.json())

    const { data, error } = await auth.supabase
      .from("integrations")
      .update({
        status: body.status,
        connected_at: body.status === "connected" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Not found", 404)
    return NextResponse.json({ integration: data })
  } catch (err) {
    return handleApiError(err)
  }
}
