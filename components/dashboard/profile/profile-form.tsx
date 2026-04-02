"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

interface ProfileFormProps {
  fullName: string
  email: string
  workspaceName: string
}

export function ProfileForm({ fullName, email, workspaceName }: ProfileFormProps) {
  const [name, setName]     = useState(fullName)
  const [wsName, setWsName] = useState(workspaceName)
  const [newPw, setNewPw]   = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError]     = useState("")
  const [saving, setSaving] = useState<string | null>(null)

  const userInitial = (name[0] ?? email[0] ?? "U").toUpperCase()

  async function saveProfile() {
    setSaving("profile")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { full_name: name }, workspace: { name: wsName } }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Profile saved")
    } catch {
      toast.error("Failed to save profile")
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
    } catch {
      toast.error("Failed to update password")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-5 w-full max-w-2xl">

      {/* Avatar card */}
      <Card className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-2xl font-bold text-foreground shrink-0">
          {userInitial}
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">{name || email}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs font-medium text-emerald-400">
            Active
          </span>
        </div>
      </Card>

      {/* Profile + Workspace */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={email}
              disabled
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground/50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
            <input
              value={wsName}
              onChange={e => setWsName(e.target.value)}
              className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving === "profile"}
            className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-sm font-medium text-foreground/70 disabled:opacity-50 transition-colors"
          >
            {saving === "profile" ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Card>

      {/* Password */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className="w-full bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          <button
            onClick={updatePassword}
            disabled={saving === "password"}
            className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 text-sm font-medium text-foreground/70 disabled:opacity-50 transition-colors"
          >
            {saving === "password" ? "Updating…" : "Update Password"}
          </button>
        </div>
      </Card>

    </div>
  )
}
