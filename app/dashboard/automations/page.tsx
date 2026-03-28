import type React from "react"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { AutomationItem } from "@/components/dashboard/automations/automation-item"
import type { Automation } from "@/lib/types"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

export default async function AutomationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: automations = [] } = await supabase
    .from("automations")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: true })

  const activeCount = (automations ?? []).filter((a: any) => a.status === "active").length
  const pausedCount = (automations ?? []).filter((a: any) => a.status === "paused").length
  const totalRuns = (automations ?? []).reduce((sum: number, a: any) => sum + (a.run_count ?? 0), 0)

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground/70 bg-secondary/40">
          <Zap className="w-3.5 h-3.5" /> Managed by Marko AI — runs automatically
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active",     value: activeCount, color: "text-emerald-400" },
          { label: "Paused",     value: pausedCount, color: "text-amber-400" },
          { label: "Total Runs", value: totalRuns,   color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={Zap} />
          <h2 className="text-sm font-semibold text-foreground">All Automations</h2>
        </div>
        <div className="divide-y divide-border/50">
          {(automations ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <Zap className="w-8 h-8 text-muted-foreground/30 mb-1" />
              <p className="text-sm font-medium text-foreground/70">No automations yet</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Marko will automatically set up your growth automations once you&apos;ve connected your first integration and launched an experiment.
              </p>
            </div>
          ) : (
            (automations ?? []).map((auto: any) => (
              <AutomationItem key={auto.id} automation={auto as Automation} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
