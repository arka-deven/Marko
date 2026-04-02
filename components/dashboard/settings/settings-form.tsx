"use client"

import { useState } from "react"
import type React from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

interface SettingsFormProps {
  fullName: string
  email: string
  workspaceName: string
  notifications: {
    experimentResults: boolean
    weeklyDigest: boolean
    aiIdeas: boolean
    integrationErrors: boolean
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </Card>
  )
}

export function SettingsForm({ fullName, email, workspaceName, notifications }: SettingsFormProps) {
  const [name, setName] = useState(fullName)
  const [wsName, setWsName] = useState(workspaceName)
  const [notifs, setNotifs] = useState(notifications)
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const userInitial = (name[0] ?? email[0] ?? "U").toUpperCase()

  async function saveProfile() {
    setSaving("profile")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { full_name: name },
          workspace: { name: wsName },
        }),
      })
      if (!res.ok) throw new Error("Failed to save profile")
      toast.success("Profile saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(null)
    }
  }

  async function saveNotifications() {
    setSaving("notifs")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            notification_experiment_results: notifs.experimentResults,
            notification_weekly_digest:      notifs.weeklyDigest,
            notification_ai_ideas:           notifs.aiIdeas,
            notification_integration_errors: notifs.integrationErrors,
          },
        }),
      })
      if (!res.ok) throw new Error("Failed to save notifications")
      toast.success("Preferences saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences")
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

  function SaveBtn({ sKey, label = "Save Changes" }: { sKey: string; label?: string }) {
    return (
      <button
        onClick={sKey === "profile" ? saveProfile : sKey === "notifs" ? saveNotifications : updatePassword}
        disabled={saving === sKey}
        className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70 disabled:opacity-50"
      >
        {saving === sKey ? "Saving…" : label}
      </button>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-xl font-bold text-foreground/90">
            {userInitial}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/90">{wsName}</p>
            <button className="text-xs text-muted-foreground hover:text-foreground/70 transition-colors mt-0.5">
              Change avatar →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={email}
              disabled
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/50 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
          <input
            value={wsName}
            onChange={e => setWsName(e.target.value)}
            className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 focus:outline-none transition-all"
          />
        </div>
        <SaveBtn sKey="profile" />
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
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
              className={cn(
                "relative w-9 h-5 rounded-full border transition-colors shrink-0 mt-0.5",
                notifs[key] ? "bg-zinc-300 border-zinc-400" : "bg-secondary border-border"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all",
                notifs[key] ? "left-4" : "left-0.5"
              )} />
            </button>
          </div>
        ))}
        <SaveBtn sKey="notifs" label="Save Preferences" />
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/90 focus:outline-none transition-all"
            />
          </div>
        </div>
        {pwError && <p className="text-xs text-red-400">{pwError}</p>}
        <SaveBtn sKey="password" label="Update Password" />
      </Section>

      {/* Danger */}
      <div className="rounded-2xl border border-red-900/40 bg-red-950/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-900/30">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/70">Delete workspace</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              This will permanently delete all experiments, reports, and data.
            </p>
          </div>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-950/30 transition-colors text-sm"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <button
                onClick={async () => {
                  try {
                    // Sign out and delete — for now just sign out since workspace delete needs backend
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = "/login"
                  } catch { toast.error("Failed to delete workspace") }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-xs hover:bg-red-950 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
