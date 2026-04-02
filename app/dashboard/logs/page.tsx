import { ScrollText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"

interface LogRow {
  id: string
  action: string
  actor: "admin" | "engine"
  entity_type: string | null
  entity_name: string | null
  description: string
  implication: string | null
  created_at: string
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "yesterday"
  return `${diffDays}d ago`
}

function dateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

function ActorBadge({ actor }: { actor: "admin" | "engine" }) {
  if (actor === "engine") {
    return (
      <span className="bg-violet-500/15 text-violet-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
        Engine
      </span>
    )
  }
  return (
    <span className="bg-zinc-500/15 text-zinc-300 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
      Admin
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  return (
    <span className="bg-secondary text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-full border border-border">
      {action}
    </span>
  )
}

export default async function LogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: rawLogs } = await supabase
    .from("logs")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: false })
    .limit(100)

  const logs: LogRow[] = rawLogs ?? []

  // Group by date label
  const groups: { label: string; entries: LogRow[] }[] = []
  for (const log of logs) {
    const label = dateGroupLabel(log.created_at)
    const existing = groups.find((g) => g.label === label)
    if (existing) {
      existing.entries.push(log)
    } else {
      groups.push({ label, entries: [log] })
    }
  }

  return (
    <div className="space-y-6">
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <ScrollText className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No activity yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Actions taken by you or the Marko engine will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 px-1">
                {group.label}
              </p>
              <Card className="overflow-hidden divide-y divide-border/50">
                {group.entries.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
                    {/* Time */}
                    <p className="text-xs text-muted-foreground/50 shrink-0 w-14 pt-0.5 tabular-nums">
                      {relativeTime(log.created_at)}
                    </p>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ActorBadge actor={log.actor} />
                        <ActionBadge action={log.action} />
                        {log.entity_name && (
                          <span className="text-xs text-foreground/70 font-medium truncate">
                            {log.entity_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80">{log.description}</p>
                      {log.implication && (
                        <p className="text-xs text-muted-foreground/60 italic mt-0.5">
                          {log.implication}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
