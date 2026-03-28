"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlaskConical, Clock, CheckCircle2, XCircle, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Experiment, ExperimentStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const statusConfig: Record<ExperimentStatus, { icon: React.ElementType; label: string; dot: string; badge: string }> = {
  draft:   { icon: Clock,        label: "Draft",   dot: "bg-zinc-400",    badge: "bg-secondary/60 text-muted-foreground" },
  running: { icon: Clock,        label: "Running", dot: "bg-zinc-500",    badge: "bg-secondary/60 text-muted-foreground" },
  winner:  { icon: CheckCircle2, label: "Winner",  dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-400" },
  failed:  { icon: XCircle,      label: "Failed",  dot: "bg-red-500",     badge: "bg-red-400/10 text-red-400" },
  paused:  { icon: Pause,        label: "Paused",  dot: "bg-amber-400",   badge: "bg-amber-400/10 text-amber-400" },
}

type FilterKey = "all" | ExperimentStatus

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "running", label: "Running" },
  { key: "winner",  label: "Winner" },
  { key: "failed",  label: "Failed" },
  { key: "draft",   label: "Draft" },
]

function formatLift(lift: number | null): string {
  if (lift === null) return "—"
  return lift >= 0 ? `+${lift.toFixed(1)}%` : `${lift.toFixed(1)}%`
}

function formatConfidence(confidence: number | null): string {
  if (confidence === null) return "—"
  return `${confidence.toFixed(0)}%`
}

function formatDate(date: string | null): string {
  if (!date) return "—"
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return "—"
  }
}

export function ExperimentsTable({ experiments }: { experiments: Experiment[] }) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")

  const counts = {
    running: experiments.filter((e) => e.status === "running").length,
    winner:  experiments.filter((e) => e.status === "winner").length,
    failed:  experiments.filter((e) => e.status === "failed").length,
    draft:   experiments.filter((e) => e.status === "draft").length,
  }

  const tabCount = (key: FilterKey): number => {
    if (key === "all") return experiments.length
    return counts[key as keyof typeof counts] ?? 0
  }

  const filtered =
    activeFilter === "all"
      ? experiments
      : experiments.filter((e) => e.status === activeFilter)

  return (
    <div className="space-y-6 w-full">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Running", value: counts.running, color: "text-foreground" },
          { label: "Winners", value: counts.winner,  color: "text-emerald-400" },
          { label: "Failed",  value: counts.failed,  color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <IconBadge icon={FlaskConical} />
            <h2 className="text-sm font-semibold text-foreground">All Experiments</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {FILTER_TABS.map(({ key, label }) => {
              const count = tabCount(key)
              const isActive = activeFilter === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-secondary text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-border/60 bg-background/40">
          {[
            { label: "Experiment", cls: "col-span-4" },
            { label: "Channel",    cls: "col-span-2 text-right" },
            { label: "Status",     cls: "col-span-2 text-right" },
            { label: "Lift",       cls: "col-span-2 text-right" },
            { label: "Confidence", cls: "col-span-1 text-right" },
            { label: "Started",    cls: "col-span-1 text-right" },
          ].map(({ label, cls }) => (
            <p key={label} className={cn("text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60", cls)}>
              {label}
            </p>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FlaskConical className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {activeFilter === "all"
                ? "No experiments yet. Launch an idea or create one manually."
                : `No ${activeFilter} experiments.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((exp) => {
              const s = statusConfig[exp.status]
              const StatusIcon = s.icon
              const isUp = exp.lift !== null && exp.lift >= 0
              return (
                <div
                  key={exp.id}
                  onClick={() => router.push(`/dashboard/experiments/${exp.id}`)}
                  className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                    <span className="text-sm text-foreground/90 truncate">{exp.name}</span>
                  </div>
                  <p className="col-span-2 text-right text-xs text-muted-foreground">{exp.channel}</p>
                  <div className="col-span-2 flex justify-end">
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", s.badge)}>
                      <StatusIcon className="w-3 h-3" />{s.label}
                    </span>
                  </div>
                  <p className={cn("col-span-2 text-right text-sm font-semibold", exp.lift === null ? "text-muted-foreground" : isUp ? "text-emerald-400" : "text-red-400")}>
                    {formatLift(exp.lift)}
                  </p>
                  <p className="col-span-1 text-right text-xs text-muted-foreground">
                    {formatConfidence(exp.confidence)}
                  </p>
                  <p className="col-span-1 text-right text-xs text-muted-foreground/60">
                    {formatDate(exp.started_at ?? exp.created_at)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
