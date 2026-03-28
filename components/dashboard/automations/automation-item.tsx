"use client"

import { useState } from "react"
import { Play, Pause } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Automation } from "@/lib/types"

const triggerColor: Record<string, string> = {
  Schedule:  "bg-blue-500/10 text-blue-400",
  Event:     "bg-purple-500/10 text-purple-400",
  Condition: "bg-amber-500/10 text-amber-400",
}

export function AutomationItem({ automation }: { automation: Automation }) {
  const [status, setStatus] = useState(automation.status)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const prev = status
    const newStatus = status === "active" ? "paused" : "active"
    try {
      const res = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update automation")
      setStatus(newStatus)
      toast.success(`Automation ${newStatus}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update automation")
      setStatus(prev)
    } finally {
      setLoading(false)
    }
  }

  const lastRun = automation.last_run_at
    ? new Date(automation.last_run_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Never"

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
      <div className={cn(
        "mt-0.5 w-2 h-2 rounded-full shrink-0",
        status === "active" ? "bg-emerald-400" : "bg-zinc-600"
      )} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground/90">{automation.name}</p>
          <span className={cn(
            "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
            triggerColor[automation.trigger_type]
          )}>
            {automation.trigger_type}
          </span>
        </div>
        {automation.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{automation.description}</p>
        )}
        <p className="text-[10px] text-muted-foreground/60">{automation.run_count} runs · Last: {lastRun}</p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0 disabled:opacity-50",
          status === "active"
            ? "border-border text-muted-foreground hover:text-foreground/90"
            : "border-border text-muted-foreground/60 hover:text-foreground/70"
        )}
      >
        {status === "active"
          ? <><Pause className="w-3 h-3" /> Pause</>
          : <><Play className="w-3 h-3" /> Resume</>
        }
      </button>
    </div>
  )
}
