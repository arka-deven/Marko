import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get("status")

    try {
      let query = auth.supabase
        .from("content_assets")
        .select("*, idea:ideas(audience, theme, hook_type, awareness_stage, ladder_position)")
        .eq("workspace_id", auth.workspaceId)
        .order("created_at", { ascending: false })
        .limit(100)

      if (statusParam && statusParam !== "all") {
        query = query.eq("status", statusParam)
      } else if (!statusParam) {
        query = query.in("status", ["generating", "ready", "failed"])
      }

      const { data: assets, error } = await query

      if (error) {
        // Table may not exist yet (migration 004 not run)
        if (
          error.code === "PGRST116" ||
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          return NextResponse.json({ assets: [] })
        }
        return apiError("Failed to fetch content assets", 500)
      }

      return NextResponse.json({ assets: assets ?? [] })
    } catch {
      return NextResponse.json({ assets: [] })
    }
  } catch (err) {
    return handleApiError(err)
  }
}
