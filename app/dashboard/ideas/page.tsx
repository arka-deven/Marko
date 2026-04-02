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

  const { data: queuedIdeas } = await supabase
    .from("ideas")
    .select("*")
    .eq("workspace_id", profile.workspace_id)
    .in("status", ["queued", "ready"])
    .order("created_at", { ascending: false })

  const ideas = (queuedIdeas ?? []) as Idea[]

  return (
    <IdeaInbox
      ideas={ideas}
      pendingCount={ideas.length}
    />
  )
}
