import { Inbox } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IdeaInbox } from "@/components/dashboard/ideas/idea-inbox"
import type { Idea } from "@/lib/types"

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user.id)
    .single()

  if (!profile?.workspace_id) redirect("/login")

  const { data: queued } = await supabase
    .from("ideas")
    .select("*")
    .eq("workspace_id", profile.workspace_id)
    .eq("status", "queued")
    .order("created_at", { ascending: false })

  const { count: approvedTotal } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", profile.workspace_id)
    .eq("status", "approved")

  const { count: rejectedTotal } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", profile.workspace_id)
    .eq("status", "rejected")

  const ideas = (queued ?? []) as Idea[]

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-foreground/70" />
            Ideas Inbox
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monday&apos;s AI-generated ideas. Approve to generate content, reject to skip.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span><span className="text-emerald-500 font-semibold">{approvedTotal ?? 0}</span> approved all-time</span>
          <span><span className="text-red-500 font-semibold">{rejectedTotal ?? 0}</span> rejected</span>
        </div>
      </div>

      <div className="rounded-2xl bg-card/80 border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4 text-foreground/70" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">Pending Review</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ideas.length > 0
                ? `${ideas.length} idea${ideas.length !== 1 ? "s" : ""} waiting — approve to start content generation`
                : "No ideas pending"}
            </p>
          </div>
        </div>
        <IdeaInbox ideas={ideas} />
      </div>
    </div>
  )
}
