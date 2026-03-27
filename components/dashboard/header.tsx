"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Plus, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":                { title: "Overview",     subtitle: "Your growth agent at a glance" },
  "/dashboard/experiments":    { title: "Experiments",  subtitle: "Manage and monitor all active experiments" },
  "/dashboard/analytics":      { title: "Analytics",    subtitle: "Performance trends across all experiments" },
  "/dashboard/ideas":          { title: "Ideas",        subtitle: "AI-generated experiment ideas ready to launch" },
  "/dashboard/automations":    { title: "Automations",  subtitle: "Workflows that run automatically in the background" },
  "/dashboard/integrations":   { title: "Integrations", subtitle: "Connect your stack so Marko reads signals everywhere" },
  "/dashboard/reports":        { title: "Reports",      subtitle: "Auto-generated reports from your growth data" },
  "/dashboard/settings":       { title: "Settings",     subtitle: "Manage your workspace and account preferences" },
  "/dashboard/profile":        { title: "Profile",      subtitle: "Manage your personal account and preferences" },
}

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const pathname = usePathname()
  const meta = pageMeta[pathname] ?? { title: "Dashboard", subtitle: "" }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 h-16 bg-background/90 backdrop-blur-md border-b border-border">
      <div>
        <h1 className="text-sm font-semibold text-foreground">{meta.title}</h1>
        <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="w-44 bg-secondary border border-border rounded-xl pl-8 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border transition-all"
          />
        </div>

        {/* New Experiment */}
        <button className="group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all duration-150">
          <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-xs font-medium text-foreground transition-colors">New Experiment</span>
        </button>

        {/* Bell */}
        <button
          aria-label="Notifications"
          className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all duration-150"
        >
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-foreground/60" />
        </button>

        {/* Theme toggle — far right */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all duration-150"
        >
          {mounted && resolvedTheme === "dark"
            ? <Sun className="w-3.5 h-3.5 text-muted-foreground" />
            : <Moon className="w-3.5 h-3.5 text-muted-foreground" />
          }
        </button>

        {/* Avatar → Profile */}
        <Link
          href="/dashboard/profile"
          className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
        >
          M
        </Link>
      </div>
    </header>
  )
}
