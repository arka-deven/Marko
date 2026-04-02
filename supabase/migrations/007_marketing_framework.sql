-- Migration 007: Marketing Framework
-- Adds Schwartz awareness stages, Brunson value ladder, lead magnet support,
-- and content performance analytics tables.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. IDEAS TABLE — add funnel positioning columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS awareness_stage text NOT NULL DEFAULT 'solution_aware'
    CHECK (awareness_stage IN ('unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'));

ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS ladder_position text NOT NULL DEFAULT 'top_of_funnel'
    CHECK (ladder_position IN ('top_of_funnel', 'lead_magnet', 'low_ticket', 'mid_ticket', 'high_ticket'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CONTENT ASSETS — add lead-magnet and case-study to allowed types
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop and recreate constraints to add new asset types
ALTER TABLE public.content_assets DROP CONSTRAINT IF EXISTS content_assets_asset_type_check;
ALTER TABLE public.content_assets
  ADD CONSTRAINT content_assets_asset_type_check
  CHECK (asset_type IN ('post', 'email', 'blog', 'video', 'thread', 'reel', 'push', 'ad', 'podcast-pitch', 'lead-magnet', 'case-study'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. CONTENT PERFORMANCE — marketing analytics table
-- Tracks engagement metrics, conversion attribution, and quality scores
-- for every published content asset.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_performance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_asset_id uuid NOT NULL REFERENCES public.content_assets(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL,

  -- Engagement metrics (raw)
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,               -- LinkedIn saves / bookmarks — highest intent signal
  replies integer DEFAULT 0,             -- Email replies — strongest deliverability signal
  time_on_page_seconds integer DEFAULT 0, -- Blog dwell time

  -- Conversion metrics
  email_captures integer DEFAULT 0,       -- Lead magnet downloads
  book_clicks integer DEFAULT 0,          -- Clicks to cialdini.com/influence
  training_inquiries integer DEFAULT 0,   -- Clicks to cialdini.com/training
  cmct_inquiries integer DEFAULT 0,       -- Clicks to cialdini.com/cmct

  -- Computed scores (updated by analytics job)
  engagement_quality_score numeric(5,2) DEFAULT 0,  -- Weighted: saves*3 + comments*2 + shares*2 + likes*1
  conversion_score numeric(5,2) DEFAULT 0,          -- (inquiries + captures + book_clicks) / impressions * 100

  -- Content quality score (from AI pre-publish gate)
  ai_quality_score integer DEFAULT 0,      -- 0–100 from buildContentScorePrompt
  ai_quality_grade text DEFAULT 'C',       -- A/B/C/D/F

  -- Attribution tracking
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,

  -- Funnel context (denormalized from idea for fast querying)
  awareness_stage text,
  ladder_position text,
  audience text,
  theme text,
  hook_type text,
  channel text,
  asset_type text,

  -- Timestamps
  published_at timestamptz,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_content_perf_workspace ON public.content_performance(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_perf_awareness ON public.content_performance(awareness_stage);
CREATE INDEX IF NOT EXISTS idx_content_perf_audience ON public.content_performance(audience);
CREATE INDEX IF NOT EXISTS idx_content_perf_theme ON public.content_performance(theme);
CREATE INDEX IF NOT EXISTS idx_content_perf_hook ON public.content_performance(hook_type);
CREATE INDEX IF NOT EXISTS idx_content_perf_channel ON public.content_performance(channel);
CREATE INDEX IF NOT EXISTS idx_content_perf_asset ON public.content_performance(content_asset_id);
CREATE INDEX IF NOT EXISTS idx_content_perf_published ON public.content_performance(published_at);

-- Enable RLS
ALTER TABLE public.content_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace performance"
  ON public.content_performance FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Engine can insert performance data"
  ON public.content_performance FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Engine can update performance data"
  ON public.content_performance FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. LEAD MAGNETS — dedicated table for gated resources
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL,
  content_asset_id uuid REFERENCES public.content_assets(id) ON DELETE SET NULL,

  -- Content
  format text NOT NULL CHECK (format IN ('cheat-sheet', 'template', 'assessment', 'case-study-pdf', 'mini-course')),
  title text NOT NULL,
  landing_headline text,
  landing_subheadline text,
  landing_bullets jsonb DEFAULT '[]',     -- array of 3 bullet strings
  content_body text,                      -- the full lead magnet text
  thank_you_cta text,
  nurture_hook text,

  -- Performance
  page_views integer DEFAULT 0,
  downloads integer DEFAULT 0,
  conversion_rate numeric(5,2) DEFAULT 0, -- downloads / page_views * 100

  -- Metadata
  principle text,
  audience text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace lead magnets"
  ON public.lead_magnets FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage own workspace lead magnets"
  ON public.lead_magnets FOR ALL
  USING (workspace_id IN (
    SELECT workspace_id FROM public.profiles WHERE id = auth.uid()
  ));
