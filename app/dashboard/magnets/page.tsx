import Link from "next/link"
import {
  Gift, Download, FileText, ClipboardList, BarChart3,
  BookOpen, Mail, Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { LeadMagnet, LeadMagnetFormat } from "@/lib/types"
import { MagnetsChart } from "./magnets-chart"
import { MagnetCard } from "./magnet-card"

// ── Format helpers ───────────────────────────────────────────────────────────

const formatMeta: Record<LeadMagnetFormat, { icon: string; label: string; description: string }> = {
  "cheat-sheet":    { icon: "\u{1F4C4}", label: "Cheat Sheet",     description: "One-page reference your audience keeps coming back to" },
  "template":       { icon: "\u{1F4CB}", label: "Template",        description: "Fill-in-the-blank framework that saves hours of work" },
  "assessment":     { icon: "\u{1F4CA}", label: "Assessment",      description: "Interactive quiz that reveals a personalized insight" },
  "case-study-pdf": { icon: "\u{1F4C8}", label: "Case Study PDF",  description: "Proof-driven story that builds trust and credibility" },
  "mini-course":    { icon: "\u{1F4E7}", label: "Mini-Course",     description: "Multi-part email series that educates and converts" },
}

const formatIcons: Record<LeadMagnetFormat, typeof FileText> = {
  "cheat-sheet":    FileText,
  "template":       ClipboardList,
  "assessment":     BarChart3,
  "case-study-pdf": BookOpen,
  "mini-course":    Mail,
}

const statusStyles: Record<string, { dot: string; bg: string; text: string }> = {
  draft:    { dot: "bg-zinc-500",    bg: "bg-zinc-500/10",    text: "text-zinc-400" },
  active:   { dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400" },
  paused:   { dot: "bg-amber-400",   bg: "bg-amber-400/10",   text: "text-amber-400" },
  archived: { dot: "bg-red-400",     bg: "bg-red-400/10",     text: "text-red-400" },
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LeadMagnetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const workspaceId = profile?.workspace_id

  const { data: magnets = [] } = await supabase
    .from("lead_magnets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  const typedMagnets = (magnets ?? []) as LeadMagnet[]

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalCount = typedMagnets.length
  const totalDownloads = typedMagnets.reduce((sum, m) => sum + (m.downloads ?? 0), 0)
  const activeCount = typedMagnets.filter((m) => m.status === "active").length

  const avgConversion = totalCount > 0
    ? typedMagnets.reduce((sum, m) => sum + (m.conversion_rate ?? 0), 0) / totalCount
    : 0

  // Format breakdown
  const formatCounts: Partial<Record<LeadMagnetFormat, number>> = {}
  for (const m of typedMagnets) {
    formatCounts[m.format] = (formatCounts[m.format] ?? 0) + 1
  }
  const breakdownParts = Object.entries(formatCounts).map(
    ([fmt, count]) => `${count} ${formatMeta[fmt as LeadMagnetFormat]?.label.toLowerCase()}${count !== 1 ? "s" : ""}`
  )
  const breakdownStr = breakdownParts.join(", ") || "No magnets yet"

  // Chart data
  const chartData = typedMagnets
    .filter((m) => m.downloads > 0)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 10)
    .map((m) => ({ name: m.title.length > 30 ? m.title.slice(0, 27) + "..." : m.title, downloads: m.downloads }))

  const conversionColor = avgConversion > 15 ? "text-emerald-400" : avgConversion >= 5 ? "text-amber-400" : "text-red-400"

  // ── Empty state ────────────────────────────────────────────────────────────

  if (totalCount === 0) {
    return (
      <div className="space-y-8">
        {/* Hero empty state */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
            <Gift className="w-7 h-7 text-foreground/60" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No lead magnets yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-2">
            Lead magnets are free resources so valuable people feel stupid saying no.
            They capture email addresses and grow your subscriber list.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Approve a lead magnet idea in the Inbox to generate your first one.
          </p>
          <Link
            href="/dashboard/ideas"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Inbox className="w-4 h-4" />
            Go to Inbox
          </Link>
        </div>

        {/* Format inspiration cards */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">5 formats you can create</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(Object.entries(formatMeta) as [LeadMagnetFormat, typeof formatMeta[LeadMagnetFormat]][]).map(([key, meta]) => {
              const Icon = formatIcons[key]
              return (
                <Card key={key} className="p-5 gap-3">
                  <CardContent className="flex flex-col gap-3 p-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                      <Icon className="w-4 h-4 text-foreground/60" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{meta.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Full page ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-5">
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Magnets</p>
            <p className="text-4xl font-black tracking-tighter text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground truncate">{breakdownStr}</p>
          </CardContent>
        </Card>

        <Card className={cn("py-5", totalDownloads > 0 && "border-emerald-500/30")}>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Downloads</p>
            <p className={cn("text-4xl font-black tracking-tighter", totalDownloads > 0 ? "text-emerald-400" : "text-foreground")}>
              {totalDownloads.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">across all magnets</p>
          </CardContent>
        </Card>

        <Card className="py-5">
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Avg Conversion</p>
            <p className={cn("text-4xl font-black tracking-tighter", conversionColor)}>
              {avgConversion.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {avgConversion > 15 ? "Excellent" : avgConversion >= 5 ? "Healthy" : "Needs work"}
            </p>
          </CardContent>
        </Card>

        <Card className={cn("py-5", activeCount > 0 && "border-emerald-500/30")}>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Active Magnets</p>
            <p className={cn("text-4xl font-black tracking-tighter", activeCount > 0 ? "text-emerald-400" : "text-foreground")}>
              {activeCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeCount === 1 ? "magnet" : "magnets"} live now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Magnet cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {typedMagnets.map((magnet) => (
          <MagnetCard
            key={magnet.id}
            magnet={magnet}
            formatMeta={formatMeta}
            statusStyles={statusStyles}
          />
        ))}
      </div>

      {/* Downloads chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-foreground/70" />
              </div>
              <div>
                <CardTitle className="text-sm">Downloads by Lead Magnet</CardTitle>
                <CardDescription className="text-xs">Top performers ranked by total downloads</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MagnetsChart data={chartData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
