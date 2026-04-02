"use client"

import { useState } from "react"
import type React from "react"
import { User, Bell, Lock, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

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

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
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

  return (
    <div className="space-y-6 w-full">
      {/* Profile */}
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <IconBadge icon={User} />
          <CardTitle className="text-sm">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-xl font-bold text-foreground/90">
              {userInitial}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/90">{wsName}</p>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground/70">
                Change avatar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                value={email}
                disabled
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
            <Input
              value={wsName}
              onChange={e => setWsName(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={saveProfile}
            disabled={saving === "profile"}
          >
            {saving === "profile" ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <IconBadge icon={Bell} />
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Switch
                checked={notifs[key]}
                onCheckedChange={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
              />
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={saveNotifications}
            disabled={saving === "notifs"}
          >
            {saving === "notifs" ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <IconBadge icon={Lock} />
          <CardTitle className="text-sm">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <Input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <Input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
              />
            </div>
          </div>
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          <Button
            variant="secondary"
            onClick={updatePassword}
            disabled={saving === "password"}
          >
            {saving === "password" ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border-red-900/40 bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-sm text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/70">Delete workspace</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              This will permanently delete all experiments, reports, and data.
            </p>
          </div>
          {!confirmDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  try {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = "/login"
                  } catch { toast.error("Failed to delete workspace") }
                }}
              >
                Yes, delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
