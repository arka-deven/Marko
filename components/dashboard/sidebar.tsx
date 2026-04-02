"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Inbox, Layers, BarChart3,
  Settings, Sparkles, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Overview",       href: "/dashboard",              icon: LayoutDashboard },
  { label: "Inbox",          href: "/dashboard/ideas",        icon: Inbox },
  { label: "Content Queue",  href: "/dashboard/queue",        icon: Layers },
  { label: "Analytics",      href: "/dashboard/analytics",    icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-secondary border border-border">
          <Sparkles className="w-4 h-4 text-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground tracking-tight">Marko</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-secondary text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 shrink-0",
                active ? "text-foreground" : "text-muted-foreground/60 group-hover:text-muted-foreground"
              )} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/dashboard/settings"
              ? "bg-secondary text-foreground border border-border"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
        >
          <Settings className={cn(
            "w-4 h-4 shrink-0",
            pathname === "/dashboard/settings"
              ? "text-foreground"
              : "text-muted-foreground/60 group-hover:text-muted-foreground"
          )} />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        >
          <LogOut className="w-4 h-4 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
