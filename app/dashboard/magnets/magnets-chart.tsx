"use client"

import { BarList } from "@tremor/react"

interface ChartDatum {
  name: string
  downloads: number
}

export function MagnetsChart({ data }: { data: ChartDatum[] }) {
  const barListData = data.map((d, i) => ({
    name: d.name,
    value: d.downloads,
    color: i === 0 ? "zinc" : "gray",
  }))

  return (
    <div className="w-full h-[320px] flex flex-col justify-center">
      <BarList data={barListData} showAnimation />
    </div>
  )
}
