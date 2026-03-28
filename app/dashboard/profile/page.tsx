import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: workspace } = profile?.workspace_id
    ? await supabase.from("workspaces").select("*").eq("id", profile.workspace_id).single()
    : { data: null }

  // Count workspace items for stats
  const [
    { count: expsCount },
    { count: autosCount },
    { count: reportsCount },
  ] = await Promise.all([
    supabase.from("experiments").select("*", { count: "exact", head: true }).eq("workspace_id", profile?.workspace_id),
    supabase.from("automations").select("*", { count: "exact", head: true }).eq("workspace_id", profile?.workspace_id),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("workspace_id", profile?.workspace_id),
  ])

  return (
    <div className="space-y-6 w-full">
      <ProfileForm
        fullName={profile?.full_name ?? ""}
        email={user?.email ?? ""}
        workspaceName={workspace?.name ?? "My Workspace"}
        workspaceWebsite={workspace?.website ?? ""}
        workspaceSlug={workspace?.slug ?? null}
        notifications={{
          experimentResults: profile?.notification_experiment_results ?? true,
          weeklyDigest:      profile?.notification_weekly_digest ?? true,
          aiIdeas:           profile?.notification_ai_ideas ?? false,
          integrationErrors: profile?.notification_integration_errors ?? true,
        }}
        stats={{
          experiments: expsCount ?? 0,
          automations: autosCount ?? 0,
          reports:     reportsCount ?? 0,
        }}
      />
    </div>
  )
}
