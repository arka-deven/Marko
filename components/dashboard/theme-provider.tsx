"use client"

import { createContext, useContext, useState } from "react"
import type React from "react"

type Theme = "dark" | "light"

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeCtx)
}

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div
        className={theme === "dark" ? "dark" : ""}
        style={
          theme === "light"
            ? {
                "--background": "oklch(0.97 0 0)",
                "--foreground": "oklch(0.145 0 0)",
                "--card": "oklch(1 0 0)",
                "--border": "oklch(0.88 0 0)",
                "--muted": "oklch(0.94 0 0)",
                "--muted-foreground": "oklch(0.45 0 0)",
              } as React.CSSProperties
            : {}
        }
      >
        {children}
      </div>
    </ThemeCtx.Provider>
  )
}
