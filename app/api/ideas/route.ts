import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: ideas, error } = await auth.supabase
      .from("ideas")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .in("status", ["ready", "queued"])
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) return apiError("Failed to fetch ideas", 500)

    return NextResponse.json({ ideas })
  } catch (err) {
    return handleApiError(err)
  }
}
