"use client"

import type React from "react"
import { Lightbulb, Sparkles, ArrowUpRight, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const ideas = [
  {
    title: "Add social proof counter near CTA",
    rationale: "Cialdini's social proof principle. Adding \"2,400 teams growing with Marko\" near the CTA could increase conversions by reducing friction.",
    channel: "Web",
    expectedLift: "+9–14%",
    effort: "Low",
    status: "ready",
  },
  {
    title: "Tuesday 9AM email send time test",
    rationale: "Data shows B2B open rates peak Tuesday mornings. Testing this against your current Thursday sends.",
    channel: "Email",
    expectedLift: "+18–25%",
    effort: "Low",
    status: "queued",
  },
  {
    title: "Urgency badge on pricing page",
    rationale: "\"Limited beta spots\" scarcity framing can lift upgrade clicks significantly without changing the price.",
    channel: "Web",
    expectedLift: "+7–12%",
    effort: "Low",
    status: "ready",
  },
  {
    title: "LinkedIn thought leadership post series",
    rationale: "3-part experiment series on growth loops, targeting founders. Builds brand and pipeline simultaneously.",
    channel: "Social",
    expectedLift: "+3–8%",
    effort: "Medium",
    status: "ready",
  },
  {
    title: "Re-engagement push: lapsed day-7 users",
    rationale: "Users who don't return after day 7 churn at 80%. A targeted push at hour 168 can recover 12–18%.",
    channel: "Push",
    expectedLift: "+12–18%",
    effort: "Low",
    status: "queued",
  },
  {
    title: "Benefit-led vs feature-led ad copy split",
    rationale: "\"Run 30 experiments at once\" (feature) vs \"Grow 30% faster\" (benefit) — hypothesis: benefit-led lifts CTR.",
    channel: "Paid",
    expectedLift: "+10–20%",
    effort: "Low",
    status: "ready",
  },
]

const effortColor: Record<string, string> = {
  Low:    "bg-emerald-400/10 text-emerald-400",
  Medium: "bg-amber-400/10 text-amber-400",
  High:   "bg-red-400/10 text-red-400",
}

export default function IdeasPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Sparkles className="w-4 h-4" /> Generate More
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Ready to Launch", value: "4", color: "text-foreground" },
          { label: "Queued",          value: "2", color: "text-amber-400" },
          { label: "Avg. Expected Lift", value: "~14%", color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ideas grid */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={Lightbulb} />
          <h2 className="text-sm font-semibold text-foreground">AI-Generated Ideas</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-muted-foreground" /> Powered by Claude
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {ideas.map((idea) => (
            <div key={idea.title} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group cursor-pointer">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="text-sm font-medium text-foreground/90">{idea.title}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {idea.channel}
                  </span>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", effortColor[idea.effort])}>
                    {idea.effort} effort
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{idea.rationale}</p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs font-semibold text-emerald-400">{idea.expectedLift}</span>
                {idea.status === "ready" ? (
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    Launch <ArrowUpRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Clock className="w-3 h-3" /> Queued
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
