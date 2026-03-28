import type React from "react"
import { Plug, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import {
  siGoogleanalytics, siStripe, siSlackware, siHubspot,
  siMixpanel, siMailchimp, siLinear, siNotion, siZapier, siFigma,
} from "simple-icons"

type SI = { svg: string; hex: string }

const providerIcons: Record<string, SI> = {
  "Google Analytics 4": siGoogleanalytics,
  "Stripe":             siStripe,
  "Slack":              siSlackware,
  "HubSpot":            siHubspot,
  "Mixpanel":           siMixpanel,
  "Mailchimp":          siMailchimp,
  "Linear":             siLinear,
  "Notion":             siNotion,
  "Zapier":             siZapier,
  "Figma":              siFigma,
}

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

function BrandIcon({ si, label, size = 20 }: { si: SI; label?: string; size?: number }) {
  const beThemeAware = ["000000", "181717", "FFFFFF"].includes(si.hex.toUpperCase())
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={beThemeAware ? "fill-black dark:fill-white transition-colors" : ""}
      style={!beThemeAware ? { fill: `#${si.hex}` } : undefined}
      dangerouslySetInnerHTML={{ __html: si.svg }}
    />
  )
}

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: integrations = [] } = await supabase
    .from("integrations")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: true })

  const allIntegrations = integrations ?? []
  const active = allIntegrations.filter((i: any) => i.status === "connected" || i.status === "error")
  const available = allIntegrations.filter((i: any) => i.status === "disconnected")

  const connectedCount = allIntegrations.filter((i: any) => i.status === "connected").length
  const errorCount = allIntegrations.filter((i: any) => i.status === "error").length

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> Browse All
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connected",  value: connectedCount, color: "text-emerald-400" },
          { label: "Issues",     value: errorCount,     color: "text-red-400" },
          { label: "Events/day", value: "142k",         color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Connected / Error */}
      {active.length > 0 && (
        <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <IconBadge icon={Plug} />
            <h2 className="text-sm font-semibold text-foreground">Connected</h2>
            <span className="ml-auto text-xs text-muted-foreground/60">{active.length} integrations</span>
          </div>
          <div className="divide-y divide-border/50">
            {active.map((int: any) => {
              const si = providerIcons[int.provider]
              return (
                <div key={int.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                    {si ? <BrandIcon si={si} label={int.provider} size={20} /> : <Plug className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90">{int.provider}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {int.category}{int.events_summary ? ` · ${int.events_summary}` : ""}
                    </p>
                  </div>
                  {int.status === "connected" ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" /> Error
                    </div>
                  )}
                  <button className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:text-foreground/70 transition-colors">
                    Manage
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available */}
      {available.length > 0 && (
        <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Available to Connect</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {available.map((int: any) => {
              const si = providerIcons[int.provider]
              return (
                <div key={int.id} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-border transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                    {si ? <BrandIcon si={si} label={int.provider} size={18} /> : <Plug className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/90">{int.provider}</p>
                    <p className="text-xs text-muted-foreground/60">{int.category}</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
                    Connect
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {allIntegrations.length === 0 && (
        <div className="rounded-2xl bg-card/80 border border-border px-5 py-10 text-center text-sm text-muted-foreground">
          No integrations found. Try refreshing or contact support.
        </div>
      )}
    </div>
  )
}
