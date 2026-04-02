-- ============================================================
-- Marko — Content Pipeline Migration
-- Adds: content_assets table, approved/rejected idea statuses
-- ============================================================

-- 1. Update ideas status to include approved + rejected
ALTER TABLE public.ideas
  DROP CONSTRAINT IF EXISTS ideas_status_check;

ALTER TABLE public.ideas
  ADD CONSTRAINT ideas_status_check
  CHECK (status IN ('queued', 'ready', 'approved', 'rejected', 'launched', 'dismissed'));

-- 2. Content Assets — generated content waiting to be published
CREATE TABLE public.content_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('LinkedIn', 'Email', 'Blog', 'Video', 'Twitter', 'Instagram', 'Push', 'Ad')),
  asset_type text NOT NULL CHECK (asset_type IN ('post', 'email', 'blog', 'video', 'thread', 'reel', 'push', 'ad')),
  title text,
  body text,
  metadata jsonb NOT NULL DEFAULT '{}', -- subject lines, hashtags, CTAs, etc.
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'published', 'failed')),
  -- Higgsfield video fields
  higgsfield_job_id text,
  higgsfield_video_url text,
  -- Publishing tracking
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS for content_assets
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view content_assets"
  ON public.content_assets FOR SELECT
  USING (workspace_id = public.get_user_workspace_id());

CREATE POLICY "Workspace members can insert content_assets"
  ON public.content_assets FOR INSERT
  WITH CHECK (workspace_id = public.get_user_workspace_id());

CREATE POLICY "Workspace members can update content_assets"
  ON public.content_assets FOR UPDATE
  USING (workspace_id = public.get_user_workspace_id());

CREATE POLICY "Workspace members can delete content_assets"
  ON public.content_assets FOR DELETE
  USING (workspace_id = public.get_user_workspace_id());

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_content_assets_workspace ON public.content_assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_workspace_status ON public.content_assets(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_content_assets_idea ON public.content_assets(idea_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_higgsfield ON public.content_assets(higgsfield_job_id) WHERE higgsfield_job_id IS NOT NULL;

-- 5. updated_at trigger for content_assets
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.content_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. Update existing automations to reflect the real pipeline
-- (safe update — won't fail if names differ)
UPDATE public.automations
  SET name = 'Weekly Idea Generation',
      description = 'Every Monday: Claude generates 15 growth ideas for admin review'
  WHERE name IN ('Weekly Idea Generation', 'Auto-pause Failing Tests');

-- 7. Add new pipeline automations to handle_new_user for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid;
BEGIN
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'My') || '''s Workspace'
  )
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.profiles (id, workspace_id, full_name)
  VALUES (
    new.id,
    new_workspace_id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );

  -- Seed automations (the full pipeline)
  INSERT INTO public.automations (workspace_id, name, description, trigger_type) VALUES
    (new_workspace_id, 'Weekly Idea Generation',    'Every Monday 9am: Claude generates 15 growth ideas for admin review',  'Schedule'),
    (new_workspace_id, 'Content Generation',        'On idea approval: generates LinkedIn, email, blog, and video content', 'Event'),
    (new_workspace_id, 'Higgsfield Video Render',   'Submits approved video scripts to Higgsfield and polls for completion','Event'),
    (new_workspace_id, 'Auto-Kill Failing Experiments', 'Daily: kills experiments with <3% lift after 30 days',             'Schedule'),
    (new_workspace_id, 'Winner Notification',       'Emails admin when an experiment is marked as winner',                  'Event'),
    (new_workspace_id, 'Monthly Report Generation', 'First of month: auto-generates growth report via Claude',              'Schedule'),
    (new_workspace_id, 'Weekly Digest',             'Every Monday: emails summary of running experiments and queued ideas', 'Schedule');

  RETURN new;
END;
$$;
