import type React from "react"
import { FileText, Download, Share2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import type { Report, ReportType } from "@/lib/types"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

const typeColor: Record<ReportType, string> = {
  Monthly:    "bg-blue-500/10 text-blue-400",
  Quarterly:  "bg-purple-500/10 text-purple-400",
  Experiment: "bg-emerald-500/10 text-emerald-400",
  Channel:    "bg-amber-500/10 text-amber-400",
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: reports = [] } = await supabase
    .from("reports")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: false })

  const allReports = (reports ?? []) as Report[]
  const sharedCount = allReports.filter(r => r.shared).length
  const avgPages = allReports.length > 0
    ? Math.round(allReports.reduce((s, r) => s + r.page_count, 0) / allReports.length)
    : 0

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reports", value: allReports.length, color: "text-foreground" },
          { label: "Shared",        value: sharedCount,       color: "text-blue-400" },
          { label: "Avg. Pages",    value: avgPages,          color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={FileText} />
          <h2 className="text-sm font-semibold text-foreground">All Reports</h2>
        </div>

        {allReports.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground/70">No reports yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Reports are generated from completed experiments. Run your first experiment to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {allReports.map((r) => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group">
                <div className="w-9 h-11 rounded-lg bg-secondary border border-border flex flex-col items-center justify-center gap-0.5 shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground/60">{r.page_count}p</span>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground/90">{r.name}</p>
                    <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", typeColor[r.report_type])}>
                      {r.report_type}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 transition-colors">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/90 transition-colors">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
