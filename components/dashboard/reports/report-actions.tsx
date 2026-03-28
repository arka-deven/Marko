"use client"

import { useState } from "react"
import { Share2, Download, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Report } from "@/lib/types"

export function ReportActions({ report }: { report: Report }) {
  const router = useRouter()
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(report.shared)

  async function handleShare() {
    setSharing(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shared: !shared }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const newShared = !shared
      setShared(newShared)
      toast.success(newShared ? "Report is now public" : "Report set to private")
      router.refresh()
    } catch {
      toast.error("Failed to update report")
    } finally {
      setSharing(false)
    }
  }

  function handleDownload() {
    // Build a text blob from the report content
    const content = typeof report.content === "object"
      ? JSON.stringify(report.content, null, 2)
      : String(report.content)
    const text = `${report.name}\n${"=".repeat(report.name.length)}\n\n${content}`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${report.name.replace(/\s+/g, "-").toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report downloaded")
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 transition-colors disabled:opacity-50"
      >
        {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : shared ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
        {shared ? "Shared" : "Share"}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 transition-colors"
      >
        <Download className="w-3 h-3" /> Download
      </button>
    </div>
  )
}
