"use client"

import { useMemo } from "react"
import { Clock, Calendar as CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CONTENT_CHANNEL_LABELS } from "@/lib/ui-config"
import {
  PUBLISHING_SCHEDULE,
  getDayName,
  formatTime,
  getNextOccurrence,
  type ScheduleSlot,
} from "@/lib/publishing-schedule"
import type { ContentAsset } from "@/lib/types"

interface Props {
  assets: ContentAsset[] // ready assets available to fill slots
}

interface CalendarDay {
  day: number
  dayName: string
  date: Date
  slots: Array<ScheduleSlot & { asset: ContentAsset | null }>
}

export function ContentCalendar({ assets }: Props) {
  const calendar = useMemo(() => {
    const now = new Date()
    const days = new Map<number, CalendarDay>()

    for (const slot of PUBLISHING_SCHEDULE) {
      const date = getNextOccurrence(slot, now)
      if (!days.has(slot.day)) {
        days.set(slot.day, {
          day: slot.day,
          dayName: getDayName(slot.day),
          date,
          slots: [],
        })
      }

      // Try to match a ready asset to this slot
      const asset = assets.find(
        a => a.channel === slot.channel && a.asset_type === slot.asset_type && a.status === "ready"
      ) ?? null

      days.get(slot.day)!.slots.push({ ...slot, asset })
    }

    // Sort by day of week starting from today
    const todayDay = now.getUTCDay()
    return Array.from(days.values()).sort((a, b) => {
      const aOffset = (a.day - todayDay + 7) % 7
      const bOffset = (b.day - todayDay + 7) % 7
      return aOffset - bOffset
    })
  }, [assets])

  const readyCount = assets.filter(a => a.status === "ready").length
  const filledSlots = calendar.reduce((acc, day) => acc + day.slots.filter(s => s.asset).length, 0)
  const totalSlots = PUBLISHING_SCHEDULE.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">This Week&apos;s Schedule</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {filledSlots}/{totalSlots} slots filled ({readyCount} assets ready)
        </span>
      </div>

      <div className="space-y-3">
        {calendar.map(day => (
          <Card key={day.day} className="py-0 overflow-hidden">
            {/* Day header */}
            <div className="px-4 py-2 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{day.dayName}</span>
                <span className="text-xs text-muted-foreground">
                  {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Time slots */}
            <div className="divide-y divide-border/30">
              {day.slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  {/* Time */}
                  <div className="flex items-center gap-1.5 w-20 shrink-0">
                    <Clock className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(slot.hour, slot.minute)}
                    </span>
                  </div>

                  {/* Channel badge */}
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {CONTENT_CHANNEL_LABELS[slot.channel] ?? slot.channel}
                  </Badge>

                  {/* Content or empty slot */}
                  <div className="flex-1 min-w-0">
                    {slot.asset ? (
                      <p className="text-xs truncate">
                        {slot.asset.title ?? slot.asset.body?.slice(0, 60) ?? slot.label}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/40 italic">
                        {slot.label} — no content yet
                      </p>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="shrink-0">
                    {slot.asset ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
