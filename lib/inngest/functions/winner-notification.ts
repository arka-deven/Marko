import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { winnerNotificationTemplate } from "@/lib/resend/templates"
import { logger } from "@/lib/logger"

export const winnerNotification = inngest.createFunction(
  { id: "winner-notification", triggers: [{ event: "experiment/status-changed" }] },
  async ({ event, step }) => {
    if (event.data.newStatus !== "winner") return

    // Check if Winner Notification automation is active for this workspace
    const supabaseCheck = createAdminClient()
    const { data: autoStatus } = await supabaseCheck
      .from("automations")
      .select("status")
      .eq("workspace_id", event.data.workspaceId)
      .eq("name", "Winner Notification")
      .single()

    if (autoStatus?.status === "paused") return

    const { experiment, profile, workspaceName } = await step.run(
      "fetch-experiment-and-profile",
      async () => {
        const supabase = createAdminClient()

        const { data: experiment } = await supabase
          .from("experiments")
          .select("*")
          .eq("id", event.data.experimentId)
          .single()

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("workspace_id", event.data.workspaceId)
          .eq("notification_experiment_results", true)
          .single()

        const { data: workspace } = await supabase
          .from("workspaces")
          .select("name")
          .eq("id", event.data.workspaceId)
          .single()

        return {
          experiment,
          profile,
          workspaceName: workspace?.name ?? "",
        }
      }
    )

    await step.run("send-winner-email", async () => {
      if (!profile) return

      const supabase = createAdminClient()
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id)
      if (!authUser?.user?.email) return

      const template = winnerNotificationTemplate({
        experimentName: experiment?.name ?? "",
        lift: experiment?.lift ?? null,
        workspaceName,
      })

      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: authUser.user.email,
          subject: template.subject,
          html: template.html,
        })

        // Update the automation run stats
        const { data: automation } = await supabase
          .from("automations")
          .select("id, run_count")
          .eq("workspace_id", event.data.workspaceId)
          .eq("name", "Winner Notification")
          .single()

        if (automation?.id) {
          await supabase.from("automations").update({
            run_count: (automation.run_count ?? 0) + 1,
            last_run_at: new Date().toISOString(),
          }).eq("id", automation.id)
        }
      } catch (err) {
        logger.error({ err, experimentId: event.data.experimentId }, "[winner-notification] Failed to send email")
        // Don't rethrow — notification failure shouldn't crash the function
      }
    })
  }
)
