"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const THEMES = [
  "Reciprocity",
  "Social Proof",
  "Commitment & Consistency",
  "Authority",
  "Liking",
  "Scarcity",
  "Unity",
  "Pre-Suasion",
] as const

const STAGES = [
  { value: "all", label: "All stages (default distribution)" },
  { value: "unaware", label: "Unaware — reach people who don't know us" },
  { value: "problem_aware", label: "Problem Aware — name the pain" },
  { value: "solution_aware", label: "Solution Aware — introduce Cialdini" },
  { value: "product_aware", label: "Product Aware — pitch specific products" },
  { value: "most_aware", label: "Most Aware — conversion push" },
]

const BRIEF_EXAMPLES = [
  "We're launching CMCT Cohort 12 in April. Focus on L&D directors who need to justify training ROI to their CFO.",
  "Drive Influence book sales for the spring semester. Target professors and MBA students who assign persuasion reading.",
  "Fill 3 keynote slots in Q2. Target event organizers and speaker bureaus with authority-angle content.",
  "Grow the email list by 500 subscribers this month. Lead with free cheat sheets and templates.",
  "We just published a new case study with Google. Create content that leverages this social proof.",
]

export function GenerateDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [theme, setTheme] = useState<string>("auto")
  const [audience, setAudience] = useState<"both" | "b2b" | "b2c">("both")
  const [stage, setStage] = useState<string>("all")
  const [brief, setBrief] = useState("")

  async function handleGenerate() {
    setLoading(true)
    try {
      const body: Record<string, string> = {}
      if (theme !== "auto") body.theme = theme
      if (audience !== "both") body.audience = audience
      if (stage !== "all") body.stage = stage
      if (brief.trim()) body.brief = brief.trim()

      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to generate ideas")
        return
      }

      const data = await res.json()
      toast.success(`${data.ideas?.length ?? 8} ideas generated for ${data.theme}`)
      setOpen(false)
      setBrief("")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate ideas")
    } finally {
      setLoading(false)
    }
  }

  // Quick generate (no dialog, just fire with defaults)
  async function handleQuickGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
    <div className="flex items-center gap-2">
      {/* Quick generate — no options */}
      <Button variant="outline" size="sm" onClick={handleQuickGenerate} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Generating..." : "Quick Generate"}
      </Button>

      {/* Full dialog with options */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" disabled={loading}>
            <Sparkles className="w-4 h-4" />
            Generate with Brief
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Ideas</DialogTitle>
            <DialogDescription>
              Configure what you want the AI to focus on. The more specific your brief, the better the ideas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Theme */}
            <div className="space-y-2">
              <Label>Cialdini Principle</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (this week&apos;s rotation)</SelectItem>
                  {THEMES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label>Audience Focus</Label>
              <div className="flex gap-2">
                {(["both", "b2b", "b2c"] as const).map(a => (
                  <Button
                    key={a}
                    variant={audience === a ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setAudience(a)}
                    className="flex-1"
                  >
                    {a === "both" ? "Both" : a.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Awareness Stage */}
            <div className="space-y-2">
              <Label>Funnel Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Marketing Brief */}
            <div className="space-y-2">
              <Label>Marketing Brief</Label>
              <p className="text-xs text-muted-foreground">
                Tell the AI exactly what you&apos;re trying to achieve. Be specific about the product, audience segment, campaign goal, or time constraint.
              </p>
              <Textarea
                placeholder="e.g., We're launching CMCT Cohort 12 in April. Focus on L&D directors who need to justify training ROI to their CFO."
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={3}
              />
              {/* Example briefs */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-muted-foreground font-medium">Examples (click to use):</p>
                <div className="flex flex-wrap gap-1.5">
                  {BRIEF_EXAMPLES.map((ex, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer text-[10px] hover:bg-secondary transition-colors max-w-full"
                      onClick={() => setBrief(ex)}
                    >
                      {ex.length > 60 ? ex.slice(0, 57) + "..." : ex}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Generating..." : "Generate 8 Ideas"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
