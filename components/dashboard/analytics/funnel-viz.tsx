"use client"

import { BarChart } from "@tremor/react"

// ── Schwartz Awareness Funnel ────────────────────────────────────────────────

export interface FunnelStageData {
  stage: string
  label: string
  ideaCount: number
  contentCount: number
  avgEngagement: number
  conversionRate: number
}

const STAGE_COLORS = [
  "#22c55e", // unaware — green
  "#84cc16", // problem_aware — lime
  "#eab308", // solution_aware — yellow
  "#f97316", // product_aware — orange
  "#ef4444", // most_aware — red
]

export function SchwartzFunnel({ stages }: { stages: FunnelStageData[] }) {
  const hasData = stages.some((s) => s.ideaCount > 0 || s.contentCount > 0)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30 mb-3"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><path d="M6 10h12"/></svg>
        <p className="text-xs text-muted-foreground">No funnel data yet — create ideas across awareness stages</p>
      </div>
    )
  }

  const maxIdeas = Math.max(...stages.map((s) => s.ideaCount), 1)

  return (
    <div className="space-y-3">
      {/* Horizontal funnel bars */}
      <div className="flex gap-2 items-end">
        {stages.map((stage, i) => {
          const widthPct = 100 - i * 12 // Each stage narrows
          return (
            <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {stage.label}
                </p>
              </div>
              <div
                className="w-full rounded-lg transition-all relative overflow-hidden"
                style={{
                  backgroundColor: STAGE_COLORS[i],
                  opacity: 0.8,
                  height: Math.max(40, (stage.ideaCount / maxIdeas) * 120),
                  maxWidth: `${widthPct}%`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {stage.ideaCount}
                  </span>
                </div>
              </div>
              <div className="text-center space-y-0.5">
                <p className="text-[10px] text-muted-foreground">
                  {stage.contentCount} content
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {stage.avgEngagement.toFixed(1)} eng
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Arrow indicator */}
      <div className="flex items-center justify-center gap-1 py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-red-500/40" />
        <span className="text-[10px] text-muted-foreground px-2">Awareness Journey</span>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-red-500/40" />
      </div>
    </div>
  )
}

// ── Value Ladder ─────────────────────────────────────────────────────────────

export interface LadderStepData {
  position: string
  label: string
  contentCount: number
  conversionRate: number
}

const LADDER_COLORS = ["#3b82f6", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444"]

export function ValueLadder({ steps }: { steps: LadderStepData[] }) {
  const hasData = steps.some((s) => s.contentCount > 0)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30 mb-3"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10"/><path d="M9 8h6"/><path d="M10 12h4"/></svg>
        <p className="text-xs text-muted-foreground">No value ladder data yet</p>
      </div>
    )
  }

  // Show as vertical steps, widest at top (ToF) narrowest at bottom (high ticket)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const widthPct = 100 - i * 15
        return (
          <div key={step.position} className="flex items-center gap-3">
            <div className="w-24 text-right">
              <p className="text-xs font-medium text-foreground/80">{step.label}</p>
            </div>
            <div className="flex-1 relative">
              <div
                className="h-9 rounded-md flex items-center px-3 transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: LADDER_COLORS[i],
                  opacity: 0.75,
                }}
              >
                <span className="text-xs font-semibold text-white">
                  {step.contentCount} pieces
                </span>
              </div>
            </div>
            <div className="w-20 text-right">
              {i < steps.length - 1 && (
                <span className="text-[10px] text-muted-foreground">
                  {step.conversionRate.toFixed(1)}% next
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Funnel Balance Chart ─────────────────────────────────────────────────────

export interface BalanceData {
  stage: string
  target: number
  actual: number
}

export function FunnelBalanceChart({ data }: { data: BalanceData[] }) {
  if (data.length === 0 || data.every((d) => d.actual === 0 && d.target === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] text-center">
        <p className="text-xs text-muted-foreground">No balance data yet</p>
      </div>
    )
  }

  return (
    <BarChart
      className="h-[240px]"
      data={data}
      index="stage"
      categories={["target", "actual"]}
      colors={["blue", "emerald"]}
      showAnimation
      showGridLines
      yAxisWidth={32}
    />
  )
}
