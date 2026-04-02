"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EFFORT_STYLES } from "@/lib/ui-config"
import type { Idea } from "@/lib/types"

interface Props {
  idea: Idea
  onDone: (id: string) => void
}

export function IdeaInboxItem({ idea, onDone }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  const effort = idea.effort ? EFFORT_STYLES[idea.effort] : null

  async function act(action: "approve" | "reject") {
    setLoading(action)
    try {
      const res = await fetch(`/api/ideas/${idea.id}/${action}`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success(action === "approve" ? "Approved -- content generating" : "Rejected")
      onDone(idea.id)
    } catch {
      toast.error(`Failed to ${action} idea`)
      setLoading(null)
    }
  }

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors">
      {/* Status dot */}
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground/90">{idea.title}</p>
          <Badge variant="secondary">{idea.channel}</Badge>
          {idea.effort && effort && (
            <Badge variant="outline" className={cn(effort.bg, effort.text, "border-0")}>
              {idea.effort} effort
            </Badge>
          )}
          {idea.expected_lift && (
            <Badge variant="outline" className="border-0 bg-emerald-400/10 text-emerald-400">
              {idea.expected_lift}
            </Badge>
          )}
        </div>
        {idea.rationale && (
          <p className="text-xs text-muted-foreground leading-relaxed">{idea.rationale}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={() => act("approve")}
          disabled={loading !== null}
        >
          {loading === "approve"
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Check className="w-3 h-3" />
          }
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => act("reject")}
          disabled={loading !== null}
        >
          {loading === "reject"
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <X className="w-3 h-3" />
          }
          Reject
        </Button>
      </div>
    </div>
  )
}
