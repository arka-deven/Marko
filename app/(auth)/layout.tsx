import type React from "react"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary border border-border">
          <Sparkles className="w-4.5 h-4.5 text-foreground" />
        </div>
        <span className="font-semibold text-lg text-foreground tracking-tight">Marko</span>
      </Link>
      {children}
    </div>
  )
}
