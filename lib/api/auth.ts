import { createClient } from "@/lib/supabase/server"

export interface AuthContext {
  userId: string
  workspaceId: string
  supabase: Awaited<ReturnType<typeof createClient>>
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user.id)
    .single()

  if (!profile?.workspace_id) return null

  return { userId: user.id, workspaceId: profile.workspace_id, supabase }
}
