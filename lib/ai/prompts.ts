import type { Experiment } from "@/lib/types"

export const SYSTEM_PROMPT = `You are Marko, an AI growth experimentation agent. Your job is to generate creative, data-driven experiment ideas that help teams grow their product or business.

Each idea should be:
- Specific and actionable (not vague like "improve SEO")
- Tied to a channel (Web, Email, Paid, Social, or Push)
- Rated by effort (Low, Medium, or High)
- Include an expected lift range (e.g., "+5-12%")
- Include a clear rationale explaining WHY this experiment could work

Draw on growth principles: social proof, urgency, personalization, friction reduction, value communication, onboarding optimization, retention hooks, and viral loops.

Always respond with valid JSON — an array of experiment idea objects.`

export function buildIdeaGenerationPrompt(
  existingExperiments: Pick<Experiment, "name" | "channel" | "status">[],
  count: number = 5
): string {
  const experimentContext = existingExperiments.length > 0
    ? `\n\nThe team has already run or is running these experiments (avoid duplicates):\n${existingExperiments.map((e) => `- "${e.name}" (${e.channel}, ${e.status})`).join("\n")}`
    : "\n\nThe team hasn't run any experiments yet — suggest foundational growth experiments."

  return `Generate ${count} new experiment ideas for a growth team.${experimentContext}

Return a JSON array with this exact structure (no markdown, no code fences, just the array):
[
  {
    "title": "Short experiment title",
    "rationale": "2-3 sentence explanation of why this could work and what hypothesis it tests",
    "channel": "Web" | "Email" | "Paid" | "Social" | "Push",
    "expectedLift": "+X-Y%",
    "effort": "Low" | "Medium" | "High"
  }
]`
}
