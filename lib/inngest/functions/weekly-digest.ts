import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { weeklyDigestTemplate } from "@/lib/resend/templates"
import { logger } from "@/lib/logger"

export const weeklyDigest = inngest.createFunction(
  { id: "weekly-digest", triggers: [{ cron: "TZ=UTC 0 9 * * 1" }] },
  async ({ step }) => {
    await step.run("send-weekly-digest", async () => {
      const supabase = createAdminClient()
      const resend = new Resend(process.env.RESEND_API_KEY)

      const { data: workspaces } = await supabase.from("workspaces").select("id, name")
      if (!workspaces) return

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      for (const workspace of workspaces) {
        const { data: automation } = await supabase
          .from("automations")
          .select("id, status, run_count")
          .eq("workspace_id", workspace.id)
          .eq("name", "Weekly Digest")
          .single()

        if (automation?.status === "paused") continue

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("workspace_id", workspace.id)
          .eq("notification_weekly_digest", true)
          .single()

        if (!profile) continue

        const { data: runningExperiments } = await supabase
          .from("experiments")
          .select("id")
          .eq("workspace_id", workspace.id)
          .eq("status", "running")

        const { data: queuedIdeas } = await supabase
          .from("ideas")
          .select("id")
          .eq("workspace_id", workspace.id)
          .eq("status", "queued")

        const { data: allExperiments } = await supabase
          .from("experiments")
          .select("id, name, lift, status")
          .eq("workspace_id", workspace.id)
          .in("status", ["winner", "running"])

        const topExperiment =
          allExperiments
            ?.sort((a, b) => (b.lift ?? 0) - (a.lift ?? 0))
            .find((e) => e.lift !== null)?.name ?? null

        const { data: weeklyWinners } = await supabase
          .from("experiments")
          .select("id")
          .eq("workspace_id", workspace.id)
          .eq("status", "winner")
          .gte("ended_at", sevenDaysAgo)

        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
        if (!authUser?.user?.email) continue

        const template = weeklyDigestTemplate({
          workspaceName: workspace.name,
          running: runningExperiments?.length ?? 0,
          queued: queuedIdeas?.length ?? 0,
          topExperiment,
          weeklyWins: weeklyWinners?.length ?? 0,
        })

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: authUser.user.email,
            subject: template.subject,
            html: template.html,
          })

          if (automation?.id) {
            await supabase.from("automations").update({
              run_count: (automation.run_count ?? 0) + 1,
              last_run_at: new Date().toISOString(),
            }).eq("id", automation.id)
          }
        } catch (err) {
          logger.error({ err, profileId: profile.id }, "[weekly-digest] Failed to send email")
          continue
        }
      }
    })
  }
)
