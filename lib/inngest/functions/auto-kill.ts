import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { logger } from "@/lib/logger"

export const autoKillExperiments = inngest.createFunction(
  { id: "auto-kill-experiments", triggers: [{ cron: "TZ=UTC 0 6 * * *" }] },
  async ({ step }) => {
    await step.run("find-and-kill-experiments", async () => {
      const supabase = createAdminClient()

      const { data: workspaces } = await supabase.from("workspaces").select("id")
      if (!workspaces) return { killed: 0 }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      let totalKilled = 0

      for (const workspace of workspaces) {
        try {
          const { data: automation } = await supabase
            .from("automations")
            .select("id, status, run_count")
            .eq("workspace_id", workspace.id)
            .eq("name", "Auto-Kill Failing Experiments")
            .single()

          if (automation?.status === "paused") continue

          const { data: experiments } = await supabase
            .from("experiments")
            .select("id, lift")
            .eq("workspace_id", workspace.id)
            .eq("status", "running")
            .lte("started_at", thirtyDaysAgo)

          if (!experiments || experiments.length === 0) {
            if (automation?.id) {
              await supabase.from("automations").update({
                run_count: (automation.run_count ?? 0) + 1,
                last_run_at: new Date().toISOString(),
              }).eq("id", automation.id)
            }
            continue
          }

          const toKill = experiments.filter((e) => e.lift === null || e.lift < 3)

          if (toKill.length > 0) {
            await supabase
              .from("experiments")
              .update({ status: "failed", ended_at: new Date().toISOString() })
              .in("id", toKill.map((e) => e.id))

            totalKilled += toKill.length
            logger.info({ count: toKill.length, workspaceId: workspace.id }, "[auto-kill] Killed experiments")
          }

          if (automation?.id) {
            await supabase.from("automations").update({
              run_count: (automation.run_count ?? 0) + 1,
              last_run_at: new Date().toISOString(),
            }).eq("id", automation.id)
          }
        } catch (err) {
          logger.error({ err, workspaceId: workspace.id }, "[auto-kill] Failed for workspace")
        }
      }

      return { killed: totalKilled }
    })
  }
)
