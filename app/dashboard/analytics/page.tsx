import type React from "react"
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: experiments = [] } = await supabase
    .from("experiments")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: true })

  const exps = experiments ?? []

  if (!exps || exps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track performance across all experiments</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40 mb-4" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <h3 className="text-lg font-semibold">No experiments yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">Run your first experiment to see analytics here. Go to Ideas and generate some experiment ideas to get started.</p>
        </div>
      </div>
    )
  }

  // ── Aggregate stats ──
  const totalExps = exps.length
  const expsWithLift = exps.filter((e: any) => e.lift != null)
  const avgLift = expsWithLift.length > 0
    ? (expsWithLift.reduce((s: number, e: any) => s + Number(e.lift), 0) / expsWithLift.length).toFixed(1)
    : "0.0"

  const decided = exps.filter((e: any) => e.status === "winner" || e.status === "failed")
  const winRate = decided.length > 0
    ? Math.round(exps.filter((e: any) => e.status === "winner").length / decided.length * 100)
    : 0

  const revenue = exps.reduce((s: number, e: any) => s + (Number(e.revenue_attributed) || 0), 0)
  const revenueFormatted = revenue >= 1000 ? `$${(revenue / 1000).toFixed(1)}k` : `$${revenue.toFixed(0)}`

  const metrics = [
    { label: "Total Experiments",   value: totalExps.toString(),  change: "", up: true },
    { label: "Avg. Lift",           value: `${avgLift}%`,         change: "", up: true },
    { label: "Win Rate",            value: `${winRate}%`,         change: "", up: true },
    { label: "Revenue Attributed",  value: revenueFormatted,      change: "", up: true },
  ]

  // ── Channel breakdown ──
  const channelNames = ["Web", "Email", "Paid", "Social", "Push"]
  const channelData = channelNames.map(ch => {
    const chExps = exps.filter((e: any) => e.channel === ch)
    const chDecided = chExps.filter((e: any) => e.status === "winner" || e.status === "failed")
    const chWinRate = chDecided.length > 0
      ? Math.round(chExps.filter((e: any) => e.status === "winner").length / chDecided.length * 100)
      : 0
    const chWithLift = chExps.filter((e: any) => e.lift != null)
    const chAvgLift = chWithLift.length > 0
      ? (chWithLift.reduce((s: number, e: any) => s + Number(e.lift), 0) / chWithLift.length).toFixed(1)
      : "0.0"
    return { channel: ch, experiments: chExps.length, winRate: chWinRate, avgLift: parseFloat(chAvgLift) }
  })

  // ── Monthly chart data (last 6 months) ──
  const now = new Date()
  const monthsMeta = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 5 + i)
    return { label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear() }
  })

  const liftData = monthsMeta.map(m => {
    const monthExps = exps.filter((e: any) => {
      const d = new Date(e.created_at)
      return d.getMonth() === m.month && d.getFullYear() === m.year && e.lift != null
    })
    return monthExps.length > 0
      ? parseFloat((monthExps.reduce((s: number, e: any) => s + Number(e.lift), 0) / monthExps.length).toFixed(1))
      : 0
  })

  const expsData = monthsMeta.map(m =>
    exps.filter((e: any) => {
      const d = new Date(e.created_at)
      return d.getMonth() === m.month && d.getFullYear() === m.year
    }).length
  )

  const maxLift = Math.max(...liftData, 1)
  const maxExps = Math.max(...expsData, 1)
  const months = monthsMeta.map(m => m.label)

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Performance across all experiments</p>
      </div>
      {/* Top metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl bg-card/80 border border-border px-5 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{m.label}</p>
            <p className="text-3xl font-black text-foreground mt-2 tracking-tighter">{m.value}</p>
            {m.change && (
              <p className={cn("flex items-center gap-1 text-xs mt-1", m.up ? "text-emerald-400" : "text-red-400")}>
                {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {m.change} this month
              </p>
            )}
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
                <span className="text-[10px] text-muted-foreground">{v > 0 ? `${v}%` : ""}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-zinc-700 to-zinc-400 transition-all"
                  style={{ height: `${Math.max((v / maxLift) * 100, v > 0 ? 4 : 0)}%` }}
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
              <h2 className="text-sm font-semibold text-foreground">Experiments Created</h2>
              <p className="text-xs text-muted-foreground">Per month</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36 pt-4">
            {expsData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{v > 0 ? v : ""}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-zinc-700 to-zinc-500 transition-all"
                  style={{ height: `${Math.max((v / maxExps) * 100, v > 0 ? 4 : 0)}%` }}
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
              <p className={cn("text-sm font-semibold", row.avgLift > 0 ? "text-emerald-400" : "text-muted-foreground")}>
                {row.avgLift > 0 ? `+${row.avgLift}%` : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
