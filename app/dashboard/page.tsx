"use client"

import type React from "react"
import {
  BarChart3,
  Zap,
  BrainCircuit,
  Layers,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  siGoogleanalytics,
  siStripe,
  siSlackware,
  siHubspot,
  siLinear,
  siNotion,
  siMixpanel,
  siFigma,
} from "simple-icons"

function BrandIcon({ si, size = 18 }: { si: { svg: string; hex: string }; size?: number }) {
  // If the brand is black/near-black/white, let CSS handle flipping it based on theme
  const beThemeAware = ["000000", "181717", "FFFFFF"].includes(si.hex.toUpperCase())

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={beThemeAware ? "fill-black dark:fill-white transition-colors" : ""}
      style={!beThemeAware ? { fill: `#${si.hex}` } : undefined}
      dangerouslySetInnerHTML={{ __html: si.svg }}
    />
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const experiments = [
  { name: "Homepage Hero A/B", status: "running",  lift: "+14.2%", channel: "Web" },
  { name: "Onboarding Email Seq.", status: "running",  lift: "+8.7%",  channel: "Email" },
  { name: "Pricing Page CTA",    status: "winner",   lift: "+22.1%", channel: "Web" },
  { name: "LinkedIn Ad Creative", status: "failed",   lift: "−3.4%",  channel: "Paid" },
]

const statusConfig = {
  running: { icon: Clock,         color: "text-muted-foreground",   dot: "bg-zinc-500" },
  winner:  { icon: CheckCircle2,  color: "text-emerald-400", dot: "bg-emerald-400" },
  failed:  { icon: XCircle,       color: "text-red-400",     dot: "bg-red-500" },
}

const channels = [
  { label: "Web",   pct: 82 },
  { label: "Email", pct: 61 },
  { label: "Paid",  pct: 44 },
  { label: "Push",  pct: 29 },
]

const weeklyROI = [
  { week: "Week 1", value: "8.2%",  raw: 8.2 },
  { week: "Week 2", value: "13.6%", raw: 13.6 },
  { week: "Week 3", value: "19.4%", raw: 19.4 },
  { week: "Week 4", value: "24.1%", raw: 24.1 },
]

const integrations = [
  { label: "Google Analytics", si: siGoogleanalytics },
  { label: "Stripe",           si: siStripe },
  { label: "Slack",            si: siSlackware },
  { label: "HubSpot",          si: siHubspot },
  { label: "Linear",           si: siLinear },
  { label: "Notion",           si: siNotion },
  { label: "Mixpanel",         si: siMixpanel },
  { label: "Figma",            si: siFigma },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">

      {/* ── Card 1: Experiment Dashboard ── */}
      <div className="rounded-2xl bg-card/80 border border-border p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={BarChart3} />
          <div>
            <h2 className="text-base font-semibold text-foreground">Experiment Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">34 active · 12 awaiting review</p>
          </div>
        </div>

        {/* Experiment rows */}
        <div className="rounded-xl border border-border bg-background/50 overflow-hidden divide-y divide-border/60">
          {experiments.map((exp) => {
            const s = statusConfig[exp.status as keyof typeof statusConfig]
            const StatusIcon = s.icon
            const isUp = exp.lift.startsWith("+")
            return (
              <div key={exp.name} className="flex items-center gap-3 px-4 py-3">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                <p className="flex-1 text-sm text-foreground/70 truncate">{exp.name}</p>
                <span className="text-xs text-muted-foreground/60 hidden sm:block">{exp.channel}</span>
                <StatusIcon className={cn("w-3.5 h-3.5 shrink-0", s.color)} />
                <span className={cn("text-xs font-semibold w-12 text-right", isUp ? "text-emerald-400" : "text-red-400")}>
                  {exp.lift}
                </span>
              </div>
            )
          })}
        </div>

        {/* Channel breakdown */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Lift by Channel</p>
          {channels.map((ch) => (
            <div key={ch.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10">{ch.label}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-300 transition-all duration-700"
                  style={{ width: `${ch.pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-7 text-right">{ch.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 2: AI Growth Engine ── */}
      <div className="rounded-2xl bg-card/80 border border-border p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={Zap} />
          <div>
            <h2 className="text-base font-semibold text-foreground">AI Growth Engine</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Claude-powered, always running</p>
          </div>
        </div>

        {/* Hero stat */}
        <div className="flex-1 flex flex-col justify-center gap-4 mt-2">
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-black text-foreground tracking-tighter">30x</span>
            <span className="text-sm text-muted-foreground font-medium">more experiments vs manual</span>
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-zinc-500 to-zinc-200" style={{ width: "92%" }} />
          </div>
        </div>

        {/* Today's AI activity */}
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Today's Output</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Ideas Generated", value: "47" },
              { label: "Validated", value: "19" },
              { label: "Launched", value: "6" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground/60">{s.label}</span>
                <span className="text-xl font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-4 py-3">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg. Lift</p>
              <p className="text-sm font-semibold text-foreground">18.4%</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-4 py-3">
            <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-sm font-semibold text-foreground">68%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card 3: Learning Loop ── */}
      <div className="rounded-2xl bg-card/80 border border-border p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={BrainCircuit} />
          <div>
            <h2 className="text-base font-semibold text-foreground">Learning Loop</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Improves targeting every week automatically</p>
          </div>
        </div>

        {/* Weekly ROI grid */}
        <div className="grid grid-cols-4 gap-2">
          {weeklyROI.map((w) => (
            <div key={w.week} className="bg-secondary/50 rounded-xl px-3 py-3">
              <p className="text-[10px] text-muted-foreground/60 mb-1">{w.week}</p>
              <p className="text-base font-bold text-foreground">{w.value}</p>
              <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-200"
                  style={{ width: `${(w.raw / 30) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Key signals */}
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">What Marko Learned</p>
          {[
            { label: "\"Free trial\" CTAs outperform \"Get started\"", impact: "+11%" },
            { label: "Tuesday sends yield 2.3× higher open rate", impact: "+31%" },
            { label: "Mobile-first layouts win on paid channels", impact: "+18%" },
          ].map((insight) => (
            <div key={insight.label} className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground flex-1">{insight.label}</p>
              <span className="text-xs font-semibold text-emerald-400 shrink-0">{insight.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Card 4: Native Integrations ── */}
      <div className="rounded-2xl bg-card/80 border border-border p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={Layers} />
          <div>
            <h2 className="text-base font-semibold text-foreground">Native Integrations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Reads signals from your entire stack</p>
          </div>
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {integrations.map((int) => (
            <div
              key={int.label}
              title={int.label}
              className="flex items-center justify-center h-12 rounded-xl border border-border bg-secondary/40 hover:border-border hover:bg-secondary transition-colors cursor-pointer"
            >
              <BrandIcon si={int.si} size={20} />
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Connected", value: "8" },
            { label: "Events/day", value: "142k" },
            { label: "Latency", value: "<50ms" },
          ].map((s) => (
            <div key={s.label} className="bg-secondary/50 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground/60">{s.label}</p>
              <p className="text-base font-bold text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <button className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/70 transition-colors mt-auto">
          Browse all integrations
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </button>
      </div>

    </div>
  )
}
