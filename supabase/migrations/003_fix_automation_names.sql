-- Fix automation names to match actual Inngest function behavior
-- "Auto-pause Failing Tests" → "Auto-Kill Failing Experiments" (it kills, not pauses)
UPDATE public.automations
SET
  name = 'Auto-Kill Failing Experiments',
  description = 'Kill experiments running >30 days with lift under 3%'
WHERE name = 'Auto-pause Failing Tests';

-- Also update the seed in handle_new_user trigger so new signups get correct names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid := gen_random_uuid();
  workspace_slug text;
BEGIN
  workspace_slug := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  )) || '-' || substring(new_workspace_id::text, 1, 6);

  INSERT INTO public.workspaces (id, name, slug, owner_id, plan)
  VALUES (
    new_workspace_id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Workspace',
    workspace_slug,
    new.id,
    'free'
  );

  INSERT INTO public.profiles (id, workspace_id, full_name, role)
  VALUES (
    new.id,
    new_workspace_id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'owner'
  );

  INSERT INTO public.integrations (workspace_id, provider, category, status) VALUES
    (new_workspace_id, 'Google Analytics 4', 'Analytics',      'disconnected'),
    (new_workspace_id, 'Stripe',             'Payments',       'disconnected'),
    (new_workspace_id, 'Slack',              'Communication',  'disconnected'),
    (new_workspace_id, 'HubSpot',            'CRM',            'disconnected'),
    (new_workspace_id, 'Mixpanel',           'Analytics',      'disconnected'),
    (new_workspace_id, 'Mailchimp',          'Email',          'disconnected'),
    (new_workspace_id, 'Linear',             'Project Mgmt',   'disconnected'),
    (new_workspace_id, 'Notion',             'Knowledge Base', 'disconnected'),
    (new_workspace_id, 'Zapier',             'Automation',     'disconnected'),
    (new_workspace_id, 'Figma',              'Design',         'disconnected');

  INSERT INTO public.automations (workspace_id, name, description, trigger_type) VALUES
    (new_workspace_id, 'Weekly Idea Generation',        'Generate new AI experiment ideas every Monday',           'Schedule'),
    (new_workspace_id, 'Auto-Kill Failing Experiments', 'Kill experiments running >30 days with lift under 3%',    'Condition'),
    (new_workspace_id, 'Winner Notification',           'Notify via email when an experiment is marked winner',    'Event'),
    (new_workspace_id, 'Monthly Report Generation',     'Auto-generate monthly growth report on the 1st',          'Schedule'),
    (new_workspace_id, 'Weekly Digest',                 'Send weekly summary email every Monday morning',          'Schedule');

  RETURN new;
END;
$$;
