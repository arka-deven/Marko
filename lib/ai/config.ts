// Model routing — cost optimized
// Sonnet: creative generation, complex reasoning (~3x cost of Haiku)
// Haiku: structured formatting, short copy, classification (~1x baseline)
export const MODEL_SONNET = "claude-sonnet-4-6"
export const MODEL_HAIKU = "claude-haiku-4-5-20251001"

export const AI_MAX_TOKENS = 2048
export const AI_MAX_TOKENS_SHORT = 1024 // Haiku tasks — raised from 512 to accommodate richer brand-aligned output

// Which tasks use which model
// All content generation now uses Sonnet for maximum brand alignment.
// Cost impact: ~$3-5/month more at weekly cadence. Worth it for quality.
export const TASK_MODELS: Record<string, string> = {
  "idea-generation":        MODEL_SONNET,
  "weekly-idea-generation": MODEL_SONNET,
  "monthly-report":         MODEL_SONNET,
  "content-linkedin":       MODEL_SONNET, // upgraded from Haiku for brand voice
  "content-email":          MODEL_SONNET, // upgraded from Haiku for brand voice
  "content-push":           MODEL_HAIKU,  // still Haiku — too short to justify Sonnet
  "content-ad":             MODEL_HAIKU,  // still Haiku — structured short copy
  "content-blog":           MODEL_SONNET,
  "content-video-script":   MODEL_SONNET,
  "content-twitter":        MODEL_SONNET, // upgraded from Haiku for brand voice
}

export function getModel(task: string): string {
  return TASK_MODELS[task] ?? MODEL_SONNET
}

export function getMaxTokens(task: string): number {
  const model = getModel(task)
  return model === MODEL_HAIKU ? AI_MAX_TOKENS_SHORT : AI_MAX_TOKENS
}
