import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { z } from "zod"

const PatchSchema = z.object({ shared: z.boolean().optional() })

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = PatchSchema.parse(await request.json())

    const { data, error } = await auth.supabase
      .from("reports")
      .update(body)
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (error || !data) return apiError("Not found", 404)
    return NextResponse.json({ report: data })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { error } = await auth.supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)

    if (error) return apiError("Not found", 404)
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleApiError(err)
  }
}
