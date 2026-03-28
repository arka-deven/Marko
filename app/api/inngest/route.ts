import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { weeklyIdeaGeneration } from "@/lib/inngest/functions/weekly-ideas"
import { autoKillExperiments } from "@/lib/inngest/functions/auto-kill"
import { winnerNotification } from "@/lib/inngest/functions/winner-notification"
import { monthlyReportGeneration } from "@/lib/inngest/functions/monthly-report"
import { weeklyDigest } from "@/lib/inngest/functions/weekly-digest"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [weeklyIdeaGeneration, autoKillExperiments, winnerNotification, monthlyReportGeneration, weeklyDigest],
})
