"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getThemeForWeek, getISOWeek, AWARENESS_STAGES } from "@/lib/ai/cialdini-brand"

type GenerationState = "idle" | "generating" | "preview" | "sending" | "sent"

interface Newsletter {
  subject: string
  preview_text: string
  body_html: string
  theme: string
  cta_text: string
  delphiUsed: boolean
}

interface PublicationStats {
  activeSubscriptions: number | null
  averageOpenRate: number | null
  averageClickRate: number | null
  totalSent: number | null
}

interface PostStats {
  id: string
  title: string
  publishDate: string | null
  webUrl: string | null
  stats: {
    recipients: number | null
    openRate: number | null
    clickRate: number | null
    uniqueOpens: number | null
    unsubscribes: number | null
  }
}

interface AnalyticsData {
  configured: boolean
  publication: PublicationStats | null
  recent_posts: PostStats[]
}

const STAGE_LABELS: Record<string, string> = {
  unaware: "Unaware (60%)",
  problem_aware: "Problem Aware (20%)",
  solution_aware: "Solution Aware (10%)",
  product_aware: "Product Aware (7%)",
  most_aware: "Most Aware (3%)",
}

export default function NewsletterPage() {
  const isoWeek = getISOWeek(new Date())
  const currentTheme = getThemeForWeek(isoWeek)

  // Generator state
  const [state, setState] = useState<GenerationState>("idle")
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [awarenessStage, setAwarenessStage] = useState("solution_aware")
  const [customDirection, setCustomDirection] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [editingSource, setEditingSource] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Load analytics on mount
  useEffect(() => {
    fetch("/api/newsletter/analytics")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics({ configured: false, publication: null, recent_posts: [] }))
      .finally(() => setAnalyticsLoading(false))
  }, [])

  async function handleGenerate() {
    setState("generating")
    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awarenessStage,
          customDirection: showCustom && customDirection.trim() ? customDirection.trim() : undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Generation failed")
      }
      const data = await res.json()
      setNewsletter(data)
      setState("preview")
      toast.success("Newsletter generated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed")
      setState("idle")
    }
  }

  async function handleSend() {
    if (!newsletter) return
    setState("sending")
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newsletter.subject,
          preview_text: newsletter.preview_text,
          body_html: newsletter.body_html,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Send failed")
      }
      setState("sent")
      toast.success("Newsletter sent to Beehiiv as draft")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed")
      setState("preview")
    }
  }

  function handleReset() {
    setState("idle")
    setNewsletter(null)
    setEditingSource(false)
  }

  const pub = analytics?.publication

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Week {isoWeek} &middot; Delphi + Claude pipeline
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {currentTheme}
        </Badge>
      </div>

      {/* Generator */}
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-sm font-medium text-foreground">Generate Newsletter</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Controls — visible in idle/generating states */}
          {(state === "idle" || state === "generating") && (
            <>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">
                    Awareness Stage
                  </p>
                  <Select value={awarenessStage} onValueChange={setAwarenessStage}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AWARENESS_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_LABELS[stage] ?? stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={state === "generating"}
                  className="h-9"
                >
                  {state === "generating" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </span>
                  ) : "Generate Newsletter"}
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCustom ? "Hide custom direction" : "Add custom direction (optional)"}
              </button>

              {showCustom && (
                <Textarea
                  placeholder="e.g., Focus on how reciprocity applies to SaaS onboarding emails. Mention the Regan 1971 Coca-Cola experiment."
                  value={customDirection}
                  onChange={(e) => setCustomDirection(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              )}
            </>
          )}

          {/* Preview */}
          {(state === "preview" || state === "sending" || state === "sent") && newsletter && (
            <div className="space-y-4">
              {/* Subject + preview text */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Subject Line
                  </p>
                  <input
                    type="text"
                    value={newsletter.subject}
                    onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
                    disabled={state !== "preview"}
                    className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Preview Text
                  </p>
                  <input
                    type="text"
                    value={newsletter.preview_text}
                    onChange={(e) => setNewsletter({ ...newsletter, preview_text: e.target.value })}
                    disabled={state !== "preview"}
                    className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Body */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Body
                  </p>
                  {state === "preview" && (
                    <button
                      type="button"
                      onClick={() => setEditingSource(!editingSource)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {editingSource ? "Preview" : "Edit Source"}
                    </button>
                  )}
                </div>

                {editingSource ? (
                  <Textarea
                    value={newsletter.body_html}
                    onChange={(e) => setNewsletter({ ...newsletter, body_html: e.target.value })}
                    rows={16}
                    className="text-xs font-mono"
                  />
                ) : (
                  <div
                    className="bg-white rounded-lg p-6 max-h-[500px] overflow-y-auto text-sm"
                    style={{ color: "#1a1a1a" }}
                    dangerouslySetInnerHTML={{ __html: newsletter.body_html }}
                  />
                )}
              </div>

              {/* Meta badges */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">{newsletter.theme}</Badge>
                {newsletter.delphiUsed && (
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                    Delphi voice
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {state === "preview" && (
                  <>
                    <Button onClick={handleSend}>
                      Send to Beehiiv (Draft)
                    </Button>
                    <Button variant="outline" onClick={handleGenerate}>
                      Regenerate
                    </Button>
                    <Button variant="ghost" onClick={handleReset}>
                      Start Over
                    </Button>
                  </>
                )}
                {state === "sending" && (
                  <Button disabled>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    Sending...
                  </Button>
                )}
                {state === "sent" && (
                  <>
                    <Badge variant="secondary" className="text-emerald-500 text-xs py-1 px-3">
                      Sent to Beehiiv
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      Create Another
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analytics */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Newsletter Analytics</h2>

        {analyticsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : analytics && !analytics.configured ? (
          <Card className="gap-0 py-0">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Connect Beehiiv to see newsletter analytics.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add <code className="text-foreground/70">BEEHIIV_API_KEY</code> and{" "}
                <code className="text-foreground/70">BEEHIIV_PUBLICATION_ID</code> to your environment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="gap-0 py-0">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Subscribers
                  </p>
                  <p className={cn(
                    "text-3xl font-bold mt-1 tracking-tight",
                    pub?.activeSubscriptions ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    {pub?.activeSubscriptions ?? "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Avg Open Rate
                  </p>
                  <p className={cn(
                    "text-3xl font-bold mt-1 tracking-tight",
                    pub?.averageOpenRate ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    {pub?.averageOpenRate != null ? `${pub.averageOpenRate}%` : "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Avg Click Rate
                  </p>
                  <p className={cn(
                    "text-3xl font-bold mt-1 tracking-tight",
                    pub?.averageClickRate ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    {pub?.averageClickRate != null ? `${pub.averageClickRate}%` : "—"}
                  </p>
                </CardContent>
              </Card>

              <Card className="gap-0 py-0">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                    Emails Sent
                  </p>
                  <p className={cn(
                    "text-3xl font-bold mt-1 tracking-tight",
                    pub?.totalSent ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {pub?.totalSent ?? "—"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Newsletters */}
            <Card className="gap-0 py-0 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-sm font-medium text-foreground">Recent Newsletters</p>
              </div>
              {analytics?.recent_posts.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    No newsletters sent yet. Generate your first one above.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 text-[11px]">Newsletter</TableHead>
                      <TableHead className="px-4 text-[11px]">Date</TableHead>
                      <TableHead className="px-4 text-[11px] text-right">Recipients</TableHead>
                      <TableHead className="px-4 text-[11px] text-right">Open Rate</TableHead>
                      <TableHead className="px-4 text-[11px] text-right">Click Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.recent_posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="px-4 py-2.5 text-sm text-foreground/90 truncate max-w-[240px]">
                          {post.webUrl ? (
                            <a
                              href={post.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {post.title}
                            </a>
                          ) : post.title}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                          {post.publishDate
                            ? new Date(post.publishDate).toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-muted-foreground text-right">
                          {post.stats.recipients ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-right">
                          <span className={cn(
                            post.stats.openRate != null && post.stats.openRate > 30
                              ? "text-emerald-500" : "text-muted-foreground"
                          )}>
                            {post.stats.openRate != null ? `${post.stats.openRate}%` : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-2.5 text-xs text-right">
                          <span className={cn(
                            post.stats.clickRate != null && post.stats.clickRate > 5
                              ? "text-emerald-500" : "text-muted-foreground"
                          )}>
                            {post.stats.clickRate != null ? `${post.stats.clickRate}%` : "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
