import Link from "next/link"
import {
  Inbox, Layers, ArrowRight, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { GenerateDialog } from "@/components/dashboard/ideas/generate-dialog"

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id, full_name")
    .eq("id", user!.id)
    .single()

  const workspaceId = profile?.workspace_id
  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  const [
    { count: pendingCount },
    { count: readyCount },
    { count: publishedCount },
    { data: recentAssets = [] },
    { data: recentLogs = [] },
  ] = await Promise.all([
    supabase
      .from("ideas")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .in("status", ["queued", "ready"]),
    supabase
      .from("content_assets")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "ready"),
    supabase
      .from("content_assets")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "published"),
    supabase
      .from("content_assets")
      .select("id, title, channel, asset_type, status, updated_at, published_at")
      .eq("workspace_id", workspaceId)
      .in("status", ["generating", "ready", "published", "failed"])
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("logs")
      .select("id, action, description, entity_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const pending = pendingCount ?? 0
  const ready = readyCount ?? 0
  const published = publishedCount ?? 0
  const assets = recentAssets ?? []
  const logs = recentLogs ?? []

  const isNewUser = pending === 0 && ready === 0 && published === 0

  if (isNewUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-6">
          <Sparkles className="w-7 h-7 text-foreground/60" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome, {firstName}</h1>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Marko is your AI growth engine. Generate your first batch of content ideas to get started.
        </p>
        <GenerateDialog />
        <p className="text-xs text-muted-foreground mt-6">
          Ideas will appear in the{" "}
          <Link href="/dashboard/ideas" className="text-foreground/70 font-medium hover:underline">
            Inbox
          </Link>
          {" "}for you to review.
        </p>
      </div>
    )
  }

  const STATUS_DOT: Record<string, string> = {
    generating: "bg-muted-foreground",
    ready:      "bg-emerald-500",
    published:  "bg-emerald-500",
    failed:     "bg-red-500",
  }

  const STATUS_LABEL: Record<string, string> = {
    generating: "Generating",
    ready:      "Ready",
    published:  "Published",
    failed:     "Failed",
  }

  const STATUS_TEXT: Record<string, string> = {
    generating: "text-muted-foreground",
    ready:      "text-emerald-500",
    published:  "text-emerald-500",
    failed:     "text-red-500",
  }

  return (
    <div className="space-y-6 w-full">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Good {getTimeOfDay()}, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s your pipeline at a glance.</p>
        </div>
        <GenerateDialog />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/ideas">
          <Card className="gap-0 py-0 hover:border-foreground/20 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Ideas to Review</p>
              <p className={cn(
                "text-3xl font-bold mt-1 tracking-tight",
                pending > 0 ? "text-emerald-500" : "text-muted-foreground"
              )}>
                {pending}
              </p>
              {pending > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Inbox className="w-3 h-3" /> Review now <ArrowRight className="w-3 h-3" />
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/queue">
          <Card className="gap-0 py-0 hover:border-foreground/20 transition-colors cursor-pointer">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Ready to Publish</p>
              <p className={cn(
                "text-3xl font-bold mt-1 tracking-tight",
                ready > 0 ? "text-emerald-500" : "text-muted-foreground"
              )}>
                {ready}
              </p>
              {ready > 0 && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Open queue <ArrowRight className="w-3 h-3" />
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Card className="gap-0 py-0">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Published</p>
            <p className={cn(
              "text-3xl font-bold mt-1 tracking-tight",
              published > 0 ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {published}
            </p>
            <p className="text-xs text-muted-foreground mt-1">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Queue preview */}
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">Content Queue</p>
          <Link
            href="/dashboard/queue"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center gap-2">
            <Layers className="w-5 h-5 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No content in the queue yet</p>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/ideas" className="text-foreground/70 font-medium hover:underline">
                Approve ideas
              </Link>{" "}to start generating
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Content</TableHead>
                <TableHead className="px-5">Channel</TableHead>
                <TableHead className="px-5 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset: any) => {
                const dot = STATUS_DOT[asset.status] ?? STATUS_DOT.ready
                const label = STATUS_LABEL[asset.status] ?? "Unknown"
                const textColor = STATUS_TEXT[asset.status] ?? "text-muted-foreground"
                return (
                  <TableRow key={asset.id}>
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
                        <span className="text-sm text-foreground/90 truncate">
                          {asset.title ?? `${asset.channel} ${asset.asset_type}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[11px] text-muted-foreground">
                      {asset.channel} &middot; {formatRelative(asset.published_at ?? asset.updated_at)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <Badge variant="secondary" className={cn("text-[11px]", textColor)}>
                        {label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="gap-0 py-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">Recent Activity</p>
          <Link
            href="/dashboard/logs"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View logs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center gap-2">
            <p className="text-xs text-muted-foreground">No activity logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 truncate">{log.description}</p>
                  {log.entity_name && (
                    <p className="text-[11px] text-muted-foreground truncate">{log.entity_name}</p>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatRelative(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}
