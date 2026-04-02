import { z } from "zod"

const ChannelEnum = z.enum(["Web", "Email", "Paid", "Social", "Push"])
const EffortEnum = z.enum(["Low", "Medium", "High"])
const ExperimentStatusEnum = z.enum(["draft", "running", "winner", "failed", "paused"])
const IdeaStatusEnum = z.enum(["queued", "ready", "approved", "rejected", "launched", "dismissed"])
const AutomationStatusEnum = z.enum(["active", "paused"])

export const ExperimentCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  channel: ChannelEnum,
  idea_id: z.string().uuid().optional(),
})

export const ExperimentPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  channel: ChannelEnum.optional(),
  status: ExperimentStatusEnum.optional(),
  lift: z.number().optional(),
  confidence: z.number().min(0).max(100).optional(),
  revenue_attributed: z.number().optional(),
}).refine(data => Object.keys(data).length > 0, { message: "No fields to update" })

export const ExperimentStatusSchema = z.object({
  status: ExperimentStatusEnum,
})

export const IdeaCreateSchema = z.object({
  title: z.string().min(1).max(200),
  rationale: z.string().max(500).optional(),
  channel: ChannelEnum,
  expected_lift: z.string().max(20).optional(),
  effort: EffortEnum.optional(),
})

export const IdeaPatchSchema = z.object({
  status: IdeaStatusEnum.optional(),
  title: z.string().min(1).max(200).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "No fields to update" })

export const AutomationPatchSchema = z.object({
  status: AutomationStatusEnum,
})

export const ProfilePatchSchema = z.object({
  profile: z.object({
    full_name: z.string().max(100).optional(),
    notification_experiment_results: z.boolean().optional(),
    notification_weekly_digest: z.boolean().optional(),
    notification_ai_ideas: z.boolean().optional(),
    notification_integration_errors: z.boolean().optional(),
  }).optional(),
  workspace: z.object({
    name: z.string().min(1).max(100).optional(),
    website: z.string().max(200).optional(),
    slug: z.string().max(50).optional(),
  }).optional(),
})
