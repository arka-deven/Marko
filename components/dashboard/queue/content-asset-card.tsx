"use client"

import { useState } from "react"
import { MetricsEntryForm } from "./metrics-entry-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ContentAsset, ContentAssetType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ---- Status badge ----
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  generating: {
    label: "Generating",
    className: "text-muted-foreground bg-muted/50 border-border",
  },
  ready: {
    label: "Ready",
    className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  published: {
    label: "Published",
    className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  failed: {
    label: "Failed",
    className: "text-red-500 bg-red-500/10 border-red-500/20",
  },
}

// ---- AI Quality badge ----
function QualityBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    B: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    C: "text-muted-foreground bg-muted/50 border-border",
    D: "text-red-500 bg-red-500/10 border-red-500/20",
    F: "text-red-500 bg-red-500/10 border-red-500/20",
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border ${colors[grade] ?? colors.C}`}>
      {grade}
    </span>
  )
}

// ---- Metadata previews ----
function str(val: unknown): string {
  return val == null ? "" : String(val)
}

function MetadataPreview({ asset }: { asset: ContentAsset }) {
  const m = asset.metadata ?? {}

  if (asset.channel === "LinkedIn" && (asset.asset_type === "post" || asset.asset_type === "thread")) {
    const hookLine = str(m.hook_line)
    const commentPrompt = str(m.comment_prompt)
    if (!hookLine && !commentPrompt) return null
    return (
      <div className="space-y-1">
        {hookLine && <p className="text-xs text-muted-foreground line-clamp-2">{hookLine}</p>}
        {commentPrompt && <p className="text-[11px] text-muted-foreground/70 italic truncate">CTA: {commentPrompt}</p>}
      </div>
    )
  }

  if (asset.channel === "Email" || asset.asset_type === "email") {
    const subjects = [str(m.subject_a), str(m.subject_b), str(m.subject_c)].filter(Boolean)
    if (subjects.length > 0) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {subjects.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] text-muted-foreground truncate max-w-[180px]">
              {s}
            </span>
          ))}
        </div>
      )
    }
  }

  if (asset.channel === "Blog" || asset.asset_type === "blog") {
    const seoTitle = str(m.seo_title)
    const keyword = str(m.primary_keyword)
    if (!seoTitle && !keyword) return null
    return (
      <div className="space-y-1">
        {seoTitle && <p className="text-xs text-muted-foreground truncate">{seoTitle}</p>}
        {keyword && (
          <span className="inline-flex px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] text-muted-foreground">
            {keyword}
          </span>
        )}
      </div>
    )
  }

  if (asset.asset_type === "lead-magnet") {
    const format = str(m.format)
    const headline = str(m.landing_headline)
    if (!format && !headline) return null
    return (
      <div className="space-y-1">
        {format && <span className="inline-flex px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] text-muted-foreground capitalize">{format}</span>}
        {headline && <p className="text-xs text-muted-foreground truncate">{headline}</p>}
      </div>
    )
  }

  if (asset.asset_type === "case-study") {
    const headline = str(m.headline)
    const result = str(m.result_number)
    if (!headline && !result) return null
    return (
      <div className="space-y-1">
        {headline && <p className="text-xs text-muted-foreground truncate">{headline}</p>}
        {result && <span className="inline-flex px-2 py-0.5 rounded-md bg-secondary border border-border text-[11px] text-muted-foreground">{result}</span>}
      </div>
    )
  }

  return null
}

// ---- Idea context pills ----
function IdeaContext({ asset }: { asset: ContentAsset }) {
  const idea = asset.idea
  if (!idea) return null

  const pills: string[] = []
  if (idea.theme) pills.push(idea.theme)
  if (idea.awareness_stage) pills.push(idea.awareness_stage.replace(/_/g, " "))
  if (idea.audience) pills.push(idea.audience.toUpperCase())

  if (pills.length === 0) return null

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {pills.map((p) => (
        <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground border border-border capitalize">
          {p}
        </span>
      ))}
    </div>
  )
}

function formatAssetType(t: ContentAssetType): string {
  return t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---- Main card ----
interface Props {
  asset: ContentAsset
  onPublished: (id: string) => void
  compact?: boolean
}

export function ContentAssetCard({ asset, onPublished, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [publishingToBuffer, setPublishingToBuffer] = useState(false)
  const [showMetrics, setShowMetrics] = useState(false)

  const aiGrade = (asset.metadata?.ai_quality_grade as string) ?? null
  const statusCfg = STATUS_STYLES[asset.status] ?? STATUS_STYLES.ready

  async function handlePublish() {
    setPublishing(true)
    try {
      const res = await fetch(`/api/content/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Content marked as published")
      onPublished(asset.id)
    } catch {
      toast.error("Failed to mark as published")
    } finally {
      setPublishing(false)
    }
  }

  async function handlePublishToBuffer() {
    setPublishingToBuffer(true)
    try {
      const res = await fetch("/api/buffer/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentAssetId: asset.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to publish to Buffer")
        return
      }
      const data = await res.json()
      toast.success(data.message || "Published via Buffer")
      onPublished(asset.id)
    } catch {
      toast.error("Failed to publish to Buffer")
    } finally {
      setPublishingToBuffer(false)
    }
  }

  async function handleRetry() {
    setRetrying(true)
    try {
      const res = await fetch(`/api/content/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "generating" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Retrying content generation")
    } catch {
      toast.error("Failed to retry")
    } finally {
      setRetrying(false)
    }
  }

  // ---- Compact card ----
  if (compact) {
    return (
      <div className="group relative rounded-xl border border-border bg-background/50 overflow-hidden hover:border-foreground/10 transition-colors">
        <div className="px-3 py-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground truncate">
              {formatAssetType(asset.asset_type)}
            </span>
            <Badge variant="outline" className={cn("text-[10px] border", statusCfg.className)}>
              {statusCfg.label}
            </Badge>
          </div>
          {asset.title && (
            <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{asset.title}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            {aiGrade && <QualityBadge grade={aiGrade} />}
            <span className="text-[11px] text-muted-foreground">{asset.channel}</span>
          </div>
        </div>
      </div>
    )
  }

  // ---- Full list card ----
  return (
    <div className="group relative rounded-xl border border-border bg-background/50 overflow-hidden hover:border-foreground/10 transition-colors">
      <div className="px-4 py-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{asset.channel}</span>
              <span className="text-xs text-muted-foreground">{formatAssetType(asset.asset_type)}</span>
              {aiGrade && <QualityBadge grade={aiGrade} />}
            </div>
            <div className="mt-1">
              <IdeaContext asset={asset} />
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] border shrink-0", statusCfg.className)}>
            {statusCfg.label}
          </Badge>
        </div>

        {/* Title */}
        {asset.title && (
          <p className="text-sm font-medium text-foreground leading-snug">{asset.title}</p>
        )}

        {/* Metadata */}
        <MetadataPreview asset={asset} />

        {/* Generating */}
        {asset.status === "generating" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating content&hellip;</span>
          </div>
        )}

        {/* Ready actions */}
        {asset.status === "ready" && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Collapse" : "Preview"}
            </Button>
            {(asset.channel === "LinkedIn" || asset.channel === "Twitter" || asset.channel === "Instagram") && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublishToBuffer}
                disabled={publishingToBuffer || publishing}
                className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
              >
                {publishingToBuffer && <Loader2 className="w-3 h-3 animate-spin" />}
                Publish to Buffer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={publishing || publishingToBuffer}
              className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
            >
              {publishing && <Loader2 className="w-3 h-3 animate-spin" />}
              Mark Published
            </Button>
          </div>
        )}

        {/* Published actions */}
        {asset.status === "published" && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Published {asset.published_at ? new Date(asset.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }) : ""}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowMetrics(!showMetrics)}>
                {showMetrics ? "Hide Metrics" : "Log Metrics"}
              </Button>
            </div>
            {showMetrics && (
              <MetricsEntryForm
                assetId={asset.id}
                channel={asset.channel}
                onSaved={() => setShowMetrics(false)}
              />
            )}
          </div>
        )}

        {/* Failed actions */}
        {asset.status === "failed" && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            >
              {retrying && <Loader2 className="w-3 h-3 animate-spin" />}
              Retry
            </Button>
          </div>
        )}

        {/* Expanded body */}
        {expanded && (
          <div className="rounded-lg border border-border bg-secondary/30 p-3">
            {asset.title && (
              <p className="text-xs font-semibold text-foreground mb-2">{asset.title}</p>
            )}
            <pre className="max-h-64 overflow-y-auto text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {asset.body ?? "No content body available."}
            </pre>
          </div>
        )}

        {/* Higgsfield video */}
        {asset.higgsfield_video_url && (
          <a
            href={asset.higgsfield_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Download video &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
