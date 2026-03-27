"use client"

import type React from "react"
import { Plug, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  siGoogleanalytics,
  siStripe,
  siSlackware,
  siHubspot,
  siMixpanel,
  siFigma,
  siLinear,
  siNotion,
  siZapier,
  siMailchimp,
} from "simple-icons"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

function BrandIcon({ si, size = 20 }: { si: { svg: string; hex: string }; size?: number }) {
  // If the brand is black/near-black/white, let CSS handle flipping it based on theme
  const beThemeAware = ["000000", "181717", "FFFFFF"].includes(si.hex.toUpperCase())

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={beThemeAware ? "fill-black dark:fill-white transition-colors" : ""}
      style={!beThemeAware ? { fill: `#${si.hex}` } : undefined}
      dangerouslySetInnerHTML={{ __html: si.svg }}
    />
  )
}

const connected = [
  { name: "Google Analytics 4", category: "Analytics",  events: "48.2k/day", status: "connected", si: siGoogleanalytics },
  { name: "Stripe",             category: "Revenue",    events: "1.4k/day",  status: "connected", si: siStripe },
  { name: "Slack",              category: "Automation", events: "Active",    status: "connected", si: siSlackware },
  { name: "HubSpot",            category: "CRM",        events: "320/day",   status: "connected", si: siHubspot },
  { name: "Mixpanel",           category: "Analytics",  events: "22.1k/day", status: "connected", si: siMixpanel },
  { name: "Figma",              category: "Design",     events: "Webhooks",  status: "error",     si: siFigma },
]

const available = [
  { name: "Linear",    category: "Project Mgmt", si: siLinear },
  { name: "Notion",    category: "Docs",         si: siNotion },
  { name: "Zapier",    category: "Automation",   si: siZapier },
  { name: "Mailchimp", category: "Email",        si: siMailchimp },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-end">
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground">
          <Plus className="w-4 h-4" /> Browse All
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Connected",  value: "5",    color: "text-emerald-400" },
          { label: "Issues",     value: "1",    color: "text-red-400" },
          { label: "Events/day", value: "142k", color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/80 border border-border px-6 py-5">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{s.label}</p>
            <p className={cn("text-4xl font-black mt-2 tracking-tighter", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Connected */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={Plug} />
          <h2 className="text-sm font-semibold text-foreground">Connected</h2>
          <span className="ml-auto text-xs text-muted-foreground/60">{connected.length} integrations</span>
        </div>
        <div className="divide-y divide-border/50">
          {connected.map((int) => (
            <div key={int.name} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                <BrandIcon si={int.si} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/90">{int.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{int.category} · {int.events}</p>
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
              <button className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:border-border hover:text-foreground/70 transition-colors">
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Available */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Available to Connect</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          {available.map((int) => (
            <div key={int.name} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-border transition-colors">
              <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                <BrandIcon si={int.si} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/90">{int.name}</p>
                <p className="text-xs text-muted-foreground/60">{int.category}</p>
              </div>
              <button className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
