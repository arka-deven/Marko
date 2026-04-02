"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Idea } from "@/lib/types"
import { IdeaInboxItem } from "./idea-inbox-item"
import { GenerateDialog } from "./generate-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  ideas: Idea[]
  pendingCount: number
}

export function IdeaInbox({ ideas: initialIdeas, pendingCount: initialPending }: Props) {
  const [visible, setVisible] = useState<Idea[]>(initialIdeas)
  const [approvingAll, setApprovingAll] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const isGenerating = searchParams.get("generating") === "true"
  const [generating, setGenerating] = useState(false)
  const [apiDone, setApiDone] = useState(false)

  useEffect(() => {
    if (!isGenerating || generating || apiDone) return
    setGenerating(true)

    const body: Record<string, string> = {}
    const theme = searchParams.get("theme")
    const audience = searchParams.get("audience")
    const stage = searchParams.get("stage")
    const brief = searchParams.get("brief")
    if (theme) body.theme = theme
    if (audience) body.audience = audience
    if (stage) body.stage = stage
    if (brief) body.brief = brief

    fetch("/api/ideas/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || "Failed to generate ideas")
          setGenerating(false)
        } else {
          const data = await res.json()
          const newIdeas = (data.ideas ?? []) as Idea[]
          toast.success(`${newIdeas.length} ideas generated`)
          setVisible(prev => [...newIdeas, ...prev])
          setGenerating(false)
          setApiDone(true)
        }
        router.replace("/dashboard/ideas", { scroll: false })
      })
      .catch(() => {
        toast.error("Failed to generate ideas")
        setGenerating(false)
        router.replace("/dashboard/ideas", { scroll: false })
      })
  }, [isGenerating, generating, apiDone, searchParams, router])

  function handleDone(id: string) {
    setVisible((prev) => prev.filter((i) => i.id !== id))
  }

  function handleUpdated(updated: Idea) {
    setVisible((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  async function handleBulkApprove() {
    setApprovingAll(true)
    try {
      await Promise.all(
        visible.map((idea) =>
          fetch(`/api/ideas/${idea.id}/approve`, { method: "POST" })
        )
      )
      toast.success(`Approved ${visible.length} ideas -- content generating`)
      setVisible([])
    } catch {
      toast.error("Failed to approve ideas")
    } finally {
      setApprovingAll(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{visible.length}</span>{" "}
          {visible.length === 1 ? "idea" : "ideas"} to review
        </p>
        <GenerateDialog />
      </div>

      {/* Generating state */}
      {generating && (
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
            <p className="text-sm font-medium text-foreground">Generating ideas with Sonnet...</p>
            <p className="text-xs text-muted-foreground">
              Applying Cialdini principles, awareness stages, and trend analysis. ~15 seconds.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Waiting for ideas...
            </div>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!generating && visible.length === 0 && (
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-2">
            <p className="text-sm font-medium text-foreground">Inbox empty</p>
            <p className="text-xs text-muted-foreground">Generate ideas or wait for Monday&apos;s batch.</p>
          </div>
        </Card>
      )}

      {/* Inbox list */}
      {!generating && visible.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-sm font-medium text-foreground">
              {visible.length} {visible.length === 1 ? "idea" : "ideas"}
            </span>
            {visible.length > 1 && (
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={approvingAll}
              >
                {approvingAll && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Approve all
              </Button>
            )}
          </div>
          <div className="divide-y divide-border/50">
            {visible.map((idea) => (
              <IdeaInboxItem key={idea.id} idea={idea} onDone={handleDone} onUpdated={handleUpdated} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
