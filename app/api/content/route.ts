import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // generating | ready | published | failed | all

    let query = auth.supabase
      .from("content_assets")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (status && status !== "all") {
      query = query.eq("status", status)
    } else if (!status) {
      // Default: show non-published assets in the queue
      query = query.in("status", ["generating", "ready", "failed"])
    }

    const { data: assets, error } = await query

    if (error) return apiError("Failed to fetch content assets", 500)

    return NextResponse.json({ assets })
  } catch (err) {
    return handleApiError(err)
  }
}
