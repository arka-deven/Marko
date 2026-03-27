import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-56 min-h-screen">
        <Header />
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
