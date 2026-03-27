"use client"

import type React from "react"
import { Zap, Play, Pause, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const automations = [
  {
    name: "Weekly Experiment Digest",
    description: "Every Monday 9AM — summarizes all experiment results and sends to Slack.",
    trigger: "Schedule",
    status: "active",
    runs: 12,
    lastRun: "Mar 25",
  },
  {
    name: "Auto-launch Winning Variants",
    description: "When an experiment hits 95% confidence, automatically promotes the winning variant.",
    trigger: "Event",
    status: "active",
    runs: 4,
    lastRun: "Mar 22",
  },
  {
    name: "Low-confidence Experiment Alert",
    description: "Notifies via Slack when an experiment runs 14+ days without reaching 70% confidence.",
    trigger: "Condition",
    status: "active",
    runs: 7,
    lastRun: "Mar 20",
  },
  {
    name: "Monthly ROI Report to HubSpot",
    description: "Sends a formatted experiment ROI summary to HubSpot CRM contacts at month end.",
    trigger: "Schedule",
    status: "paused",
    runs: 2,
    lastRun: "Feb 28",
  },
  {
    name: "New Idea Generation",
    description: "Every Friday, Marko generates 10 new experiment ideas based on recent performance data.",
    trigger: "Schedule",
    status: "active",
    runs: 8,
    lastRun: "Mar 22",
  },
]

const triggerColor: Record<string, string> = {
  Schedule:  "bg-blue-500/10 text-blue-400",
  Event:     "bg-purple-500/10 text-purple-400",
  Condition: "bg-amber-500/10 text-amber-400",
}

export default function AutomationsPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active",      value: "4", color: "text-emerald-400" },
          { label: "Paused",      value: "1", color: "text-amber-400" },
          { label: "Total Runs",  value: "33", color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Automation list */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={Zap} />
          <h2 className="text-sm font-semibold text-foreground">All Automations</h2>
        </div>
        <div className="divide-y divide-border/50">
          {automations.map((auto) => (
            <div key={auto.name} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
              {/* Status indicator */}
              <div className={cn(
                "mt-0.5 w-2 h-2 rounded-full shrink-0",
                auto.status === "active" ? "bg-emerald-400" : "bg-zinc-600"
              )} />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground/90">{auto.name}</p>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", triggerColor[auto.trigger])}>
                    {auto.trigger}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{auto.description}</p>
                <p className="text-[10px] text-muted-foreground/60">{auto.runs} runs · Last: {auto.lastRun}</p>
              </div>

              {/* Toggle */}
              <button className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0",
                auto.status === "active"
                  ? "border-border text-muted-foreground hover:text-foreground/90 hover:border-border"
                  : "border-border text-muted-foreground/60 hover:text-foreground/70 hover:border-border"
              )}>
                {auto.status === "active"
                  ? <><Pause className="w-3 h-3" /> Pause</>
                  : <><Play className="w-3 h-3" /> Resume</>
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
