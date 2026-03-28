import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, workspace_id")
    .eq("id", user.id)
    .single()

  const userInfo = {
    email: user.email ?? "",
    fullName: profile?.full_name ?? "",
    initials: (profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase(),
    workspaceId: profile?.workspace_id ?? "",
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userInfo={userInfo} />
      <div className="flex flex-col flex-1 ml-56 min-h-screen">
        <Header userInitial={userInfo.initials} />
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
