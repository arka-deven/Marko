-- Logs: every admin action + engine event, with implication for context
CREATE TABLE public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,         -- 'idea.approved', 'idea.rejected', 'content.published', 'ideas.generated', 'content.generated', 'experiment.killed', 'experiment.winner'
  actor text NOT NULL DEFAULT 'admin' CHECK (actor IN ('admin', 'engine')),
  entity_type text,             -- 'idea', 'content_asset', 'experiment'
  entity_id uuid,
  entity_name text,
  description text NOT NULL,
  implication text,             -- what this triggers/means for the engine
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view logs"
  ON public.logs FOR SELECT
  USING (workspace_id = public.get_user_workspace_id());

CREATE INDEX IF NOT EXISTS idx_logs_workspace_created ON public.logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_action ON public.logs(workspace_id, action);
