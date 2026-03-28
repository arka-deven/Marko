import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"

export default async function SettingsPage() {
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

  return (
    <SettingsForm
      fullName={profile?.full_name ?? ""}
      email={user?.email ?? ""}
      workspaceName={workspace?.name ?? "My Workspace"}
      plan={workspace?.plan ?? "free"}
      notifications={{
        experimentResults: profile?.notification_experiment_results ?? true,
        weeklyDigest:      profile?.notification_weekly_digest ?? true,
        aiIdeas:           profile?.notification_ai_ideas ?? false,
        integrationErrors: profile?.notification_integration_errors ?? true,
      }}
    />
  )
}
