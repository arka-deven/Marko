// ─────────────────────────────────────────────────────────────────────────────
// Publishing schedule — defines when each channel's content goes out.
// Used by the content calendar view and the batch publish scheduler.
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleSlot {
  channel: string
  asset_type: string
  day: number      // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  hour: number     // 0-23 UTC
  minute: number   // 0-59
  label: string    // Human-readable label like "LinkedIn Post"
}

// Default publishing schedule — optimized for engagement by channel
export const PUBLISHING_SCHEDULE: ScheduleSlot[] = [
  // Monday — LinkedIn + Newsletter
  { channel: "LinkedIn", asset_type: "post",   day: 1, hour: 9,  minute: 0,  label: "LinkedIn Post" },
  { channel: "Email",    asset_type: "email",  day: 1, hour: 10, minute: 0,  label: "Newsletter" },

  // Tuesday — Twitter thread
  { channel: "Twitter",  asset_type: "thread", day: 2, hour: 12, minute: 0,  label: "Twitter Thread" },

  // Wednesday — LinkedIn + Video
  { channel: "LinkedIn", asset_type: "post",   day: 3, hour: 9,  minute: 0,  label: "LinkedIn Post" },
  { channel: "Video",    asset_type: "video",  day: 3, hour: 14, minute: 0,  label: "Video Drop" },

  // Thursday — Blog
  { channel: "Blog",     asset_type: "blog",   day: 4, hour: 8,  minute: 0,  label: "Blog Post" },

  // Friday — LinkedIn + Twitter
  { channel: "LinkedIn", asset_type: "post",   day: 5, hour: 9,  minute: 0,  label: "LinkedIn Post" },
  { channel: "Twitter",  asset_type: "thread", day: 5, hour: 13, minute: 0,  label: "Twitter Thread" },
]

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function getDayName(day: number): string {
  return DAY_NAMES[day] ?? "Unknown"
}

export function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  const m = minute.toString().padStart(2, "0")
  return `${h}:${m} ${ampm}`
}

/** Group schedule slots by day of week */
export function getScheduleByDay(): Map<number, ScheduleSlot[]> {
  const byDay = new Map<number, ScheduleSlot[]>()
  for (const slot of PUBLISHING_SCHEDULE) {
    const existing = byDay.get(slot.day) ?? []
    existing.push(slot)
    byDay.set(slot.day, existing)
  }
  return byDay
}

/** Get the next occurrence of a schedule slot from a given date */
export function getNextOccurrence(slot: ScheduleSlot, from: Date = new Date()): Date {
  const next = new Date(from)
  next.setUTCHours(slot.hour, slot.minute, 0, 0)

  const currentDay = from.getUTCDay()
  let daysUntil = slot.day - currentDay
  if (daysUntil < 0) daysUntil += 7
  if (daysUntil === 0 && from > next) daysUntil = 7

  next.setUTCDate(next.getUTCDate() + daysUntil)
  return next
}

/** Get all upcoming slots for the next 7 days, with dates */
export function getUpcomingSlots(from: Date = new Date()): Array<ScheduleSlot & { date: Date }> {
  const slots: Array<ScheduleSlot & { date: Date }> = []

  for (const slot of PUBLISHING_SCHEDULE) {
    const date = getNextOccurrence(slot, from)
    const diffDays = (date.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 7) {
      slots.push({ ...slot, date })
    }
  }

  return slots.sort((a, b) => a.date.getTime() - b.date.getTime())
}
