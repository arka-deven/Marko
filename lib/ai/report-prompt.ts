import type { Experiment } from "@/lib/types"

export function buildMonthlyReportPrompt(workspaceName: string, experiments: Experiment[]): string {
  const winners = experiments.filter((e) => e.status === "winner")
  const winRate = experiments.length > 0 ? Math.round((winners.length / experiments.length) * 100) : 0
  const lifts = winners.map((e) => e.lift).filter((l): l is number => l !== null)
  const avgLift = lifts.length > 0 ? Math.round(lifts.reduce((a, b) => a + b, 0) / lifts.length) : 0
  const top3 = winners
    .sort((a, b) => (b.lift ?? 0) - (a.lift ?? 0))
    .slice(0, 3)
    .map((e) => `${e.name} (${e.lift !== null ? `+${e.lift}% lift` : "winner"}, channel: ${e.channel})`)
    .join(", ")

  return `You are a growth strategist writing a monthly report for a marketing team.

Workspace: ${workspaceName}
Total experiments this month: ${experiments.length}
Win rate: ${winRate}%
Average lift from winners: ${avgLift}%
Top winning experiments: ${top3 || "none"}

Write a 300-500 word monthly growth report narrative covering four areas in flowing paragraphs: an executive summary of this month's results, a section on key wins and what drove them, a section on what to double down on next month based on the data, and a section on what to kill or deprioritize. Do not use markdown headers or bullet points. Write in plain, confident prose as if presenting to a growth-focused executive team. Keep the tone direct and data-driven.

Return ONLY the report text, no extra commentary.`
}
