"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [workspaceName, setWorkspaceName] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!workspaceName.trim()) { setError("Workspace name is required"); return }
    setLoading(true)
    setError("")

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace: {
          name: workspaceName.trim(),
          website: website.trim() || null,
        },
      }),
    })

    if (!res.ok) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-foreground/70" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Set up your workspace</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell Marko a little about your business so it can generate better experiment ideas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Workspace name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder="Acme Growth Team"
              required
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Website <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border transition-all"
            />
            <p className="text-[10px] text-muted-foreground/60">
              Marko uses your website to understand your product and generate relevant experiment ideas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up…" : "Get started →"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground/70 transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  )
}
