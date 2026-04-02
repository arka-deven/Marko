"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Header({ userInitial = "U" }: { userInitial?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-20 flex items-center justify-end gap-2.5 px-5 h-12 bg-background/90 backdrop-blur-md border-b border-border">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        className="w-7 h-7 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors flex items-center justify-center text-[11px] text-muted-foreground font-medium"
      >
        {mounted && resolvedTheme === "dark" ? "L" : "D"}
      </button>

      {/* Avatar */}
      <Link
        href="/dashboard/settings"
        className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center text-[11px] font-semibold text-foreground hover:bg-secondary/80 transition-colors"
      >
        {userInitial}
      </Link>
    </header>
  )
}
