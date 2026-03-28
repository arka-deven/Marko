import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GenerateButton } from "@/components/dashboard/ideas/generate-button"
import { IdeasList } from "@/components/dashboard/ideas/ideas-list"
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

  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .eq("workspace_id", profile.workspace_id)
    .in("status", ["ready", "queued"])
    .order("created_at", { ascending: false })

  const { count: launchedCount } = await supabase
    .from("ideas")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", profile.workspace_id)
    .eq("status", "launched")

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ideas</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-generated experiment ideas ready to launch &mdash; {launchedCount ?? 0} launched all time</p>
        </div>
        <GenerateButton />
      </div>
      <IdeasList ideas={(ideas ?? []) as Idea[]} />
    </div>
  )
}
