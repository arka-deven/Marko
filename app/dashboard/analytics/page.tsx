import Link from "next/link"
import {
  TrendingUp, TrendingDown, ArrowRight,
  Linkedin, Mail, Globe, Video, Twitter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const CHANNEL_ICON: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  Email: Mail,
  Blog: Globe,
  Video: Video,
  Twitter: Twitter,
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const workspaceId = profile?.workspace_id

  const [
    { data: allAssets = [] },
    { data: perfRows = [] },
    { count: totalIdeas },
    { count: approvedIdeas },
  ] = await Promise.all([
    supabase
      .from("content_assets")
      .select("id, title, channel, asset_type, status, published_at, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("content_performance")
      .select("content_asset_id, impressions, clicks, likes, comments, shares, saves, engagement_quality_score")
      .eq("workspace_id", workspaceId),
    supabase
      .from("ideas")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("ideas")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "approved"),
  ])

  const assets = allAssets ?? []
  const perf = perfRows ?? []
  const perfMap = new Map(perf.map((p: any) => [p.content_asset_id, p]))

  const published = assets.filter((a: any) => a.status === "published")
  const ready = assets.filter((a: any) => a.status === "ready")
  const generating = assets.filter((a: any) => a.status === "generating")
  const failed = assets.filter((a: any) => a.status === "failed")

  // Aggregate performance
  const totalImpressions = perf.reduce((s: number, p: any) => s + (p.impressions ?? 0), 0)
  const totalClicks = perf.reduce((s: number, p: any) => s + (p.clicks ?? 0), 0)
  const totalEngagement = perf.reduce((s: number, p: any) => s + (p.engagement_quality_score ?? 0), 0)
  const avgEngagement = perf.length > 0 ? Math.round(totalEngagement / perf.length) : 0
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0"

  // Channel breakdown
  const channelNames = ["LinkedIn", "Email", "Blog", "Video", "Twitter"]
  const channelData = channelNames.map(ch => {
    const chAssets = assets.filter((a: any) => a.channel === ch)
    const chPublished = chAssets.filter((a: any) => a.status === "published")
    const chPerf = chPublished
      .map((a: any) => perfMap.get(a.id))
      .filter(Boolean)
    const impressions = chPerf.reduce((s: number, p: any) => s + (p.impressions ?? 0), 0)
    const clicks = chPerf.reduce((s: number, p: any) => s + (p.clicks ?? 0), 0)
    const engagement = chPerf.reduce((s: number, p: any) => s + (p.engagement_quality_score ?? 0), 0)
    const avgEng = chPerf.length > 0 ? Math.round(engagement / chPerf.length) : 0
    return {
      channel: ch,
      total: chAssets.length,
      published: chPublished.length,
      impressions,
      clicks,
      avgEngagement: avgEng,
    }
  }).filter(c => c.total > 0)

  // Top performing content (by engagement score)
  const topContent = published
    .map((a: any) => {
      const p = perfMap.get(a.id) as any
      return { ...a, perf: p }
    })
    .filter((a: any) => a.perf)
    .sort((a: any, b: any) => (b.perf.engagement_quality_score ?? 0) - (a.perf.engagement_quality_score ?? 0))
    .slice(0, 5)

  // Weekly content output (last 8 weeks)
  const now = new Date()
  const weeklyOutput = Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() - i * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 7)
    const count = assets.filter((a: any) => {
      const d = new Date(a.created_at)
      return d >= weekStart && d <= weekEnd
    }).length
    return { label: `W${8 - i}`, count }
  }).reverse()

  const maxWeekly = Math.max(...weeklyOutput.map(w => w.count), 1)

  const hasData = assets.length > 0

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Content performance and pipeline health.</p>
      </div>

      {!hasData ? (
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground">
              Approve ideas and publish content to see analytics here.
            </p>
            <Link
              href="/dashboard/ideas"
              className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 mt-2"
            >
              Go to Inbox <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key metrics — green/red only */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Content" value={assets.length} />
            <MetricCard label="Published" value={published.length} positive={published.length > 0} />
            <MetricCard
              label="Impressions"
              value={totalImpressions.toLocaleString()}
              positive={totalImpressions > 0}
            />
            <MetricCard
              label="CTR"
              value={`${ctr}%`}
              positive={parseFloat(ctr) > 1}
              negative={parseFloat(ctr) < 0.5 && totalImpressions > 100}
            />
          </div>

          {/* Pipeline status */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Generating" value={generating.length} />
            <MetricCard label="Ready to Publish" value={ready.length} positive={ready.length > 0} />
            <MetricCard label="Avg Engagement" value={avgEngagement} positive={avgEngagement > 50} />
            <MetricCard
              label="Failed"
              value={failed.length}
              negative={failed.length > 0}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Weekly output bar chart — green bars */}
            <Card className="gap-0 py-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">Weekly Content Output</p>
                <p className="text-xs text-muted-foreground mt-0.5">Last 8 weeks</p>
              </div>
              <div className="px-5 py-5">
                <div className="flex items-end gap-2 h-32">
                  {weeklyOutput.map((w) => (
                    <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                      {w.count > 0 && (
                        <span className="text-[10px] font-medium text-foreground">{w.count}</span>
                      )}
                      <div
                        className={cn(
                          "w-full rounded-t transition-all",
                          w.count > 0 ? "bg-emerald-500/80" : "bg-muted/30"
                        )}
                        style={{
                          height: w.count > 0
                            ? `${Math.max((w.count / maxWeekly) * 100, 8)}%`
                            : "4%",
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">{w.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Top performing content */}
            <Card className="gap-0 py-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">Top Performing</p>
                <p className="text-xs text-muted-foreground mt-0.5">By engagement score</p>
              </div>
              {topContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No performance data yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {topContent.map((item: any) => {
                    const Icon = CHANNEL_ICON[item.channel] ?? Globe
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/90 truncate">
                            {item.title ?? `${item.channel} ${item.asset_type}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {(item.perf.impressions ?? 0).toLocaleString()} views
                        </span>
                        <span className={cn(
                          "text-xs font-semibold shrink-0",
                          (item.perf.engagement_quality_score ?? 0) >= 50 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {item.perf.engagement_quality_score ?? 0}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Channel breakdown table */}
          {channelData.length > 0 && (
            <Card className="gap-0 py-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">Performance by Channel</p>
              </div>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead className="px-5 text-[10px] uppercase tracking-widest">Channel</TableHead>
                      <TableHead className="px-5 text-right text-[10px] uppercase tracking-widest">Total</TableHead>
                      <TableHead className="px-5 text-right text-[10px] uppercase tracking-widest">Published</TableHead>
                      <TableHead className="px-5 text-right text-[10px] uppercase tracking-widest">Impressions</TableHead>
                      <TableHead className="px-5 text-right text-[10px] uppercase tracking-widest">Clicks</TableHead>
                      <TableHead className="px-5 text-right text-[10px] uppercase tracking-widest">Avg Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelData.map(row => {
                      const Icon = CHANNEL_ICON[row.channel] ?? Globe
                      return (
                        <TableRow key={row.channel}>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium text-foreground/90">{row.channel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-5 py-3 text-muted-foreground">{row.total}</TableCell>
                          <TableCell className="text-right px-5 py-3 text-muted-foreground">{row.published}</TableCell>
                          <TableCell className="text-right px-5 py-3 text-muted-foreground">{row.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right px-5 py-3 text-muted-foreground">{row.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right px-5 py-3">
                            <span className={cn(
                              "font-semibold",
                              row.avgEngagement >= 50 ? "text-emerald-500" : row.avgEngagement > 0 ? "text-red-500" : "text-muted-foreground"
                            )}>
                              {row.avgEngagement > 0 ? row.avgEngagement : "—"}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
          )}

          {/* Funnel conversion */}
          <Card className="gap-0 py-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-medium text-foreground">Pipeline Funnel</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ideas to published content conversion</p>
            </div>
            <div className="px-5 py-5">
              <div className="flex items-center gap-3">
                {[
                  { label: "Ideas", value: totalIdeas ?? 0, color: "bg-foreground/20" },
                  { label: "Approved", value: approvedIdeas ?? 0, color: "bg-foreground/40" },
                  { label: "Content Created", value: assets.length, color: "bg-emerald-500/40" },
                  { label: "Published", value: published.length, color: "bg-emerald-500" },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={cn("w-full rounded h-8 flex items-center justify-center", step.color)}
                    >
                      <span className="text-xs font-bold text-foreground">{step.value}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">{step.label}</p>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 absolute" style={{ display: "none" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: number | string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={cn(
          "text-2xl font-bold mt-1 tracking-tight",
          negative ? "text-red-500" : positive ? "text-emerald-500" : "text-foreground"
        )}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
