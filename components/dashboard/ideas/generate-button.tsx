"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function GenerateButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to generate ideas")
        return
      }
      toast.success("Ideas generated")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate ideas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {loading ? "Generating..." : "Generate More"}
    </Button>
  )
}
