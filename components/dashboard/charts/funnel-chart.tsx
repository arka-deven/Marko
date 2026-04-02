"use client"

import { BarList } from "@tremor/react"

interface FunnelChartProps {
  data: { stage: string; label: string; count: number }[]
}

const STAGE_COLORS: Record<string, string> = {
  unaware: "violet",
  problem_aware: "blue",
  solution_aware: "emerald",
  product_aware: "amber",
  most_aware: "red",
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        No ideas yet
      </div>
    )
  }

  const barListData = data.map((d) => ({
    name: d.label,
    value: d.count,
    color: STAGE_COLORS[d.stage] ?? "gray",
  }))

  return (
    <div className="h-full flex flex-col justify-center">
      <BarList data={barListData} showAnimation />
    </div>
  )
}
