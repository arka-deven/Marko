"use client"

import { useState } from "react"
import { Check, Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STATUS_STYLES, CONTENT_CHANNEL_LABELS } from "@/lib/ui-config"
import type { ContentAsset } from "@/lib/types"

interface Props {
  asset: ContentAsset
  onPublished: (id: string) => void
}

export function ContentAssetCard({ asset, onPublished }: Props) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const status = STATUS_STYLES[asset.status] ?? STATUS_STYLES.ready
  const channelLabel = CONTENT_CHANNEL_LABELS[asset.channel] ?? asset.channel

  async function markPublished() {
    setLoading(true)
    try {
      const res = await fetch(`/api/content/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${asset.channel} content marked as published`)
      onPublished(asset.id)
    } catch {
      toast.error("Failed to update")
      setLoading(false)
    }
  }

  return (
    <Card className="py-0 gap-0 overflow-hidden border-l-2 border-l-muted">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{channelLabel}</Badge>
            <span className="text-xs text-muted-foreground capitalize">{asset.asset_type}</span>
            <Badge variant="outline" className={cn(status.bg, status.text, "border-0")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </Badge>
          </div>
          {asset.title && (
            <p className="text-xs text-muted-foreground truncate mt-1">{asset.title}</p>
          )}
          {asset.higgsfield_video_url && (
            <a
              href={asset.higgsfield_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-0.5"
            >
              <ExternalLink className="w-3 h-3" /> Download video
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {asset.status === "ready" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Hide" : "Preview"}
              </Button>
              <Button size="sm" onClick={markPublished} disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Mark Published
              </Button>
            </>
          )}
          {asset.status === "generating" && (
            <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Generating...
            </span>
          )}
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && asset.body && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans max-h-48 overflow-y-auto">
            {asset.body}
          </pre>
        </div>
      )}
    </Card>
  )
}
