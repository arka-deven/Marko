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
export type IdeaStatus = "queued" | "ready" | "launched" | "dismissed"

export interface Idea {
  id: string
  workspace_id: string
  title: string
  rationale: string | null
  channel: Channel
  expected_lift: string | null
  effort: Effort | null
  status: IdeaStatus
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
