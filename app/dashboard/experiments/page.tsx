"use client"

import type React from "react"
import { FlaskConical, Clock, CheckCircle2, XCircle, Plus, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const experiments = [
  { name: "Homepage Hero A/B",         channel: "Web",   status: "running", lift: "+14.2%", confidence: "94%", started: "Mar 20" },
  { name: "Onboarding Email Sequence", channel: "Email", status: "running", lift: "+8.7%",  confidence: "81%", started: "Mar 18" },
  { name: "Pricing Page CTA",          channel: "Web",   status: "winner",  lift: "+22.1%", confidence: "99%", started: "Mar 10" },
  { name: "LinkedIn Ad Creative",      channel: "Paid",  status: "failed",  lift: "−3.4%",  confidence: "62%", started: "Mar 8"  },
  { name: "Re-engagement Push",        channel: "Push",  status: "running", lift: "+5.9%",  confidence: "77%", started: "Mar 22" },
  { name: "Product Hunt Launch Post",  channel: "Social",status: "running", lift: "+11.3%", confidence: "88%", started: "Mar 23" },
  { name: "Free Trial CTA Copy",       channel: "Web",   status: "winner",  lift: "+17.8%", confidence: "98%", started: "Mar 5"  },
  { name: "Weekly Digest Email",       channel: "Email", status: "running", lift: "+3.2%",  confidence: "54%", started: "Mar 24" },
]

const statusConfig = {
  running: { icon: Clock,        label: "Running", color: "text-muted-foreground",    dot: "bg-zinc-500",    badge: "bg-secondary/60 text-muted-foreground" },
  winner:  { icon: CheckCircle2, label: "Winner",  color: "text-emerald-400", dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-400" },
  failed:  { icon: XCircle,      label: "Failed",  color: "text-red-400",     dot: "bg-red-500",     badge: "bg-red-400/10 text-red-400" },
}

const counts = { running: 5, winner: 2, failed: 1 }

export default function ExperimentsPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> New Experiment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Running",  value: counts.running, color: "text-foreground" },
          { label: "Winners",  value: counts.winner,  color: "text-emerald-400" },
          { label: "Failed",   value: counts.failed,  color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <IconBadge icon={FlaskConical} />
            <h2 className="text-sm font-semibold text-foreground">All Experiments</h2>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground/70 transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-border">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-border/60 bg-background/40">
          {[
            { label: "Experiment",  cls: "col-span-4" },
            { label: "Channel",     cls: "col-span-2 text-right" },
            { label: "Status",      cls: "col-span-2 text-right" },
            { label: "Lift",        cls: "col-span-2 text-right" },
            { label: "Confidence",  cls: "col-span-1 text-right" },
            { label: "Started",     cls: "col-span-1 text-right" },
          ].map(({ label, cls }) => (
            <p key={label} className={cn("text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60", cls)}>
              {label}
            </p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {experiments.map((exp) => {
            const s = statusConfig[exp.status as keyof typeof statusConfig]
            const StatusIcon = s.icon
            const isUp = exp.lift.startsWith("+")
            return (
              <div
                key={exp.name}
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
                <p className={cn("col-span-2 text-right text-sm font-semibold", isUp ? "text-emerald-400" : "text-red-400")}>
                  {exp.lift}
                </p>
                <p className="col-span-1 text-right text-xs text-muted-foreground">{exp.confidence}</p>
                <p className="col-span-1 text-right text-xs text-muted-foreground/60">{exp.started}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
