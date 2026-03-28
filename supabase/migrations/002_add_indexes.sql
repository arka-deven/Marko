-- Performance indexes for workspace-scoped queries
CREATE INDEX IF NOT EXISTS idx_experiments_workspace ON public.experiments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_experiments_workspace_status ON public.experiments(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_experiments_workspace_created ON public.experiments(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experiments_started_at ON public.experiments(started_at) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_ideas_workspace ON public.ideas(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ideas_workspace_status ON public.ideas(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_automations_workspace ON public.automations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_workspace ON public.reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON public.integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_profiles_workspace ON public.profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_workspace_date ON public.analytics_snapshots(workspace_id, date DESC);
