"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function IntegrationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)

  async function toggle() {
    setLoading(true)
    const newStatus = currentStatus === "connected" ? "disconnected" : "connected"
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setCurrentStatus(newStatus)
      toast.success(newStatus === "connected" ? "Integration connected" : "Integration disconnected")
      router.refresh()
    } catch {
      toast.error("Failed to update integration")
    } finally {
      setLoading(false)
    }
  }

  const isConnected = currentStatus === "connected" || currentStatus === "error"

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "connected" && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
        </div>
      )}
      {currentStatus === "error" && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" /> Error
        </div>
      )}
      <button
        onClick={toggle}
        disabled={loading}
        className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/70 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading && <Loader2 className="w-3 h-3 animate-spin" />}
        {isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  )
}
