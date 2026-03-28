import Link from "next/link"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mb-6">Ready to put growth on autopilot?</h2>
        <p className="text-lg text-zinc-500 mb-10 text-balance">
          Join growth teams already running 30+ experiments simultaneously with Marko. Let the AI find what works — you scale it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <LiquidCtaButton>Get Started</LiquidCtaButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
