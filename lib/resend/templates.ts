export function winnerNotificationTemplate(params: {
  experimentName: string
  lift: number | null
  workspaceName: string
}): { subject: string; html: string } {
  const liftText = params.lift !== null ? `+${params.lift}% lift` : "statistically significant results"
  return {
    subject: `Winner detected: ${params.experimentName}`,
    html: `<div style="background:#0f0f0f;color:#fff;font-family:sans-serif;padding:32px;border-radius:12px;max-width:600px;">
  <p style="color:#a3e635;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Marko</p>
  <h1 style="font-size:24px;font-weight:900;margin:8px 0 24px;">You have a winner 🏆</h1>
  <p style="color:#a1a1aa;font-size:14px;margin:0 0 16px;">Workspace: ${params.workspaceName}</p>
  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin:0 0 24px;">
    <p style="font-size:18px;font-weight:700;margin:0 0 8px;">${params.experimentName}</p>
    <p style="color:#a3e635;font-size:20px;font-weight:900;margin:0;">${liftText}</p>
  </div>
  <p style="color:#a1a1aa;font-size:13px;margin:0;">Log in to Marko to review results and promote this experiment.</p>
</div>`,
  }
}

export function weeklyDigestTemplate(params: {
  workspaceName: string
  running: number
  queued: number
  topExperiment: string | null
  weeklyWins: number
}): { subject: string; html: string } {
  const topExpHtml = params.topExperiment
    ? `<p style="color:#a1a1aa;font-size:14px;margin:0 0 4px;">Top experiment this week</p><p style="font-size:16px;font-weight:700;margin:0;">${params.topExperiment}</p>`
    : `<p style="color:#a1a1aa;font-size:14px;margin:0;">No winners yet this week — keep testing.</p>`
  return {
    subject: `Weekly digest — ${params.workspaceName}`,
    html: `<div style="background:#0f0f0f;color:#fff;font-family:sans-serif;padding:32px;border-radius:12px;max-width:600px;">
  <p style="color:#a3e635;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Marko</p>
  <h1 style="font-size:24px;font-weight:900;margin:8px 0 24px;">Your weekly growth digest</h1>
  <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px;">Workspace: ${params.workspaceName}</p>
  <div style="display:flex;gap:16px;margin:0 0 24px;">
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;flex:1;">
      <p style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Running</p>
      <p style="font-size:28px;font-weight:900;color:#a3e635;margin:0;">${params.running}</p>
    </div>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;flex:1;">
      <p style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Queued</p>
      <p style="font-size:28px;font-weight:900;margin:0;">${params.queued}</p>
    </div>
    <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;flex:1;">
      <p style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Wins</p>
      <p style="font-size:28px;font-weight:900;color:#a3e635;margin:0;">${params.weeklyWins}</p>
    </div>
  </div>
  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin:0 0 24px;">
    ${topExpHtml}
  </div>
  <p style="color:#a1a1aa;font-size:13px;margin:0;">Log in to Marko to view your full experiment pipeline.</p>
</div>`,
  }
}

export function monthlyReportTemplate(params: {
  workspaceName: string
  reportName: string
  totalExperiments: number
  winRate: number
}): { subject: string; html: string } {
  return {
    subject: `Monthly report ready — ${params.workspaceName}`,
    html: `<div style="background:#0f0f0f;color:#fff;font-family:sans-serif;padding:32px;border-radius:12px;max-width:600px;">
  <p style="color:#a3e635;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Marko</p>
  <h1 style="font-size:24px;font-weight:900;margin:8px 0 24px;">Your monthly report is ready</h1>
  <p style="color:#a1a1aa;font-size:14px;margin:0 0 24px;">Workspace: ${params.workspaceName}</p>
  <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin:0 0 24px;">
    <p style="font-size:16px;font-weight:700;margin:0 0 16px;">${params.reportName}</p>
    <div style="display:flex;gap:24px;">
      <div>
        <p style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Experiments</p>
        <p style="font-size:24px;font-weight:900;margin:0;">${params.totalExperiments}</p>
      </div>
      <div>
        <p style="color:#a1a1aa;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Win rate</p>
        <p style="font-size:24px;font-weight:900;color:#a3e635;margin:0;">${params.winRate}%</p>
      </div>
    </div>
  </div>
  <p style="color:#a1a1aa;font-size:13px;margin:0;">Log in to Marko to read your full AI-generated growth report.</p>
</div>`,
  }
}
