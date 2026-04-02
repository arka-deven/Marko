"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Overview",       href: "/dashboard" },
  { label: "Inbox",          href: "/dashboard/ideas" },
  { label: "Content Queue",  href: "/dashboard/queue" },
  { label: "Analytics",      href: "/dashboard/analytics" },
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
    <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col bg-background border-r border-border">
      {/* Logo */}
      <div className="flex items-center px-5 h-14 border-b border-border">
        <span className="font-semibold text-sm text-foreground tracking-tight">Marko</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          )}
        >
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
