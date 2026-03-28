"use client"

import { useState } from "react"
import type React from "react"
import { User, Building2, Bell, Shield, CreditCard, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProfileFormProps {
  fullName: string
  email: string
  workspaceName: string
  workspaceWebsite: string
  workspaceSlug: string | null
  plan: string
  notifications: {
    experimentResults: boolean
    weeklyDigest: boolean
    aiIdeas: boolean
    integrationErrors: boolean
  }
  stats: { experiments: number; automations: number; reports: number }
}

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
  value,
  onChange,
  type = "text",
  hint,
  disabled,
  placeholder,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  hint?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:outline-none transition-all disabled:text-foreground/50 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
    </div>
  )
}

function SaveButton({ saving, label = "Save Changes", onClick }: { saving: boolean; label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70 disabled:opacity-50"
    >
      {saving ? "Saving…" : label}
    </button>
  )
}

export function ProfileForm({
  fullName,
  email,
  workspaceName,
  workspaceWebsite,
  workspaceSlug,
  plan,
  notifications,
  stats,
}: ProfileFormProps) {
  const nameParts = fullName.trim().split(" ")
  const [firstName, setFirstName] = useState(nameParts[0] ?? "")
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "))
  const [wsName, setWsName] = useState(workspaceName)
  const [wsWebsite, setWsWebsite] = useState(workspaceWebsite)
  const [notifs, setNotifs] = useState(notifications)
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError] = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  const userInitial = (firstName[0] ?? email[0] ?? "U").toUpperCase()

  async function save(key: string, body: object) {
    setSaving(key)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      toast.success("Profile saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(null)
    }
  }

  async function updatePassword() {
    setPwError("")
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return }
    if (newPw.length < 8) { setPwError("Minimum 8 characters"); return }
    setSaving("password")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPw })
      if (error) { setPwError(error.message); return }
      toast.success("Password updated")
      setNewPw("")
      setConfirmPw("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setSaving(null)
    }
  }

  return (
    <>
      {/* Avatar card */}
      <div className="rounded-2xl bg-card/80 border border-border p-6">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-600 to-zinc-800 border border-border flex items-center justify-center text-2xl font-bold text-foreground">
              {userInitial}
            </div>
            <button
              aria-label="Change avatar"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-foreground">
              {`${firstName} ${lastName}`.trim() || email}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-foreground/70 capitalize">
                {plan} Plan
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs font-medium text-emerald-400">
                Active
              </span>
            </div>
          </div>

          <div className="hidden xl:grid grid-cols-3 gap-6 shrink-0">
            {[
              { label: "Experiments", value: stats.experiments },
              { label: "Automations", value: stats.automations },
              { label: "Reports",     value: stats.reports },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-foreground tracking-tighter">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Personal info */}
        <Section icon={User} title="Personal Information">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" value={firstName} onChange={setFirstName} />
            <Field label="Last Name"  value={lastName}  onChange={setLastName} />
          </div>
          <Field label="Email" value={email} type="email" disabled hint="Email cannot be changed here." />
          <SaveButton
            saving={saving === "profile"}
            onClick={() => save("profile", { profile: { full_name: `${firstName} ${lastName}`.trim() } })}
          />
        </Section>

        {/* Workspace */}
        <Section icon={Building2} title="Workspace">
          <Field label="Workspace Name" value={wsName} onChange={setWsName} />
          <Field
            label="Workspace URL"
            value={workspaceSlug ? `marko.app/w/${workspaceSlug}` : ""}
            disabled
            hint="Public URL for your workspace."
          />
          <Field
            label="Website"
            value={wsWebsite}
            onChange={setWsWebsite}
            type="url"
            placeholder="https://yoursite.com"
            hint="Optional — shown on your public profile."
          />
          <SaveButton
            saving={saving === "workspace"}
            onClick={() => save("workspace", { workspace: { name: wsName, website: wsWebsite || null } })}
          />
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notification Preferences">
          {([
            { key: "experimentResults" as const, label: "Experiment Results",  desc: "Get notified when an experiment reaches significance." },
            { key: "weeklyDigest"       as const, label: "Weekly Digest",       desc: "Receive a summary of all experiments every Monday." },
            { key: "aiIdeas"            as const, label: "AI Idea Suggestions", desc: "Get notified when Marko generates new experiment ideas." },
            { key: "integrationErrors"  as const, label: "Integration Errors",  desc: "Alert when a connected integration fails or disconnects." },
          ]).map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/90">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                className={`relative w-9 h-5 rounded-full border transition-colors shrink-0 mt-0.5 ${
                  notifs[key] ? "bg-zinc-300 border-zinc-400" : "bg-secondary border-border"
                }`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all ${notifs[key] ? "left-4" : "left-0.5"}`} />
              </button>
            </div>
          ))}
          <SaveButton
            saving={saving === "notifications"}
            label="Save Preferences"
            onClick={() => save("notifications", {
              profile: {
                notification_experiment_results: notifs.experimentResults,
                notification_weekly_digest:      notifs.weeklyDigest,
                notification_ai_ideas:           notifs.aiIdeas,
                notification_integration_errors: notifs.integrationErrors,
              },
            })}
          />
        </Section>

        {/* Security */}
        <Section icon={Shield} title="Security">
          <Field label="New Password"     value={newPw}      onChange={setNewPw}      type="password" />
          <Field label="Confirm Password" value={confirmPw}  onChange={setConfirmPw}  type="password" />
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          <SaveButton
            saving={saving === "password"}
            label="Update Password"
            onClick={updatePassword}
          />
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
              <p className="text-sm font-semibold text-foreground capitalize">{plan} Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {plan === "free"
                  ? "Up to 5 experiments · 1 workspace · Community support"
                  : "Unlimited experiments · Full features · Priority support"}
              </p>
            </div>
            {plan === "free" && (
              <button className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-colors">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
