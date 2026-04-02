"use client"

import { AreaChart, BarChart } from "@tremor/react"

// ── Content Published Over Time (Area Chart) ────────────────────────────────

interface WeeklyData {
  week: string
  count: number
}

export function ContentOverTimeChart({ data }: { data: WeeklyData[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return <EmptyChart message="No content published yet" />
  }

  return (
    <AreaChart
      className="h-[260px]"
      data={data}
      index="week"
      categories={["count"]}
      colors={["zinc"]}
      showAnimation
      showGridLines
      yAxisWidth={32}
      curveType="monotone"
      valueFormatter={(v) => String(v)}
    />
  )
}

// ── Engagement by Channel (Bar Chart) ────────────────────────────────────────

interface ChannelEngagement {
  channel: string
  score: number
}

export function EngagementByChannelChart({ data }: { data: ChannelEngagement[] }) {
  if (data.length === 0 || data.every((d) => d.score === 0)) {
    return <EmptyChart message="No engagement data yet" />
  }

  return (
    <BarChart
      className="h-[260px]"
      data={data}
      index="channel"
      categories={["score"]}
      colors={["zinc"]}
      showAnimation
      showGridLines
      yAxisWidth={32}
      valueFormatter={(v) => v.toFixed(1)}
    />
  )
}

// ── Shared empty state ───────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[260px] text-center">
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
