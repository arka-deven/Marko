"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, FlaskConical, BarChart3, Zap,
  Lightbulb, Plug, FileText, Settings, Sparkles, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navSections = [
  {
    label: "Core",
    items: [
      { label: "Overview",     href: "/dashboard",              icon: LayoutDashboard },
      { label: "Experiments",  href: "/dashboard/experiments",  icon: FlaskConical },
      { label: "Analytics",    href: "/dashboard/analytics",    icon: BarChart3 },
    ],
  },
  {
    label: "AI",
    items: [
      { label: "Ideas",        href: "/dashboard/ideas",        icon: Lightbulb },
      { label: "Automations",  href: "/dashboard/automations",  icon: Zap },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
      { label: "Reports",      href: "/dashboard/reports",      icon: FileText },
    ],
  },
]

interface UserInfo {
  email: string
  fullName: string
  initials: string
  workspaceId: string
}

export function Sidebar({ userInfo }: { userInfo: UserInfo }) {
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
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href
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
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — Settings + User */}
      <div className="px-3 py-4 border-t border-border space-y-2">
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

        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
            {userInfo.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {userInfo.fullName || userInfo.email}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{userInfo.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
