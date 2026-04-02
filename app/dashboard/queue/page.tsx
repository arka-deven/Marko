"use client"

import { useEffect, useState } from "react"
import { Layers, RefreshCw, Send, Loader2, CalendarDays, List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ContentAssetCard } from "@/components/dashboard/queue/content-asset-card"
import { ContentCalendar } from "@/components/dashboard/queue/content-calendar"
import { STATUS_STYLES } from "@/lib/ui-config"
import type { ContentAsset } from "@/lib/types"

type Filter = "all" | "ready" | "generating" | "published" | "failed"
type View = "list" | "calendar"

const filters: Array<{ label: string; value: Filter }> = [
  { label: "Queue",      value: "all" },
  { label: "Ready",      value: "ready" },
  { label: "Generating", value: "generating" },
  { label: "Published",  value: "published" },
  { label: "Failed",     value: "failed" },
]

export default function QueuePage() {
  const [assets, setAssets] = useState<ContentAsset[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [view, setView] = useState<View>("calendar")
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  async function load(status?: string) {
    setLoading(true)
    try {
      const url = status && status !== "all"
        ? `/api/content?status=${status}`
        : "/api/content?status=all"
      const res = await fetch(url)
      const data = await res.json()
      setAssets(data.assets ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(filter) }, [filter])

  // Auto-refresh every 15s if there are generating assets
  useEffect(() => {
    const hasGenerating = assets.some(a => a.status === "generating")
    if (!hasGenerating) return
    const timer = setInterval(() => load(filter), 15_000)
    return () => clearInterval(timer)
  }, [assets, filter])

  function onPublished(id: string) {
    setAssets(prev => prev.filter(a => a.id !== id))
  }

  async function publishAll() {
    setPublishing(true)
    try {
      const res = await fetch("/api/content/publish-batch", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      toast.success(`Published ${data.published} of ${data.total} assets`)
      load(filter) // refresh
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Batch publish failed")
    } finally {
      setPublishing(false)
    }
  }

  const generatingCount = assets.filter(a => a.status === "generating").length
  const readyCount      = assets.filter(a => a.status === "ready").length
  const publishedCount  = assets.filter(a => a.status === "published").length
  const failedCount     = assets.filter(a => a.status === "failed").length

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-foreground/70" />
            Content Queue
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-generated content ready to publish across channels.
            {generatingCount > 0 && ` ${generatingCount} still rendering...`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {readyCount > 0 && (
            <Button size="sm" onClick={publishAll} disabled={publishing}>
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Publish All ({readyCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => load(filter)}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Pipeline summary badges */}
      <div className="flex items-center gap-2">
        {readyCount > 0 && (
          <Badge variant="secondary" className={`${STATUS_STYLES.ready.bg} ${STATUS_STYLES.ready.text} border-0`}>
            {readyCount} ready
          </Badge>
        )}
        {generatingCount > 0 && (
          <Badge variant="secondary" className={`${STATUS_STYLES.generating.bg} ${STATUS_STYLES.generating.text} border-0`}>
            {generatingCount} generating
          </Badge>
        )}
        {publishedCount > 0 && (
          <Badge variant="secondary" className={`${STATUS_STYLES.published.bg} ${STATUS_STYLES.published.text} border-0`}>
            {publishedCount} published
          </Badge>
        )}
        {failedCount > 0 && (
          <Badge variant="secondary" className={`${STATUS_STYLES.failed.bg} ${STATUS_STYLES.failed.text} border-0`}>
            {failedCount} failed
          </Badge>
        )}
      </div>

      {/* View toggle + Filter tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v as Filter); setView("list") }}>
          <TabsList>
            {filters.map(f => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-1">
          <Button
            variant={view === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <RefreshCw className="w-6 h-6 text-muted-foreground/40 mx-auto animate-spin" />
        </div>
      ) : view === "calendar" ? (
        <ContentCalendar assets={assets} />
      ) : assets.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-16 text-center">
          <Layers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground/70">
            {filter === "all" ? "Queue is empty" : `No ${filter} content`}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Approve ideas from the Inbox to generate content. Assets appear here once generated.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map(asset => (
            <ContentAssetCard key={asset.id} asset={asset} onPublished={onPublished} />
          ))}
        </div>
      )}
    </div>
  )
}
