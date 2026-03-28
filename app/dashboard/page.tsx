import type React from "react"
import Link from "next/link"
import { BarChart3, Zap, BrainCircuit, Layers, TrendingUp, CheckCircle2, Clock, XCircle, ArrowUpRight, Lightbulb, FlaskConical, Plug, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  siGoogleanalytics, siStripe, siSlackware, siHubspot,
  siLinear, siNotion, siMixpanel, siFigma,
} from "simple-icons"
import { createClient } from "@/lib/supabase/server"

function BrandIcon({ si, label, size = 18 }: { si: { svg: string; hex: string }; label?: string; size?: number }) {
  const beThemeAware = ["000000", "181717", "FFFFFF"].includes(si.hex.toUpperCase())
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={beThemeAware ? "fill-black dark:fill-white transition-colors" : ""}
      style={!beThemeAware ? { fill: `#${si.hex}` } : undefined}
      dangerouslySetInnerHTML={{ __html: si.svg }}
    />
  )
}

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const statusConfig = {
  running: { icon: Clock,        color: "text-muted-foreground", dot: "bg-zinc-500" },
  winner:  { icon: CheckCircle2, color: "text-emerald-400",      dot: "bg-emerald-400" },
  failed:  { icon: XCircle,      color: "text-red-400",          dot: "bg-red-500" },
  draft:   { icon: Clock,        color: "text-muted-foreground", dot: "bg-zinc-600" },
  paused:  { icon: Clock,        color: "text-amber-400",        dot: "bg-amber-500" },
}

