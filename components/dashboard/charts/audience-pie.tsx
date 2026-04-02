"use client"

import { DonutChart } from "@tremor/react"

interface AudiencePieProps {
  b2b: number
  b2c: number
}

export function AudiencePie({ b2b, b2c }: AudiencePieProps) {
  const data = [
    { name: "B2B", value: b2b },
    { name: "B2C", value: b2c },
  ]

  if (b2b === 0 && b2c === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        No ideas yet
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 h-full">
      <DonutChart
        className="h-full w-[60%]"
        data={data}
        category="value"
        index="name"
        colors={["blue", "pink"]}
        showAnimation
        showTooltip
      />
      <div className="flex flex-col gap-2.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: i === 0 ? "#60a5fa" : "#f472b6" }}
            />
            <span className="text-xs text-muted-foreground">
              {d.name}{" "}
              <span className="font-semibold text-foreground">{d.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
