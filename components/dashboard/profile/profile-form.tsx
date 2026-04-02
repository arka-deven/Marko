"use client"

import { useState } from "react"
import type React from "react"
import { User, Building2, Bell, Shield, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface ProfileFormProps {
  fullName: string
  email: string
  workspaceName: string
  workspaceWebsite: string
  workspaceSlug: string | null
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

export function ProfileForm({
  fullName,
  email,
  workspaceName,
  workspaceWebsite,
  workspaceSlug,
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
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-600 to-zinc-800 border border-border flex items-center justify-center text-2xl font-bold text-foreground">
                {userInitial}
              </div>
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="Change avatar"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg"
              >
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-foreground">
                {`${firstName} ${lastName}`.trim() || email}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-emerald-400/10 border-emerald-400/20 text-emerald-400" variant="outline">
                  Active
                </Badge>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Personal info */}
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <IconBadge icon={User} />
            <CardTitle className="text-sm">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Last Name</label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={email} type="email" disabled />
              <p className="text-[10px] text-muted-foreground/60">Email cannot be changed here.</p>
            </div>
            <Button
              variant="secondary"
              disabled={saving === "profile"}
              onClick={() => save("profile", { profile: { full_name: `${firstName} ${lastName}`.trim() } })}
            >
              {saving === "profile" ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Workspace */}
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <IconBadge icon={Building2} />
            <CardTitle className="text-sm">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
              <Input value={wsName} onChange={e => setWsName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Workspace URL</label>
              <Input value={workspaceSlug ? `marko.app/w/${workspaceSlug}` : ""} disabled />
              <p className="text-[10px] text-muted-foreground/60">Public URL for your workspace.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Website</label>
              <Input
                value={wsWebsite}
                onChange={e => setWsWebsite(e.target.value)}
                type="url"
                placeholder="https://yoursite.com"
              />
              <p className="text-[10px] text-muted-foreground/60">Optional -- shown on your public profile.</p>
            </div>
            <Button
              variant="secondary"
              disabled={saving === "workspace"}
              onClick={() => save("workspace", { workspace: { name: wsName, website: wsWebsite || null } })}
            >
              {saving === "workspace" ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <IconBadge icon={Bell} />
            <CardTitle className="text-sm">Notification Preferences</CardTitle>
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
              disabled={saving === "notifications"}
              onClick={() => save("notifications", {
                profile: {
                  notification_experiment_results: notifs.experimentResults,
                  notification_weekly_digest:      notifs.weeklyDigest,
                  notification_ai_ideas:           notifs.aiIdeas,
                  notification_integration_errors: notifs.integrationErrors,
                },
              })}
            >
              {saving === "notifications" ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <IconBadge icon={Shield} />
            <CardTitle className="text-sm">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
            <Button
              variant="secondary"
              disabled={saving === "password"}
              onClick={updatePassword}
            >
              {saving === "password" ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>

    </>
  )
}
