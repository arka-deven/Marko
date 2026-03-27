"use client"

import type React from "react"
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const metrics = [
  { label: "Total Experiments", value: "134",    change: "+22",     up: true },
  { label: "Avg. Lift",         value: "18.4%",  change: "+2.1%",   up: true },
  { label: "Win Rate",          value: "68%",    change: "+4%",     up: true },
  { label: "Revenue Attributed",value: "$84.2k", change: "+$12k",   up: true },
]

const channelData = [
  { channel: "Web",   experiments: 48, winRate: 72, avgLift: 21.3 },
  { channel: "Email", experiments: 36, winRate: 64, avgLift: 16.8 },
  { channel: "Paid",  experiments: 28, winRate: 58, avgLift: 14.2 },
  { channel: "Social",experiments: 14, winRate: 71, avgLift: 11.7 },
  { channel: "Push",  experiments: 8,  winRate: 50, avgLift: 8.4  },
]

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
const liftData  = [8.2, 10.4, 12.1, 14.6, 16.3, 18.4]
const expsData  = [12, 18, 22, 26, 30, 34]

export default function AnalyticsPage() {
  const maxLift = Math.max(...liftData)
  const maxExps = Math.max(...expsData)

  return (
    <div className="space-y-6 w-full">      {/* Top metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl bg-card/80 border border-border px-5 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{m.label}</p>
            <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">{m.value}</p>
            <p className={cn("flex items-center gap-1 text-xs mt-1", m.up ? "text-emerald-400" : "text-red-400")}>
              {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change} this month
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Lift over time */}
        <div className="rounded-2xl bg-card/80 border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={TrendingUp} />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Average Lift Over Time</h2>
              <p className="text-xs text-muted-foreground">6-month rolling average</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36 pt-4">
            {liftData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{v}%</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-zinc-700 to-zinc-400 transition-all"
                  style={{ height: `${(v / maxLift) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground/60">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Experiments over time */}
        <div className="rounded-2xl bg-card/80 border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={BarChart3} />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Active Experiments</h2>
              <p className="text-xs text-muted-foreground">Concurrent experiments running</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36 pt-4">
            {expsData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{v}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-zinc-700 to-zinc-500 transition-all"
                  style={{ height: `${(v / maxExps) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground/60">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel breakdown */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={BarChart3} />
          <h2 className="text-sm font-semibold text-foreground">Performance by Channel</h2>
        </div>
        <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-border/60 bg-background/40">
          {["Channel", "Experiments", "Win Rate", "Avg. Lift"].map((h) => (
            <p key={h} className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{h}</p>
          ))}
        </div>
        <div className="divide-y divide-border/50">
          {channelData.map((row) => (
            <div key={row.channel} className="grid grid-cols-4 gap-3 items-center px-5 py-3.5 hover:bg-secondary/30 transition-colors">
              <p className="text-sm text-foreground/90 font-medium">{row.channel}</p>
              <p className="text-sm text-muted-foreground">{row.experiments}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-16">
                  <div className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-300" style={{ width: `${row.winRate}%` }} />
                </div>
                <span className="text-sm text-muted-foreground">{row.winRate}%</span>
              </div>
              <p className="text-sm font-semibold text-emerald-400">+{row.avgLift}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
