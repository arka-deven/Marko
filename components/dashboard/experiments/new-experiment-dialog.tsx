"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Channel } from "@/lib/types"

const channels: Channel[] = ["Web", "Email", "Paid", "Social", "Push"]

export function NewExperimentButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [channel, setChannel] = useState<Channel>("Web")
  const [description, setDescription] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, channel, description }),
      })
      if (!res.ok) throw new Error("Failed to create experiment")
      toast.success("Experiment created")
      setOpen(false)
      setName("")
      setDescription("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create experiment")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground"
      >
        <Plus className="w-4 h-4" /> New Experiment
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl bg-background border border-border p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground">New Experiment</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homepage CTA A/B Test"
              required
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Channel</label>
            <div className="flex gap-2">
              {channels.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    channel === ch
                      ? "bg-foreground text-background border-foreground"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you testing and why?"
              rows={3}
              className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Experiment"}
          </button>
        </form>
      </div>
    </>
  )
}
