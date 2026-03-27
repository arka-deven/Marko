"use client"

import { User, Mail, Building2, Globe, Bell, Shield, CreditCard, Camera } from "lucide-react"
import type React from "react"

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <IconBadge icon={icon} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  defaultValue,
  type = "text",
  hint,
}: {
  label: string
  defaultValue: string
  type?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:outline-none focus:border-border transition-all"
      />
      {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-foreground/90">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        className={`relative w-9 h-5 rounded-full border transition-colors shrink-0 mt-0.5 ${
          defaultOn ? "bg-zinc-300 border-zinc-400" : "bg-secondary border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all ${
            defaultOn ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="space-y-6 w-full">      {/* Avatar card */}
      <div className="rounded-2xl bg-card/80 border border-border p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-600 to-zinc-800 border border-border flex items-center justify-center text-2xl font-bold text-foreground">
              M
            </div>
            <button
              aria-label="Change avatar"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-foreground">Marko User</p>
            <p className="text-sm text-muted-foreground mt-0.5">user@marko.app</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground/70">
                Free Plan
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden xl:grid grid-cols-3 gap-6 shrink-0">
            {[
              { label: "Experiments", value: "134" },
              { label: "Automations", value: "12" },
              { label: "Reports",     value: "5" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-foreground tracking-tighter">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Personal info */}
        <Section icon={User} title="Personal Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" defaultValue="Marko" />
            <Field label="Last Name"  defaultValue="User" />
          </div>
          <Field label="Email"    defaultValue="user@marko.app" type="email" hint="Used for notifications and login." />
          <Field label="Username" defaultValue="@markouser" hint="Your unique handle on the platform." />
          <button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
            Save Changes
          </button>
        </Section>

        {/* Workspace */}
        <Section icon={Building2} title="Workspace">
          <Field label="Workspace Name" defaultValue="My Workspace" />
          <Field label="Workspace URL"  defaultValue="marko.app/w/myworkspace" hint="Public URL for your workspace." />
          <Field label="Website"        defaultValue="" type="url" hint="Optional — shown on your public profile." />
          <button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
            Save Changes
          </button>
        </Section>

        {/* Notification prefs */}
        <Section icon={Bell} title="Notification Preferences">
          <Toggle label="Experiment Results"  description="Get notified when an experiment reaches significance." defaultOn={true} />
          <Toggle label="Weekly Digest"       description="Receive a summary of all experiments every Monday."  defaultOn={true} />
          <Toggle label="AI Idea Suggestions" description="Get notified when Marko generates new experiment ideas." defaultOn={false} />
          <Toggle label="Integration Errors"  description="Alert when a connected integration fails or disconnects." defaultOn={true} />
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <Field label="Current Password" defaultValue="" type="password" />
          <Field label="New Password"     defaultValue="" type="password" />
          <Field label="Confirm Password" defaultValue="" type="password" />
          <Toggle label="Two-Factor Authentication" description="Add an extra layer of security to your account." defaultOn={false} />
          <button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
            Update Password
          </button>
        </Section>
      </div>

      {/* Plan */}
      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <IconBadge icon={CreditCard} />
          <h2 className="text-sm font-semibold text-foreground">Plan & Billing</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Free Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Up to 5 experiments · 1 workspace · Community support</p>
            </div>
            <button className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
