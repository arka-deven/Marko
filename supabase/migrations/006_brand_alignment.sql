-- ============================================================
-- Marko — Brand Alignment Migration
-- Adds: audience, theme, hook_type to ideas
--       podcast-pitch asset type to content_assets
-- ============================================================

-- 1. Brand-aligned columns on ideas
ALTER TABLE public.ideas
  ADD COLUMN IF NOT EXISTS audience   text NOT NULL DEFAULT 'b2c'
    CHECK (audience IN ('b2b', 'b2c')),
  ADD COLUMN IF NOT EXISTS theme      text,   -- e.g. 'Reciprocity', 'Social Proof'
  ADD COLUMN IF NOT EXISTS hook_type  text;   -- e.g. 'stat-shock', 'myth-bust'

-- 2. Extend content_assets to support podcast-pitch asset type
--    (drop + recreate the check constraint — Postgres requires this)
ALTER TABLE public.content_assets
  DROP CONSTRAINT IF EXISTS content_assets_asset_type_check;

ALTER TABLE public.content_assets
  ADD CONSTRAINT content_assets_asset_type_check
  CHECK (asset_type IN (
    'post', 'email', 'blog', 'video', 'thread',
    'reel', 'push', 'ad', 'podcast-pitch'
  ));

-- 3. Extend content_assets channel to include Podcast
ALTER TABLE public.content_assets
  DROP CONSTRAINT IF EXISTS content_assets_channel_check;

ALTER TABLE public.content_assets
  ADD CONSTRAINT content_assets_channel_check
  CHECK (channel IN (
    'LinkedIn', 'Email', 'Blog', 'Video', 'Twitter',
    'Instagram', 'Push', 'Ad', 'Podcast'
  ));
