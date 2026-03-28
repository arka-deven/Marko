import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function handleApiError(err: unknown) {
  logger.error({ err, context: "api" }, "Unhandled API error")
  return apiError("Internal server error", 500)
}
