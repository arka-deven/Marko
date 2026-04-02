"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Inbox, Loader2, Sparkles } from "lucide-react"
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

  // When ?generating=true is in URL, fire the generate API call from here (has auth cookies)
  useEffect(() => {
    if (!isGenerating || generating || apiDone) return
    setGenerating(true)

    // Build request body from URL params
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
        // Clean URL
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
      {/* Top bar: count + actions */}
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
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Generating ideas with Sonnet...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Applying Cialdini principles, awareness stages, and trend analysis. This takes ~15 seconds.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Waiting for ideas to appear...
            </div>
          </div>
        </Card>
      )}

      {/* Inbox */}
      {!generating && visible.length === 0 ? (
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center">
              <Inbox className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">Inbox empty</p>
            <p className="text-xs text-muted-foreground">Generate ideas or wait for Monday's batch</p>
          </div>
        </Card>
      ) : null}

      {!generating && visible.length > 0 && (
        <Card className="overflow-hidden">
          {/* Header with bulk approve */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {visible.length} {visible.length === 1 ? "idea" : "ideas"}
              </span>
            </div>
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
          {/* List */}
          <div className="divide-y divide-border/50">
            {visible.map((idea) => (
              <IdeaInboxItem
                key={idea.id}
                idea={idea}
                onDone={handleDone}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
