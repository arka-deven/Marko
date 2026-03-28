import { inngest } from "@/lib/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { buildMonthlyReportPrompt } from "@/lib/ai/report-prompt"
import { logger } from "@/lib/logger"

export const monthlyReportGeneration = inngest.createFunction(
  { id: "monthly-report-generation", triggers: [{ cron: "TZ=UTC 0 8 1 * *" }] },
  async ({ step }) => {
    const workspaces = await step.run("fetch-all-workspaces", async () => {
      const supabase = createAdminClient()
      const { data } = await supabase.from("workspaces").select("id, name")
      return data ?? []
    })

    await step.run("generate-reports", async () => {
      const supabase = createAdminClient()

      const now = new Date()
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const monthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })

      for (const workspace of workspaces) {
        try {
          const { data: experiments } = await supabase
            .from("experiments")
            .select("*")
            .eq("workspace_id", workspace.id)
            .gte("created_at", startOfLastMonth)
            .lt("created_at", startOfThisMonth)

          if (!experiments || experiments.length === 0) continue

          const prompt = buildMonthlyReportPrompt(workspace.name, experiments)

          const message = await tracedClaude("monthly-report", [{ role: "user", content: prompt }], {
            workspaceId: workspace.id,
          })

          const text = message.content[0].type === "text" ? message.content[0].text : ""

          const reportName = `Monthly Report — ${monthLabel}`

          await supabase.from("reports").insert({
            workspace_id: workspace.id,
            name: reportName,
            report_type: "Monthly",
            content: {
              narrative: text,
              experiment_count: experiments.length,
            },
            page_count: 1,
            shared: false,
          })
        } catch (err) {
          logger.error({ err, workspaceId: workspace.id }, "[monthly-report] Failed for workspace")
          continue
        }
      }
    })
  }
)
