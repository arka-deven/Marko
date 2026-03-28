import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExperimentsTable } from "@/components/dashboard/experiments/experiments-table"
import { NewExperimentButton } from "@/components/dashboard/experiments/new-experiment-dialog"
import type { Experiment } from "@/lib/types"

export default async function ExperimentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user.id)
    .single()

  if (!profile?.workspace_id) redirect("/login")

  const { data: experiments } = await supabase
    .from("experiments")
    .select("*")
    .eq("workspace_id", profile.workspace_id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all growth experiments</p>
        </div>
        <NewExperimentButton />
      </div>
      <ExperimentsTable experiments={(experiments ?? []) as Experiment[]} />
    </div>
  )
}
