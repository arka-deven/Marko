import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest/client"
import { weeklyIdeaGeneration } from "@/lib/inngest/functions/weekly-ideas"
import { autoKillExperiments } from "@/lib/inngest/functions/auto-kill"
import { winnerNotification } from "@/lib/inngest/functions/winner-notification"
import { monthlyReportGeneration } from "@/lib/inngest/functions/monthly-report"
import { weeklyDigest } from "@/lib/inngest/functions/weekly-digest"
import { onIdeaApproved } from "@/lib/inngest/functions/on-idea-approved"
import { checkHighsfieldJobs } from "@/lib/inngest/functions/check-higgsfield-jobs"
import { syncBufferMetrics } from "@/lib/inngest/functions/sync-buffer-metrics"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // Scheduled
    weeklyIdeaGeneration,     // Mon 9am UTC — generates ideas for inbox
    autoKillExperiments,      // Daily — kills failing experiments
    monthlyReportGeneration,  // 1st of month — generates report
    weeklyDigest,             // Mon 9am UTC — emails summary
    checkHighsfieldJobs,      // Every 10min — polls video render status
    syncBufferMetrics,          // Daily 6am UTC — pulls metrics from Buffer
    // Event-driven
    onIdeaApproved,           // idea/approved — generates content assets
    winnerNotification,       // experiment/status-changed — emails on winner
  ],
})
