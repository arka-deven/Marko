import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: automations, error } = await auth.supabase
      .from("automations")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .order("created_at", { ascending: true })
      .limit(50)

    if (error) return apiError("Failed to fetch automations", 500)

    return NextResponse.json({ automations })
  } catch (err) {
    return handleApiError(err)
  }
}
