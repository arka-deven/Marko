"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle2, XCircle, Pause, Play, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Experiment, ExperimentStatus } from "@/lib/types"

const statusConfig: Record<ExperimentStatus, { icon: React.ElementType; label: string; color: string }> = {
  draft:   { icon: Clock,        label: "Draft",   color: "text-muted-foreground" },
  running: { icon: Clock,        label: "Running", color: "text-muted-foreground" },
  winner:  { icon: CheckCircle2, label: "Winner",  color: "text-emerald-400" },
  failed:  { icon: XCircle,      label: "Failed",  color: "text-red-400" },
  paused:  { icon: Pause,        label: "Paused",  color: "text-amber-400" },
}

const statusActions: Record<string, { label: string; next: ExperimentStatus; icon: React.ElementType }[]> = {
  draft:   [{ label: "Start Running", next: "running", icon: Play }],
  running: [
    { label: "Mark as Winner", next: "winner", icon: CheckCircle2 },
    { label: "Mark as Failed", next: "failed", icon: XCircle },
    { label: "Pause", next: "paused", icon: Pause },
  ],
  paused:  [
    { label: "Resume", next: "running", icon: Play },
    { label: "Mark as Failed", next: "failed", icon: XCircle },
  ],
  winner:  [],
  failed:  [],
}

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((d) => setExperiment(d.experiment))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: ExperimentStatus) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/experiments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setExperiment(data.experiment)
      }
    } finally {
      setUpdating(false)
    }
  }

  async function handleMetricsUpdate(field: string, value: string) {
    const num = parseFloat(value)
    if (isNaN(num)) return

    const res = await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: num }),
    })
    if (res.ok) {
      const data = await res.json()
      setExperiment(data.experiment)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!experiment) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Experiment not found</p>
      </div>
    )
  }

  const s = statusConfig[experiment.status]
  const StatusIcon = s.icon
  const actions = statusActions[experiment.status] ?? []

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/experiments")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Experiments
      </button>

      {/* Header */}
      <div className="rounded-2xl bg-card/80 border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{experiment.name}</h1>
            {experiment.description && (
              <p className="text-sm text-muted-foreground mt-1">{experiment.description}</p>
            )}
          </div>
          <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border", s.color)}>
            <StatusIcon className="w-3.5 h-3.5" /> {s.label}
          </span>
        </div>

        <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
          <span>Channel: <span className="text-foreground font-medium">{experiment.channel}</span></span>
          {experiment.started_at && <span>Started: {new Date(experiment.started_at).toLocaleDateString()}</span>}
          {experiment.ended_at && <span>Ended: {new Date(experiment.ended_at).toLocaleDateString()}</span>}
        </div>

        {/* Status actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-border">
            {actions.map((action) => {
              const ActionIcon = action.icon
              return (
                <button
                  key={action.next}
                  onClick={() => handleStatusChange(action.next)}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-secondary border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <ActionIcon className="w-3.5 h-3.5" /> {action.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="rounded-2xl bg-card/80 border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Lift (%)</label>
            <input
              type="number"
              step="0.1"
              defaultValue={experiment.lift ?? ""}
              onBlur={(e) => handleMetricsUpdate("lift", e.target.value)}
              placeholder="e.g., 14.2"
              className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Confidence (%)</label>
            <input
              type="number"
              step="1"
              defaultValue={experiment.confidence ?? ""}
              onBlur={(e) => handleMetricsUpdate("confidence", e.target.value)}
              placeholder="e.g., 95"
              className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Revenue Attributed ($)</label>
            <input
              type="number"
              step="1"
              defaultValue={experiment.revenue_attributed ?? ""}
              onBlur={(e) => handleMetricsUpdate("revenue_attributed", e.target.value)}
              placeholder="e.g., 5000"
              className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
