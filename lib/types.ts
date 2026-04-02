// ============================================================
// Shared types matching the Supabase database schema
// ============================================================

export type Channel = "Web" | "Email" | "Paid" | "Social" | "Push"
export type Effort = "Low" | "Medium" | "High"

// -- Workspaces --
export interface Workspace {
  id: string
  name: string
  slug: string | null
  website: string | null
  owner_id: string
  plan: "free" | "growth" | "scale"
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_period_end: string | null
  created_at: string
  updated_at: string
}

// -- Profiles --
export interface Profile {
  id: string
  workspace_id: string
  full_name: string | null
  avatar_url: string | null
  role: "owner" | "admin" | "member"
  notification_experiment_results: boolean
  notification_weekly_digest: boolean
  notification_ai_ideas: boolean
  notification_integration_errors: boolean
  created_at: string
  updated_at: string
}

// -- Ideas --
export type IdeaStatus = "queued" | "ready" | "approved" | "rejected" | "launched" | "dismissed"

export type ContentChannel = "LinkedIn" | "Email" | "Blog" | "Video" | "Twitter" | "Instagram" | "Push" | "Ad" | "Podcast"
export type ContentAssetType = "post" | "email" | "blog" | "video" | "thread" | "reel" | "push" | "ad" | "podcast-pitch" | "lead-magnet" | "case-study"
export type ContentAssetStatus = "generating" | "ready" | "published" | "failed"

export type IdeaAudience = "b2b" | "b2c"
export type IdeaHookType = "stat-shock" | "before-after" | "myth-bust" | "application" | "dark-side"
export type AwarenessStage = "unaware" | "problem_aware" | "solution_aware" | "product_aware" | "most_aware"
export type LadderPosition = "top_of_funnel" | "lead_magnet" | "low_ticket" | "mid_ticket" | "high_ticket"

export interface Idea {
  id: string
  workspace_id: string
  title: string
  rationale: string | null
  channel: Channel
  expected_lift: string | null
  effort: Effort | null
  status: IdeaStatus
  // Brand alignment fields
  audience: IdeaAudience
  theme: string | null      // e.g. 'Reciprocity', 'Social Proof'
  hook_type: IdeaHookType | null
  // Marketing funnel fields (Schwartz awareness + Brunson value ladder)
  awareness_stage: AwarenessStage
  ladder_position: LadderPosition
  ai_model: string | null
  ai_prompt_tokens: number | null
  ai_completion_tokens: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// -- Experiments --
export type ExperimentStatus = "draft" | "running" | "winner" | "failed" | "paused"

export interface Experiment {
  id: string
  workspace_id: string
  name: string
  description: string | null
  channel: Channel
  status: ExperimentStatus
  lift: number | null
  confidence: number | null
  revenue_attributed: number | null
  started_at: string | null
  ended_at: string | null
  idea_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// -- Content Assets --
export interface ContentAsset {
  id: string
  workspace_id: string
  idea_id: string | null
  channel: ContentChannel
  asset_type: ContentAssetType
  title: string | null
  body: string | null
  metadata: Record<string, unknown>
  status: ContentAssetStatus
  higgsfield_job_id: string | null
  higgsfield_video_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined from ideas table (may be null if idea_id is null or join fails)
  idea?: {
    audience: IdeaAudience
    theme: string | null
    hook_type: IdeaHookType | null
    awareness_stage: AwarenessStage
    ladder_position: LadderPosition
  } | null
}

// -- Logs --
export interface Log {
  id: string
  workspace_id: string
  user_id: string | null
  action: string
  actor: "admin" | "engine"
  entity_type: string | null
  entity_id: string | null
  entity_name: string | null
  description: string
  implication: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// -- Automations --
export type AutomationTriggerType = "Schedule" | "Event" | "Condition"

export interface Automation {
  id: string
  workspace_id: string
  name: string
  description: string | null
  trigger_type: AutomationTriggerType
  status: "active" | "paused"
  run_count: number
  last_run_at: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

// -- Reports --
export type ReportType = "Monthly" | "Quarterly" | "Experiment" | "Channel"

export interface Report {
  id: string
  workspace_id: string
  name: string
  description: string | null
  report_type: ReportType
  content: Record<string, unknown>
  page_count: number
  shared: boolean
  created_at: string
}

// -- Integrations --
export interface Integration {
  id: string
  workspace_id: string
  provider: string
  category: string
  status: "connected" | "disconnected" | "error"
  config: Record<string, unknown>
  events_summary: string | null
  connected_at: string | null
  created_at: string
}

// -- Content Performance (marketing analytics) --
export interface ContentPerformance {
  id: string
  workspace_id: string
  content_asset_id: string
  idea_id: string | null
  // Engagement metrics
  impressions: number
  clicks: number
  likes: number
  comments: number
  shares: number
  saves: number
  replies: number
  time_on_page_seconds: number
  // Conversion metrics
  email_captures: number
  book_clicks: number
  training_inquiries: number
  cmct_inquiries: number
  // Computed scores
  engagement_quality_score: number  // saves*3 + comments*2 + shares*2 + likes
  conversion_score: number          // (inquiries + captures + book_clicks) / impressions * 100
  // AI quality gate
  ai_quality_score: number          // 0–100
  ai_quality_grade: "A" | "B" | "C" | "D" | "F"
  // Attribution
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  // Funnel context (denormalized for fast queries)
  awareness_stage: AwarenessStage | null
  ladder_position: LadderPosition | null
  audience: IdeaAudience | null
  theme: string | null
  hook_type: IdeaHookType | null
  channel: string | null
  asset_type: ContentAssetType | null
  // Timestamps
  published_at: string | null
  measured_at: string
  created_at: string
  updated_at: string
}

// -- Lead Magnets --
export type LeadMagnetFormat = "cheat-sheet" | "template" | "assessment" | "case-study-pdf" | "mini-course"

export interface LeadMagnet {
  id: string
  workspace_id: string
  idea_id: string | null
  content_asset_id: string | null
  format: LeadMagnetFormat
  title: string
  landing_headline: string | null
  landing_subheadline: string | null
  landing_bullets: string[]
  content_body: string | null
  thank_you_cta: string | null
  nurture_hook: string | null
  page_views: number
  downloads: number
  conversion_rate: number
  principle: string | null
  audience: IdeaAudience | null
  status: "draft" | "active" | "paused" | "archived"
  published_at: string | null
  created_at: string
  updated_at: string
}

// -- Analytics Snapshots --
export interface AnalyticsSnapshot {
  id: string
  workspace_id: string
  date: string
  total_experiments: number
  avg_lift: number
  win_rate: number
  revenue_attributed: number
  channel_data: Record<string, unknown>[]
  created_at: string
}
