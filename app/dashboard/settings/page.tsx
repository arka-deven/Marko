"use client"

import type React from "react"
import { Settings, User, Bell, Lock, CreditCard, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:outline-none focus:border-border transition-all"
      />
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
        className={cn(
          "relative w-9 h-5 rounded-full border transition-colors shrink-0 mt-0.5",
          defaultOn ? "bg-zinc-300 border-zinc-400" : "bg-secondary border-border"
        )}
      >
        <span className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all",
          defaultOn ? "left-4" : "left-0.5"
        )} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-6 w-full">      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-xl font-bold text-foreground/90">
            M
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/90">My Workspace</p>
            <button className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors mt-0.5">Change avatar →</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name"  defaultValue="Marko User" />
          <Field label="Email"      defaultValue="user@marko.app" type="email" />
        </div>
        <Field label="Workspace Name" defaultValue="My Workspace" />
        <button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
          Save Changes
        </button>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <Toggle label="Experiment Results"      description="Get notified when an experiment reaches significance." defaultOn={true} />
        <Toggle label="Weekly Digest"           description="Receive a summary of all experiments every Monday." defaultOn={true} />
        <Toggle label="AI Idea Suggestions"     description="Get notified when Marko generates new experiment ideas." defaultOn={false} />
        <Toggle label="Integration Errors"      description="Alert when a connected integration fails or disconnects." defaultOn={true} />
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Current Password" defaultValue="" type="password" />
          <Field label="New Password"     defaultValue="" type="password" />
        </div>
        <Toggle label="Two-Factor Authentication" description="Add an extra layer of security to your account." defaultOn={false} />
        <button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
          Update Password
        </button>
      </Section>

      {/* Plan */}
      <Section icon={CreditCard} title="Plan & Billing">
        <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 border border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Up to 5 experiments · 1 workspace</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-colors">
            Upgrade
          </button>
        </div>
      </Section>

      {/* Danger */}
      <div className="rounded-2xl border border-red-900/40 bg-red-950/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-900/30">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/70">Delete workspace</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">This will permanently delete all experiments, reports, and data.</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-950/30 transition-colors text-sm">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  )
}
