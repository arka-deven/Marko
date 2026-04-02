export const MODEL_SONNET = "claude-sonnet-4-6"
export const MODEL_HAIKU = "claude-haiku-4-5-20251001"

export const AI_MAX_TOKENS = 4096
export const AI_MAX_TOKENS_SHORT = 512

export const TASK_MODELS: Record<string, string> = {
  // Idea generation — Sonnet: needs brand judgment + creative range
  "idea-generation":        MODEL_SONNET,
  "weekly-idea-generation": MODEL_SONNET,
  // Reports
  "monthly-report":         MODEL_SONNET,
  // Content — long-form and brand-critical → Sonnet
  "content-blog":           MODEL_SONNET,
  "content-video-script":   MODEL_SONNET,
  "content-podcast-pitch":  MODEL_SONNET, // nuanced pitch writing needs quality
  "content-lead-magnet":    MODEL_SONNET, // lead magnets must be so good people'd pay for them
  "content-b2b-case-study": MODEL_SONNET, // case studies drive training inquiries — quality critical
  "content-score":          MODEL_HAIKU,  // scoring is structured eval — Haiku is fine
  // Content — structured short-form → Haiku (~4x cheaper)
  "content-linkedin":       MODEL_SONNET, // upgraded for brand voice quality
  "content-email":          MODEL_SONNET, // upgraded for brand voice quality
  "content-push":           MODEL_HAIKU,
  "content-ad":             MODEL_HAIKU,
  "content-twitter":        MODEL_SONNET, // upgraded for brand voice quality
  "content-newsletter":     MODEL_SONNET, // brand-critical long-form — must be Sonnet
}

export function getModel(task: string): string {
  return TASK_MODELS[task] ?? MODEL_SONNET
}

export function getMaxTokens(task: string): number {
  const model = getModel(task)
  return model === MODEL_HAIKU ? AI_MAX_TOKENS_SHORT : AI_MAX_TOKENS
}