const brandIcons = [
  { label: "Google Analytics", si: siGoogleanalytics },
  { label: "Stripe",           si: siStripe },
  { label: "Slack",            si: siSlackware },
  { label: "HubSpot",          si: siHubspot },
  { label: "Linear",           si: siLinear },
  { label: "Notion",           si: siNotion },
  { label: "Mixpanel",         si: siMixpanel },
  { label: "Figma",            si: siFigma },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id, full_name")
    .eq("id", user!.id)
    .single()

  const workspaceId = profile?.workspace_id
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  const [
    { data: experiments = [] },
    { data: todayIdeas = [] },
    { data: allIdeas = [] },
    { data: integrations = [] },
  ] = await Promise.all([
    supabase.from("experiments").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
    supabase.from("ideas").select("status").eq("workspace_id", workspaceId).gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("ideas").select("id").eq("workspace_id", workspaceId),
    supabase.from("integrations").select("status").eq("workspace_id", workspaceId),
  ])

  const isNewUser = (experiments ?? []).length === 0 && (allIdeas ?? []).length === 0

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const topExps = (experiments ?? []).slice(0, 4)
  const runningCount = (experiments ?? []).filter((e: any) => e.status === "running").length
  const draftCount   = (experiments ?? []).filter((e: any) => e.status === "draft").length
  const totalCount   = (experiments ?? []).length

  const expsWithLift = (experiments ?? []).filter((e: any) => e.lift != null)
  const avgLift = expsWithLift.length > 0
    ? (expsWithLift.reduce((s: number, e: any) => s + Number(e.lift), 0) / expsWithLift.length).toFixed(1)
    : "0.0"

  const decided  = (experiments ?? []).filter((e: any) => e.status === "winner" || e.status === "failed")
  const winRate  = decided.length > 0
    ? Math.round((experiments ?? []).filter((e: any) => e.status === "winner").length / decided.length * 100)
    : 0

  const channelsList = ["Web", "Email", "Paid", "Social", "Push"]
  const channels = channelsList.map(ch => {
    const chExps = (experiments ?? []).filter((e: any) => e.channel === ch && e.lift != null)
    const avg = chExps.length > 0
      ? Math.round(chExps.reduce((s: number, e: any) => s + Number(e.lift), 0) / chExps.length)
      : 0
    return { label: ch, pct: Math.max(0, avg) }
  })

  // Today's AI engine output
  const ideasGenerated = (todayIdeas ?? []).length
  const ideasValidated = (todayIdeas ?? []).filter((i: any) => i.status === "ready" || i.status === "launched").length
  const ideasLaunched  = (todayIdeas ?? []).filter((i: any) => i.status === "launched").length
  const connectedCount = (integrations ?? []).filter((i: any) => i.status === "connected").length
  const totalIdeas     = (allIdeas ?? []).length

  // ── Learning Loop: real weekly lift from experiments ─────────────────────────
  const now = new Date()
  const weeklyData = Array.from({ length: 4 }, (_, i) => {
    const weekEnd   = new Date(now)
    weekEnd.setDate(now.getDate() - i * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 7)

    const weekExps = (experiments ?? []).filter((e: any) => {
      const updated = new Date(e.updated_at)
      return updated >= weekStart && updated <= weekEnd && e.lift != null
    })

    const avg = weekExps.length > 0
      ? parseFloat((weekExps.reduce((s: number, e: any) => s + Number(e.lift), 0) / weekExps.length).toFixed(1))
      : null

    return { week: `Week ${4 - i}`, value: avg !== null ? `${avg}%` : null, raw: avg ?? 0 }
  }).reverse()

  const hasLearningData = weeklyData.some(w => w.value !== null)
  const maxWeeklyRaw    = Math.max(...weeklyData.map(w => w.raw), 1)

  // ── Real insights: top winner experiments sorted by lift ─────────────────────
  const winnerInsights = (experiments ?? [])
    .filter((e: any) => e.status === "winner" && e.lift != null)
    .sort((a: any, b: any) => Number(b.lift) - Number(a.lift))
    .slice(0, 3)

  // ── Full onboarding empty state ───────────────────────────────────────────────
  if (isNewUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Sparkles className="w-7 h-7 text-foreground/60" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome, {firstName} 👋</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-10">
          Marko is your always-on AI growth engine. Here&apos;s how to get your first experiment live in under 5 minutes.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          {[
            {
              step: "1",
              icon: Lightbulb,
              title: "Generate ideas",
              description: "Let Claude analyse your context and generate 5–10 growth experiments instantly.",
              href: "/dashboard/ideas",
              cta: "Go to Ideas →",
            },
            {
              step: "2",
              icon: FlaskConical,
              title: "Launch an experiment",
              description: "Pick an idea and launch it across your channel. Marko tracks the results for you.",
              href: "/dashboard/experiments",
              cta: "Go to Experiments →",
            },
            {
              step: "3",
              icon: Plug,
              title: "Connect your stack",
              description: "Plug in GA4, Stripe, or Slack so Marko can pull real signals and close the loop.",
              href: "/dashboard/integrations",
              cta: "Go to Integrations →",
            },
          ].map((card) => (
            <Link
              key={card.step}
              href={card.href}
              className="group flex flex-col gap-3 p-5 rounded-2xl bg-card/80 border border-border hover:border-foreground/20 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <card.icon className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Step {card.step}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
              <span className="text-xs font-medium text-foreground/60 group-hover:text-foreground transition-colors mt-auto">{card.cta}</span>
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Already have data?{" "}
          <Link href="/dashboard/experiments" className="text-foreground/70 font-medium hover:underline">
            Create an experiment manually →
          </Link>
        </p>
      </div>
    )
  }

  // ── Full dashboard (data exists) ──────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">

      {/* ── Card 1: Experiment Dashboard ── */}
      <div className="rounded-2xl bg-card/80 border border-border p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={BarChart3} />
          <div>
            <h2 className="text-base font-semibold text-foreground">Experiment Dashboard</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {runningCount} active · {draftCount} awaiting review
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/50 overflow-hidden divide-y divide-border/60">
          {topExps.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No experiments yet — create your first one in the Experiments tab.
            </div>
          ) : (
            topExps.map((exp: any) => {
              const s = statusConfig[exp.status as keyof typeof statusConfig] ?? statusConfig.draft
              const StatusIcon = s.icon
              const lift  = exp.lift != null ? (exp.lift >= 0 ? `+${exp.lift}%` : `${exp.lift}%`) : "—"
              const isUp  = exp.lift != null && exp.lift >= 0
              return (
                <div key={exp.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
                  <p className="flex-1 text-sm text-foreground/70 truncate">{exp.name}</p>
                  <span className="text-xs text-muted-foreground/60 hidden sm:block">{exp.channel}</span>
                  <StatusIcon className={cn("w-3.5 h-3.5 shrink-0", s.color)} />
                  <span className={cn("text-xs font-semibold w-12 text-right", exp.lift == null ? "text-muted-foreground" : isUp ? "text-emerald-400" : "text-red-400")}>
                    {lift}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Avg. Lift by Channel</p>
          {channels.map((ch) => (
            <div key={ch.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10">{ch.label}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-300 transition-all duration-700"
                  style={{ width: `${Math.min(ch.pct, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-7 text-right">{ch.pct > 0 ? `${ch.pct}%` : "—"}</span>
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

        <div className="flex-1 flex flex-col justify-center gap-2 mt-2">
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-black text-foreground tracking-tighter">{totalCount}</span>
            <span className="text-sm text-muted-foreground font-medium">
              {totalCount === 1 ? "experiment created" : "experiments created"}
            </span>
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            {/* Progress bar: ratio of running vs total experiments */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-zinc-500 to-zinc-200 transition-all duration-700"
              style={{ width: totalCount > 0 ? `${Math.round((runningCount / totalCount) * 100)}%` : "0%" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{runningCount} of {totalCount} currently running</p>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Today&apos;s Output</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Ideas Generated", value: ideasGenerated },
              { label: "Validated",        value: ideasValidated },
              { label: "Launched",         value: ideasLaunched },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground/60">{s.label}</span>
                <span className="text-xl font-bold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-4 py-3">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Avg. Lift</p>
              <p className="text-sm font-semibold text-foreground">{avgLift}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-secondary/50 rounded-xl px-4 py-3">
            <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-sm font-semibold text-foreground">{winRate}%</p>
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
            <p className="text-xs text-muted-foreground mt-0.5">Avg. lift per week from your experiments</p>
          </div>
        </div>

        {hasLearningData ? (
          <div className="grid grid-cols-4 gap-2">
            {weeklyData.map((w) => (
              <div key={w.week} className="bg-secondary/50 rounded-xl px-3 py-3">
                <p className="text-[10px] text-muted-foreground/60 mb-1">{w.week}</p>
                <p className="text-base font-bold text-foreground">{w.value ?? "—"}</p>
                <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-200"
                    style={{ width: w.raw > 0 ? `${(w.raw / maxWeeklyRaw) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <BrainCircuit className="w-8 h-8 text-muted-foreground/30 mb-1" />
            <p className="text-sm text-muted-foreground">No lift data yet</p>
            <p className="text-xs text-muted-foreground/60">Run experiments and enter results — Marko will track your weekly learning curve here.</p>
          </div>
        )}

        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Top Winning Experiments</p>
          {winnerInsights.length > 0 ? (
            winnerInsights.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground flex-1 truncate">{exp.name}</p>
                <span className="text-xs font-semibold text-emerald-400 shrink-0">
                  +{exp.lift}%
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground/60">
              No winners yet — experiments marked as &quot;winner&quot; will appear here with their lift.
            </p>
          )}
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

        <div className="grid grid-cols-4 gap-2.5">
          {brandIcons.map((int) => (
            <div
              key={int.label}
              title={int.label}
              className="flex items-center justify-center h-12 rounded-xl border border-border bg-secondary/40 hover:border-border hover:bg-secondary transition-colors cursor-pointer"
            >
              <BrandIcon si={int.si} label={int.label} size={20} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Connected",   value: connectedCount > 0 ? connectedCount.toString() : "0" },
            { label: "Total Ideas", value: totalIdeas.toString() },
            { label: "Experiments", value: totalCount.toString() },
          ].map((s) => (
            <div key={s.label} className="bg-secondary/50 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground/60">{s.label}</p>
              <p className="text-base font-bold text-foreground mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/integrations"
          className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/70 transition-colors mt-auto"
        >
          Browse all integrations
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </Link>
      </div>

    </div>
  )
}
