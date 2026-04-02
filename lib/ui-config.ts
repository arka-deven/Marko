// ─────────────────────────────────────────────────────────────────────────────
// Shared UI configuration — single source of truth for all dashboard styling
// Import this instead of defining color/badge/status maps in each component.
// ─────────────────────────────────────────────────────────────────────────────

import type { AwarenessStage, LadderPosition, IdeaAudience, IdeaHookType } from "@/lib/types"

// ── Status colors (4 only: success, warning, error, info) ──────────────────

export const STATUS_STYLES = {
  generating: { dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-400/10",   label: "Generating" },
  ready:      { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10", label: "Ready" },
  published:  { dot: "bg-blue-400",    text: "text-blue-400",    bg: "bg-blue-400/10",    label: "Published" },
  failed:     { dot: "bg-red-400",     text: "text-red-400",     bg: "bg-red-400/10",     label: "Failed" },
  active:     { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10", label: "Active" },
  paused:     { dot: "bg-amber-400",   text: "text-amber-400",   bg: "bg-amber-400/10",   label: "Paused" },
  draft:      { dot: "bg-zinc-400",    text: "text-zinc-400",    bg: "bg-zinc-400/10",    label: "Draft" },
  archived:   { dot: "bg-zinc-500",    text: "text-zinc-500",    bg: "bg-zinc-500/10",    label: "Archived" },
} as const

// ── Audience (2 only) ──────────────────────────────────────────────────────

export const AUDIENCE_STYLES: Record<IdeaAudience, { label: string; text: string; bg: string; border: string }> = {
  b2b: { label: "B2B", text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  b2c: { label: "B2C", text: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20" },
}

// ── Awareness stages (green → red gradient, 5 steps) ──────────────────────

export const AWARENESS_STYLES: Record<AwarenessStage, {
  label: string
  short: string
  text: string
  bg: string
  border: string
  borderLeft: string
}> = {
  unaware:        { label: "Unaware",        short: "TOFU", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", borderLeft: "border-l-emerald-400" },
  problem_aware:  { label: "Problem Aware",  short: "PROB", text: "text-lime-400",    bg: "bg-lime-400/10",    border: "border-lime-400/20",    borderLeft: "border-l-lime-400" },
  solution_aware: { label: "Solution Aware", short: "SOL",  text: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20",  borderLeft: "border-l-yellow-400" },
  product_aware:  { label: "Product Aware",  short: "PROD", text: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20",  borderLeft: "border-l-orange-400" },
  most_aware:     { label: "Most Aware",     short: "CONV", text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20",     borderLeft: "border-l-red-400" },
}

// ── Value ladder ───────────────────────────────────────────────────────────

export const LADDER_STYLES: Record<LadderPosition, { label: string }> = {
  top_of_funnel: { label: "Free" },
  lead_magnet:   { label: "Lead Magnet" },
  low_ticket:    { label: "Book" },
  mid_ticket:    { label: "Workshop" },
  high_ticket:   { label: "Keynote" },
}

// ── Hook types ─────────────────────────────────────────────────────────────

export const HOOK_LABELS: Record<IdeaHookType, string> = {
  "stat-shock":   "Stat Shock",
  "before-after": "Before/After",
  "myth-bust":    "Myth Bust",
  "application":  "Application",
  "dark-side":    "Dark Side",
}

// ── Channels (use secondary palette — no unique colors per channel) ────────

export const CHANNEL_STYLES: Record<string, { label: string }> = {
  Social:   { label: "Social" },
  Email:    { label: "Email" },
  Web:      { label: "Web" },
  Paid:     { label: "Paid" },
  Push:     { label: "Push" },
}

// ── Content channels (for queue display) ───────────────────────────────────

export const CONTENT_CHANNEL_LABELS: Record<string, string> = {
  LinkedIn: "LinkedIn",
  Email:    "Email",
  Blog:     "Blog",
  Video:    "Video",
  Twitter:  "Twitter",
  Ad:       "Ad",
  Podcast:  "Podcast",
  Push:     "Push",
}

// ── Effort ─────────────────────────────────────────────────────────────────

export const EFFORT_STYLES: Record<string, { text: string; bg: string }> = {
  Low:    { text: "text-emerald-400", bg: "bg-emerald-400/10" },
  Medium: { text: "text-amber-400",   bg: "bg-amber-400/10" },
  High:   { text: "text-red-400",     bg: "bg-red-400/10" },
}

// ── AI quality grades ──────────────────────────────────────────────────────

export const GRADE_STYLES: Record<string, { text: string; bg: string }> = {
  A: { text: "text-emerald-400", bg: "bg-emerald-400/10" },
  B: { text: "text-blue-400",    bg: "bg-blue-400/10" },
  C: { text: "text-amber-400",   bg: "bg-amber-400/10" },
  D: { text: "text-orange-400",  bg: "bg-orange-400/10" },
  F: { text: "text-red-400",     bg: "bg-red-400/10" },
}

// ── Lead magnet formats (Lucide icon names — no emojis) ────────────────────

export const MAGNET_FORMAT_LABELS: Record<string, { label: string }> = {
  "cheat-sheet":    { label: "Cheat Sheet" },
  "template":       { label: "Template" },
  "assessment":     { label: "Assessment" },
  "case-study-pdf": { label: "Case Study" },
  "mini-course":    { label: "Mini-Course" },
}

// ── Actor badges ───────────────────────────────────────────────────────────

export const ACTOR_STYLES: Record<string, { text: string; bg: string }> = {
  engine: { text: "text-violet-400", bg: "bg-violet-400/10" },
  admin:  { text: "text-muted-foreground", bg: "bg-secondary" },
}

// ── Recharts theme (use CSS variables for dark/light compatibility) ─────────

export const RECHARTS_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "hsl(var(--foreground))" },
  itemStyle: { color: "hsl(var(--foreground))" },
  cursor: { fill: "hsl(var(--secondary))" },
} as const

// Chart colors — use sparingly
export const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  muted: "hsl(var(--muted-foreground))",
  // Awareness gradient (green → red)
  awareness: ["#34d399", "#a3e635", "#facc15", "#fb923c", "#f87171"],
  // B2B vs B2C
  audience: ["#8b5cf6", "#38bdf8"],
}
