import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export interface LogEntry {
  workspaceId: string
  userId?: string
  action: string
  actor?: "admin" | "engine"
  entityType?: string
  entityId?: string
  entityName?: string
  description: string
  implication?: string
  metadata?: Record<string, unknown>
}

export async function writeLog(entry: LogEntry): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.from("logs").insert({
      workspace_id: entry.workspaceId,
      user_id: entry.userId ?? null,
      action: entry.action,
      actor: entry.actor ?? "admin",
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      entity_name: entry.entityName ?? null,
      description: entry.description,
      implication: entry.implication ?? null,
      metadata: entry.metadata ?? {},
    })
  } catch (err) {
    // Logs are best-effort — never throw
    logger.warn({ err, action: entry.action }, "[writeLog] Failed to write log")
  }
}
