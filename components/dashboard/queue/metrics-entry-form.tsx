"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ContentChannel } from "@/lib/types"

interface Props {
  assetId: string
  channel: ContentChannel
  existingMetrics?: {
    impressions?: number
    clicks?: number
    likes?: number
    comments?: number
    shares?: number
    saves?: number
    replies?: number
    email_captures?: number
    book_clicks?: number
    training_inquiries?: number
  }
  onSaved?: () => void
}

// Channel-specific field configs
const CHANNEL_FIELDS: Record<string, string[]> = {
  LinkedIn: ["impressions", "clicks", "likes", "comments", "shares", "saves"],
  Email: ["impressions", "clicks", "replies", "email_captures"],
  Blog: ["impressions", "clicks", "shares", "email_captures"],
  Twitter: ["impressions", "clicks", "likes", "shares"],
  Video: ["impressions", "clicks", "likes", "comments", "shares"],
  default: ["impressions", "clicks", "likes", "comments", "shares", "saves"],
}

const FIELD_LABELS: Record<string, string> = {
  impressions: "Impressions",
  clicks: "Clicks",
  likes: "Likes",
  comments: "Comments",
  shares: "Shares / Reposts",
  saves: "Saves / Bookmarks",
  replies: "Replies",
  email_captures: "Email signups",
  book_clicks: "Book link clicks",
  training_inquiries: "Training inquiries",
}

export function MetricsEntryForm({ assetId, channel, existingMetrics, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    if (existingMetrics) {
      for (const [key, val] of Object.entries(existingMetrics)) {
        if (val != null) initial[key] = val
      }
    }
    return initial
  })

  const fields = CHANNEL_FIELDS[channel] ?? CHANNEL_FIELDS.default

  function handleChange(field: string, raw: string) {
    const num = parseInt(raw, 10)
    if (isNaN(num) || num < 0) {
      const next = { ...values }
      delete next[field]
      setValues(next)
    } else {
      setValues({ ...values, [field]: num })
    }
  }

  async function handleSave() {
    if (Object.keys(values).length === 0) {
      toast.error("Enter at least one metric")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/content/${assetId}/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to save metrics")
        return
      }
      toast.success("Metrics saved")
      onSaved?.()
    } catch {
      toast.error("Failed to save metrics")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
      <p className="text-sm font-medium text-foreground">Log Performance</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field} className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              {FIELD_LABELS[field] ?? field}
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={values[field] ?? ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Conversion fields (always shown, collapsed) */}
      {!fields.includes("email_captures") && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Email signups</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={values.email_captures ?? ""}
              onChange={(e) => handleChange("email_captures", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Training inquiries</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={values.training_inquiries ?? ""}
              onChange={(e) => handleChange("training_inquiries", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        {existingMetrics ? "Update Metrics" : "Save Metrics"}
      </Button>
    </div>
  )
}
