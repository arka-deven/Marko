import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export const autoKillExperiments = inngest.createFunction(
  { id: "auto-kill-experiments", triggers: [{ cron: "TZ=UTC 0 6 * * *" }] },
  async ({ step }) => {
    await step.run("find-and-kill-experiments", async () => {
      try {
        const supabase = createAdminClient()
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { data: experiments } = await supabase
          .from("experiments")
          .select("id, lift")
          .eq("status", "running")
          .lte("started_at", thirtyDaysAgo)

        if (!experiments || experiments.length === 0) return { killed: 0 }

        const toKill = experiments.filter((e) => e.lift === null || e.lift < 3)

        if (toKill.length === 0) return { killed: 0 }

        const now = new Date().toISOString()
        const ids = toKill.map((e) => e.id)

        await supabase
          .from("experiments")
          .update({ status: "failed", ended_at: now })
          .in("id", ids)

        logger.info({ count: toKill.length }, "[auto-kill] Killed experiments")
        return { killed: toKill.length }
      } catch (err) {
        logger.error({ err }, "[auto-kill] Failed")
        return { killed: 0 }
      }
    })
  }
)
