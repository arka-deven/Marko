"use client"

import type React from "react"
import { FileText, Download, Share2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const reports = [
  {
    name: "March 2026 — Growth Summary",
    description: "34 experiments run, $84k attributed revenue, 18.4% avg. lift. Top channel: Web.",
    date: "Mar 25, 2026",
    type: "Monthly",
    pages: 8,
  },
  {
    name: "Q1 2026 — Experiment ROI Report",
    description: "Quarterly deep-dive into experiment performance, channel breakdown, and recommendations.",
    date: "Mar 31, 2026",
    type: "Quarterly",
    pages: 14,
  },
  {
    name: "Pricing Page CTA — Win Report",
    description: "Full analysis of the winning Pricing Page CTA experiment: +22.1% lift at 99% confidence.",
    date: "Mar 22, 2026",
    type: "Experiment",
    pages: 4,
  },
  {
    name: "Email Channel — February Analysis",
    description: "Breakdown of all email experiments in February, including open rates, CTR, and lift.",
    date: "Feb 28, 2026",
    type: "Channel",
    pages: 6,
  },
  {
    name: "February 2026 — Growth Summary",
    description: "22 experiments, $61k attributed revenue, 14.2% avg. lift. New record: 7 concurrent wins.",
    date: "Feb 25, 2026",
    type: "Monthly",
    pages: 8,
  },
]

const typeColor: Record<string, string> = {
  Monthly:    "bg-blue-500/10 text-blue-400",
  Quarterly:  "bg-purple-500/10 text-purple-400",
  Experiment: "bg-emerald-500/10 text-emerald-400",
  Channel:    "bg-amber-500/10 text-amber-400",
}

export default function ReportsPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reports",  value: "5",  color: "text-foreground" },
          { label: "Shared",         value: "2",  color: "text-blue-400" },
          { label: "Avg. Pages",     value: "8",  color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports list */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={FileText} />
          <h2 className="text-sm font-semibold text-foreground">All Reports</h2>
        </div>
        <div className="divide-y divide-border/50">
          {reports.map((r) => (
            <div key={r.name} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group">
              {/* File icon */}
              <div className="w-9 h-11 rounded-lg bg-secondary border border-border flex flex-col items-center justify-center gap-0.5 shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-[8px] text-muted-foreground/60">{r.pages}p</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground/90">{r.name}</p>
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", typeColor[r.type])}>
                    {r.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                <p className="text-[10px] text-muted-foreground/60">{r.date}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 hover:border-border transition-colors">
                  <Share2 className="w-3 h-3" /> Share
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 hover:border-border transition-colors">
                  <Download className="w-3 h-3" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
