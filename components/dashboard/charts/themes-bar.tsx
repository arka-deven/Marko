"use client"

import { BarChart } from "@tremor/react"

interface ThemesBarProps {
  data: { theme: string; count: number }[]
}

export function ThemesBar({ data }: ThemesBarProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        No ideas this month
      </div>
    )
  }

  return (
    <BarChart
      className="h-full"
      data={data}
      index="theme"
      categories={["count"]}
      colors={["violet"]}
      showAnimation
      showGridLines={false}
      yAxisWidth={24}
      valueFormatter={(v) => String(v)}
    />
  )
}
