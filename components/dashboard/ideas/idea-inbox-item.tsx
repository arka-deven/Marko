"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Idea } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Props {
  idea: Idea
  onDone: (id: string) => void
  onUpdated?: (idea: Idea) => void
}

const CHANNEL_OUTPUTS: Record<string, string[]> = {
  Social: ["LinkedIn Post", "Twitter Thread", "Video Script"],
  Email: ["Newsletter", "LinkedIn Post", "Lead Magnet"],
  Web: ["Blog Post", "LinkedIn Post"],
  Paid: ["Ad Copy (3 variants)", "Email"],
  Push: ["Push Notification"],
}

const STAGE_LABELS: Record<string, string> = {
  unaware: "Unaware (TOFU)",
  problem_aware: "Problem Aware",
  solution_aware: "Solution Aware",
  product_aware: "Product Aware",
  most_aware: "Most Aware (BOFU)",
}

const AUDIENCE_LABELS: Record<string, string> = {
  b2b: "B2B",
  b2c: "B2C",
}

export function IdeaInboxItem({ idea, onDone, onUpdated }: Props) {
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [refining, setRefining] = useState(false)
  const [refineTip, setRefineTip] = useState("")
  const [refineLoading, setRefineLoading] = useState(false)
  const busy = approving || rejecting

  async function handleApprove() {
    setApproving(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}/approve`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to approve")
      toast.success("Approved — content generating")
      onDone(idea.id)
    } catch {
      toast.error("Failed to approve idea")
      setApproving(false)
    }
  }

  async function handleReject() {
    setRejecting(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}/reject`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to reject")
      toast.success("Skipped")
      onDone(idea.id)
    } catch {
      toast.error("Failed to reject idea")
      setRejecting(false)
    }
  }

  async function handleRefine() {
    if (!refineTip.trim()) return
    setRefineLoading(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip: refineTip.trim() }),
      })
      if (!res.ok) throw new Error("Failed to refine")
      const data = await res.json()
      toast.success("Idea refined")
      setRefineTip("")
      setRefining(false)
      onUpdated?.(data.idea)
    } catch {
      toast.error("Failed to refine idea")
    } finally {
      setRefineLoading(false)
    }
  }

  const outputs = CHANNEL_OUTPUTS[idea.channel] ?? []

  return (
    <div className="border-b border-border/50 last:border-0">
      {/* Collapsed row */}
      <div
        className={cn(
          "flex items-start gap-4 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors",
          expanded && "bg-secondary/20"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{idea.title}</p>
            <Badge variant="secondary" className="text-[10px]">{idea.channel}</Badge>
            <Badge variant="outline" className="text-[10px]">{AUDIENCE_LABELS[idea.audience] ?? idea.audience}</Badge>
          </div>
          {idea.rationale && (
            <p className="text-xs text-muted-foreground line-clamp-1">{idea.rationale}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReject() }} disabled={busy}>
            {rejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Skip"}
          </Button>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApprove() }} disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 bg-secondary/10">
          {idea.rationale && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Rationale</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{idea.rationale}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Stage</p>
              <p className="text-xs font-medium mt-0.5">{STAGE_LABELS[idea.awareness_stage] ?? idea.awareness_stage}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Principle</p>
              <p className="text-xs font-medium mt-0.5">{idea.theme ?? "---"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Expected Lift</p>
              <p className="text-xs font-medium mt-0.5">{idea.expected_lift ?? "---"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Effort</p>
              <p className="text-xs font-medium mt-0.5">{idea.effort ?? "---"}</p>
            </div>
          </div>

          {/* Content destinations */}
          {outputs.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Approving will generate
              </p>
              <div className="flex flex-wrap gap-1.5">
                {outputs.map((label) => (
                  <Badge key={label} variant="secondary" className="text-[11px]">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Refine */}
          <div className="pt-2 border-t border-border/30">
            {!refining ? (
              <Button variant="ghost" size="sm" onClick={() => setRefining(true)} className="text-xs">
                Refine this idea
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Give a tip to improve this idea..."
                  value={refineTip}
                  onChange={(e) => setRefineTip(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRefine} disabled={refineLoading || !refineTip.trim()} className="text-xs">
                    {refineLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Regenerate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setRefining(false); setRefineTip("") }} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
