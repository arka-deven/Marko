import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true })

    if (error) throw error

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    })
  } catch (err) {
    logger.error({ err }, "[health] Database connection failed")
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "disconnected" },
      { status: 503 }
    )
  }
}
