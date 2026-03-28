"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function GenerateReportButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Monthly Report — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          report_type: "Monthly",
          description: "Auto-generated monthly performance summary.",
          content: {},
          page_count: 1,
        }),
      })
      if (!res.ok) throw new Error("Failed to generate report")
      toast.success("Report created")
      router.refresh()
    } catch {
      toast.error("Failed to create report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      {loading ? "Generating…" : "Generate Report"}
    </button>
  )
}
