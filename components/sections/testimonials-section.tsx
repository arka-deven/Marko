"use client"

import { motion } from "motion/react"
import { TestimonialsColumn } from "@/components/ui/testimonials-column"

const testimonials = [
  {
    text: "Marko changed how we approach growth entirely. We went from 2 experiments a month to 20+ — and the AI-validated ones actually convert.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    name: "Jordan Ellis",
    role: "Head of Growth, Veritas",
  },
  {
    text: "The ROI tracking alone made it worth it. We finally know which experiments move revenue vs. which ones just feel productive.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Alex Mercer",
    role: "VP Marketing, Luminary Labs",
  },
  {
    text: "From idea to executed content in under 24 hours. Marko is the growth operator we've always wanted but never found.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Morgan Blake",
    role: "Co-Founder, Cascade.io",
  },
  {
    text: "We ran 40 experiments in our first month. Marko validated 35 of them automatically. Two turned into our core acquisition channels.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "Sam Rivera",
    role: "Director of Strategy, Orbit",
  },
  {
    text: "The content engine is elite. Multilingual SEO articles, social posts, email sequences — Marko writes them all and tracks what lands.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    name: "Taylor Nguyen",
    role: "Content Lead, Meridian",
  },
  {
    text: "Finally, a tool that treats growth like engineering. Hypothesis → experiment → data → iterate. Marko runs the whole loop.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "Jamie Okafor",
    role: "CEO, Northfield Digital",
  },
  {
    text: "Our team's velocity doubled in 6 weeks. We spend zero time debating ideas now — Marko tells us what the data says to pursue.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    name: "Riley Sutton",
    role: "Growth Engineer, Apex Stack",
  },
  {
    text: "Integrations with GA, Stripe, and Slack took minutes. Marko started surfacing insights we'd been manually chasing for months.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    name: "Drew Kim",
    role: "Operations Lead, Driftwood",
  },
  {
    text: "We scaled to 5 languages in 3 weeks with Marko's content engine. Each market is now getting targeted experiments. Insane leverage.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Cameron Walsh",
    role: "International Growth, Sova",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const logos = ["Veritas", "Luminary", "Cascade", "Northfield", "Meridian", "Apex Stack"]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-6 py-24 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-xl mx-auto mb-12"
        >
          <div className="border border-zinc-800 py-1.5 px-4 rounded-full text-sm text-zinc-400">Testimonials</div>

          <h2 className="font-display text-4xl md:text-5xl font-bold text-zinc-100 mt-6 text-center tracking-tight">
            Results from real growth teams
          </h2>
          <p className="text-center mt-4 text-zinc-500 text-lg text-balance">
            Hear from teams who replaced guesswork with Marko's systematic growth engine.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>

        <div className="mt-16 pt-16 border-t border-zinc-800/50">
          <p className="text-center text-sm text-zinc-500 mb-8">Trusted by industry leaders</p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
              className="flex gap-12 md:gap-16"
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                x: {
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate logos for seamless loop */}
              {[...logos, ...logos].map((logo, index) => (
                <span
                  key={`${logo}-${index}`}
                  className="text-xl font-semibold text-zinc-700 whitespace-nowrap flex-shrink-0"
                >
                  {logo}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
