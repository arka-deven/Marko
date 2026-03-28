import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { ProfilePatchSchema } from "@/lib/api/validate"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: profile, error: profileError } = await auth.supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.userId)
      .single()

    if (profileError || !profile) return apiError("Profile not found", 404)

    const { data: workspace } = await auth.supabase
      .from("workspaces")
      .select("*")
      .eq("id", auth.workspaceId)
      .single()

    const { data: { user } } = await auth.supabase.auth.getUser()

    return NextResponse.json({ profile, workspace, email: user?.email })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = ProfilePatchSchema.parse(body)

    if (parsed.profile) {
      const { error } = await auth.supabase
        .from("profiles")
        .update(parsed.profile)
        .eq("id", auth.userId)

      if (error) return apiError("Failed to update profile", 500)
    }

    if (parsed.workspace) {
      const { error } = await auth.supabase
        .from("workspaces")
        .update(parsed.workspace)
        .eq("id", auth.workspaceId)

      if (error) return apiError("Failed to update workspace", 500)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
