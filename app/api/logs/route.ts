import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: logs, error } = await auth.supabase
      .from("logs")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) return apiError("Failed to fetch logs", 500)

    return NextResponse.json({ logs })
  } catch (err) {
    return handleApiError(err)
  }
}
