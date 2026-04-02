import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

function formatDate(d: string | null) {
  if (!d) return "---"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
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
    { data: publishedContent = [] },
    { data: perfRows = [] },
  ] = await Promise.all([
    supabase
      .from("content_assets")
      .select("id, title, channel, asset_type, published_at, idea_id")
      .eq("workspace_id", workspaceId)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("content_performance")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
  ])

  const allPublished = publishedContent ?? []
  const allPerf = perfRows ?? []
  const perfMap = new Map(allPerf.map((p: any) => [p.content_asset_id, p]))

  const withMetrics = allPublished.filter((c: any) => perfMap.has(c.id))
  const withoutMetrics = allPublished.filter((c: any) => !perfMap.has(c.id))

  const totalPublished = allPublished.length
  const totalImpressions = allPerf.reduce((s: number, p: any) => s + (p.impressions ?? 0), 0)
  const totalClicks = allPerf.reduce((s: number, p: any) => s + (p.clicks ?? 0), 0)
  const avgEngagement = allPerf.length > 0
    ? (allPerf.reduce((s: number, p: any) => s + (p.engagement_quality_score ?? 0), 0) / allPerf.length).toFixed(1)
    : "0"
  const totalConversions = allPerf.reduce(
    (s: number, p: any) => s + (p.email_captures ?? 0) + (p.training_inquiries ?? 0) + (p.cmct_inquiries ?? 0),
    0
  )

  const hasAnyData = allPerf.length > 0

  return (
    <div className="space-y-5 w-full">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Content performance and conversions.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Published" value={totalPublished} />
        <MetricCard
          label="Impressions"
          value={hasAnyData ? formatNum(totalImpressions) : "---"}
          sub={hasAnyData ? `${formatNum(totalClicks)} clicks` : "log metrics to see data"}
        />
        <MetricCard
          label="Engagement"
          value={hasAnyData ? avgEngagement : "---"}
          positive={hasAnyData && parseFloat(avgEngagement) > 0}
          sub={hasAnyData ? `across ${allPerf.length} pieces` : "avg quality score"}
        />
        <MetricCard
          label="Conversions"
          value={hasAnyData ? totalConversions : "---"}
          sub="signups + inquiries"
        />
      </div>

      {/* Content with metrics */}
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-sm font-medium text-foreground">Content Performance</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {withMetrics.length > 0
              ? "Real metrics from published content"
              : "Publish content and log metrics to see data"}
          </p>
        </div>
        {withMetrics.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">No performance data yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Go to the{" "}
              <Link href="/dashboard/queue" className="text-foreground/70 font-medium hover:underline">
                Content Queue
              </Link>
              {" "}to publish and log metrics.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 text-[11px]">Title</TableHead>
                <TableHead className="px-4 text-[11px]">Channel</TableHead>
                <TableHead className="px-4 text-[11px]">Published</TableHead>
                <TableHead className="px-4 text-[11px] text-right">Impressions</TableHead>
                <TableHead className="px-4 text-[11px] text-right">Clicks</TableHead>
                <TableHead className="px-4 text-[11px] text-right">Engagement</TableHead>
                <TableHead className="px-4 text-[11px] text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withMetrics.map((asset: any) => {
                const p = perfMap.get(asset.id) as any
                const conversions = (p?.email_captures ?? 0) + (p?.training_inquiries ?? 0) + (p?.cmct_inquiries ?? 0)
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="px-4 py-2.5 text-sm font-medium text-foreground truncate max-w-[200px]">
                      {asset.title ?? "Untitled"}
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <Badge variant="secondary" className="text-[10px]">{asset.channel}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-xs text-muted-foreground">
                      {formatDate(asset.published_at)}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm font-semibold text-right">
                      {formatNum(p?.impressions ?? 0)}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-right">
                      {formatNum(p?.clicks ?? 0)}
                    </TableCell>
                    <TableCell className={cn(
                      "px-4 py-2.5 text-sm font-semibold text-right",
                      (p?.engagement_quality_score ?? 0) > 10 ? "text-emerald-500" : "text-foreground"
                    )}>
                      {(p?.engagement_quality_score ?? 0).toFixed(1)}
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-sm text-right">
                      {conversions > 0 ? conversions : "---"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Content missing metrics */}
      {withoutMetrics.length > 0 && (
        <Card className="gap-0 py-0 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-foreground">Needs Metrics</p>
            <p className="text-xs text-muted-foreground">
              {withoutMetrics.length} published {withoutMetrics.length === 1 ? "piece" : "pieces"} without data
            </p>
          </div>
          <Table>
            <TableBody>
              {withoutMetrics.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell className="px-4 py-2.5">
                    <p className="text-sm text-foreground/90 truncate">{asset.title ?? "Untitled"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {asset.channel} &middot; published {formatDate(asset.published_at)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-right">
                    <Link
                      href="/dashboard/queue"
                      className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                    >
                      Log metrics
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  positive,
  sub,
}: {
  label: string
  value: number | string
  positive?: boolean
  sub?: string
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={cn(
          "text-2xl font-bold mt-1 tracking-tight",
          positive ? "text-emerald-500" : "text-foreground"
        )}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}
