-- ============================================================
-- RESET SCRIPT — clears all app data, keeps auth.users (login)
-- Then re-seeds workspace + profile + integrations + automations
-- for every existing auth user so the dashboard works immediately.
--
-- Run this in Supabase SQL Editor → New query → Run
-- ============================================================

-- Step 1: Wipe all public app tables (cascade handles FK order)
TRUNCATE
  public.analytics_snapshots,
  public.integrations,
  public.reports,
  public.automations,
  public.ideas,
  public.experiments,
  public.profiles,
  public.workspaces
CASCADE;

-- Step 2: Re-create workspace + profile + integrations + automations
-- for every existing auth user (mirrors the handle_new_user trigger)
DO $$
DECLARE
  u          record;
  new_ws_id  uuid;
  ws_slug    text;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP

    new_ws_id := gen_random_uuid();
    ws_slug   := lower(regexp_replace(
      coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
      '[^a-z0-9]+', '-', 'g'
    )) || '-' || substring(new_ws_id::text, 1, 6);

    -- Workspace
    INSERT INTO public.workspaces (id, name, slug, owner_id, plan)
    VALUES (
      new_ws_id,
      coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) || '''s Workspace',
      ws_slug,
      u.id,
      'free'
    );

    -- Profile
    INSERT INTO public.profiles (id, workspace_id, full_name, role)
    VALUES (
      u.id,
      new_ws_id,
      coalesce(u.raw_user_meta_data->>'full_name', ''),
      'owner'
    );

    -- Integrations
    INSERT INTO public.integrations (workspace_id, provider, category, status) VALUES
      (new_ws_id, 'Google Analytics 4', 'Analytics',      'disconnected'),
      (new_ws_id, 'Stripe',             'Payments',       'disconnected'),
      (new_ws_id, 'Slack',              'Communication',  'disconnected'),
      (new_ws_id, 'HubSpot',            'CRM',            'disconnected'),
      (new_ws_id, 'Mixpanel',           'Analytics',      'disconnected'),
      (new_ws_id, 'Mailchimp',          'Email',          'disconnected'),
      (new_ws_id, 'Linear',             'Project Mgmt',   'disconnected'),
      (new_ws_id, 'Notion',             'Knowledge Base', 'disconnected'),
      (new_ws_id, 'Zapier',             'Automation',     'disconnected'),
      (new_ws_id, 'Figma',              'Design',         'disconnected');

    -- Automations (correct names matching Inngest functions)
    INSERT INTO public.automations (workspace_id, name, description, trigger_type, status) VALUES
      (new_ws_id, 'Weekly Idea Generation',        'Generate new AI experiment ideas every Monday',          'Schedule',  'active'),
      (new_ws_id, 'Auto-Kill Failing Experiments', 'Kill experiments running >30 days with lift under 3%',   'Condition', 'active'),
      (new_ws_id, 'Winner Notification',           'Notify via email when an experiment is marked winner',   'Event',     'active'),
      (new_ws_id, 'Monthly Report Generation',     'Auto-generate monthly growth report on the 1st',         'Schedule',  'active'),
      (new_ws_id, 'Weekly Digest',                 'Send weekly summary email every Monday morning',         'Schedule',  'active');

  END LOOP;
END $$;

-- Verify
SELECT 'auth.users' as tbl, count(*) FROM auth.users
UNION ALL SELECT 'workspaces',  count(*) FROM public.workspaces
UNION ALL SELECT 'profiles',    count(*) FROM public.profiles
UNION ALL SELECT 'integrations',count(*) FROM public.integrations
UNION ALL SELECT 'automations', count(*) FROM public.automations
UNION ALL SELECT 'experiments', count(*) FROM public.experiments
UNION ALL SELECT 'ideas',       count(*) FROM public.ideas;
