"use client"

import { useState } from "react"
import { Eye, ChevronDown, ChevronUp, Download, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { LeadMagnet, LeadMagnetFormat } from "@/lib/types"

interface FormatInfo {
  icon: string
  label: string
  description: string
}

interface StatusStyle {
  dot: string
  bg: string
  text: string
}

interface MagnetCardProps {
  magnet: LeadMagnet
  formatMeta: Record<LeadMagnetFormat, FormatInfo>
  statusStyles: Record<string, StatusStyle>
}

const STATUS_TRANSITIONS: Record<string, string> = {
  draft: "active",
  active: "paused",
  paused: "active",
  archived: "draft",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Activate",
  active: "Pause",
  paused: "Reactivate",
  archived: "Unarchive",
}

export function MagnetCard({ magnet, formatMeta, statusStyles }: MagnetCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(magnet.status)
  const [toggling, setToggling] = useState(false)

  const fmt = formatMeta[magnet.format]
  const sts = statusStyles[status] ?? statusStyles.draft

  const conversionColor =
    magnet.conversion_rate > 15 ? "text-emerald-400" :
    magnet.conversion_rate >= 5 ? "text-amber-400" : "text-red-400"

  const conversionBarColor =
    magnet.conversion_rate > 15 ? "bg-emerald-400" :
    magnet.conversion_rate >= 5 ? "bg-amber-400" : "bg-red-400"

  async function handleToggleStatus() {
    const next = STATUS_TRANSITIONS[status]
    if (!next) return
    setToggling(true)
    try {
      const res = await fetch(`/api/lead-magnets/${magnet.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) setStatus(next as LeadMagnet["status"])
    } catch {
      // silently fail
    } finally {
      setToggling(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-5 space-y-3">
        {/* Top row: format badge + status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{fmt.icon}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {fmt.label}
            </span>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full", sts.bg, sts.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", sts.dot)} />
            {status}
          </span>
        </div>

        {/* Title + headline */}
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{magnet.title}</h3>
          {magnet.landing_headline && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{magnet.landing_headline}</p>
          )}
        </div>

        {/* Principle + Audience badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {magnet.principle && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-400">
              {magnet.principle}
            </span>
          )}
          {magnet.audience && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-blue-400/10 text-blue-400 uppercase">
              {magnet.audience}
            </span>
          )}
        </div>

        {/* Performance metrics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {magnet.page_views.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            {magnet.downloads.toLocaleString()}
          </span>
          <span className={cn("inline-flex items-center gap-1 font-semibold", conversionColor)}>
            {magnet.conversion_rate.toFixed(1)}%
          </span>
        </div>

        {/* Conversion bar */}
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", conversionBarColor)}
            style={{ width: `${Math.min(magnet.conversion_rate, 100)}%` }}
          />
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Collapse" : "Preview"}
          </button>
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={toggling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {toggling ? "..." : STATUS_LABELS[status] ?? "Toggle"}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {magnet.landing_subheadline && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Subheadline</p>
              <p className="text-xs text-foreground/80">{magnet.landing_subheadline}</p>
            </div>
          )}
          {magnet.landing_bullets && magnet.landing_bullets.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Landing Bullets</p>
              <ul className="space-y-1">
                {magnet.landing_bullets.map((bullet, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5">-</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {magnet.content_body && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Content Body</p>
              <div className="text-xs text-foreground/70 whitespace-pre-wrap max-h-60 overflow-y-auto rounded-lg bg-secondary/50 p-3 border border-border">
                {magnet.content_body}
              </div>
            </div>
          )}
          {magnet.thank_you_cta && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Thank-You CTA</p>
              <p className="text-xs text-foreground/80">{magnet.thank_you_cta}</p>
            </div>
          )}
          {magnet.nurture_hook && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Nurture Hook</p>
              <p className="text-xs text-foreground/80">{magnet.nurture_hook}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
