import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, workspace_id")
    .eq("id", user.id)
    .single()

  const { data: workspace } = profile?.workspace_id
    ? await supabase.from("workspaces").select("name").eq("id", profile.workspace_id).single()
    : { data: null }

  return (
    <ProfileForm
      fullName={profile?.full_name ?? ""}
      email={user.email ?? ""}
      workspaceName={workspace?.name ?? "My Workspace"}
    />
  )
}
