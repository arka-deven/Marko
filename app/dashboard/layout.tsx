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
    .select("full_name")
    .eq("id", user.id)
    .single()

  const userInitial = (profile?.full_name ?? user.email ?? "U").charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-56 min-h-screen">
        <Header userInitial={userInitial} />
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
