"use client"

import { BarChart, BarList } from "@tremor/react"

// ── Performance by Hook Type (Bar Chart) ────────────────────────────────────

interface HookData {
  hook: string
  score: number
  count: number
}

const HOOK_LABELS: Record<string, string> = {
  "stat-shock": "Stat Shock",
  "before-after": "Before/After",
  "myth-bust": "Myth Bust",
  "application": "Application",
  "dark-side": "Dark Side",
}

export function HookTypeChart({ data }: { data: HookData[] }) {
  const labeled = data.map((d) => ({ ...d, label: HOOK_LABELS[d.hook] ?? d.hook }))

  if (labeled.length === 0 || labeled.every((d) => d.score === 0)) {
    return <EmptyChart message="No hook type data yet" />
  }

  return (
    <BarChart
      className="h-[300px]"
      data={labeled}
      index="label"
      categories={["score"]}
      colors={["violet"]}
      showAnimation
      showGridLines
      yAxisWidth={32}
      valueFormatter={(v) => v.toFixed(1)}
    />
  )
}

// ── Performance by Theme (Horizontal Bar) ────────────────────────────────────

interface ThemeData {
  theme: string
  score: number
  count: number
}

const THEME_TREMOR_COLORS: Record<string, string> = {
  Reciprocity: "orange",
  Commitment: "yellow",
  "Social Proof": "emerald",
  Authority: "blue",
  Liking: "pink",
  Scarcity: "red",
  Unity: "violet",
  Contrast: "cyan",
}

export function ThemeChart({ data }: { data: ThemeData[] }) {
  if (data.length === 0 || data.every((d) => d.score === 0)) {
    return <EmptyChart message="No theme data yet" />
  }

  const sorted = [...data].sort((a, b) => b.score - a.score)

  const barListData = sorted.map((d) => ({
    name: d.theme,
    value: Math.round(d.score * 10) / 10,
    color: THEME_TREMOR_COLORS[d.theme] ?? "gray",
  }))

  return (
    <div className="h-[300px] flex flex-col justify-center">
      <BarList data={barListData} showAnimation valueFormatter={(v: number) => v.toFixed(1)} />
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground/30 mb-3"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  )
}
