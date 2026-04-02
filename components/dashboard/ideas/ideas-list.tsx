"use client"

import { useRouter } from "next/navigation"
import { Lightbulb, Sparkles, ArrowUpRight, Clock, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Idea } from "@/lib/types"
import { useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

const effortColor: Record<string, string> = {
  Low:    "bg-emerald-400/10 text-emerald-400",
  Medium: "bg-amber-400/10 text-amber-400",
  High:   "bg-red-400/10 text-red-400",
}

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

function IdeaRow({ idea }: { idea: Idea }) {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const [dismissing, setDismissing] = useState(false)

  async function handleLaunch() {
    setLaunching(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}/launch`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to launch")
      toast.success("Idea launched as experiment")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
      setLaunching(false)
    }
  }

  async function handleDismiss() {
    setDismissing(true)
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      })
      if (!res.ok) throw new Error("Failed to dismiss idea")
      toast.success("Idea dismissed")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
      setDismissing(false)
    }
  }

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <p className="text-sm font-medium text-foreground/90">{idea.title}</p>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            {idea.channel}
          </span>
          {idea.effort && (
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", effortColor[idea.effort])}>
              {idea.effort} effort
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{idea.rationale}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="text-xs font-semibold text-emerald-400">{idea.expected_lift}</span>
        {idea.status === "ready" ? (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDismiss}
              disabled={dismissing}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              {dismissing ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            </button>
            <button
              onClick={handleLaunch}
              disabled={launching}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {launching ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Launch <ArrowUpRight className="w-3 h-3" /></>}
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
            <Clock className="w-3 h-3" /> Queued
          </span>
        )}
      </div>
    </div>
  )
}

export function IdeasList({ ideas }: { ideas: Idea[] }) {
  const readyCount = ideas.filter((i) => i.status === "ready").length
  const queuedCount = ideas.filter((i) => i.status === "queued").length

  return (
    <div className="space-y-6 w-full">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ready to Launch", value: String(readyCount), color: "text-foreground" },
          { label: "Queued", value: String(queuedCount), color: "text-amber-400" },
          { label: "Total Ideas", value: String(ideas.length), color: "text-emerald-400" },
        ].map((s) => (
          <Card key={s.label} className="px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Ideas list */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={Lightbulb} />
          <h2 className="text-sm font-semibold text-foreground">AI-Generated Ideas</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-muted-foreground" /> Powered by Claude
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Lightbulb className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No ideas yet. Click &quot;Generate More&quot; to get AI-powered experiment ideas.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {ideas.map((idea) => (
              <IdeaRow key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
