-- ============================================================
-- Marko — Initial Database Schema
-- ============================================================

-- 1. Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Workspace',
  slug text unique,
  website text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'growth', 'scale')),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  notification_experiment_results boolean not null default true,
  notification_weekly_digest boolean not null default true,
  notification_ai_ideas boolean not null default false,
  notification_integration_errors boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Ideas (AI-generated experiment ideas)
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  rationale text,
  channel text not null check (channel in ('Web', 'Email', 'Paid', 'Social', 'Push')),
  expected_lift text,
  effort text check (effort in ('Low', 'Medium', 'High')),
  status text not null default 'queued' check (status in ('queued', 'ready', 'launched', 'dismissed')),
  ai_model text,
  ai_prompt_tokens integer,
  ai_completion_tokens integer,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Experiments
create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  channel text not null check (channel in ('Web', 'Email', 'Paid', 'Social', 'Push')),
  status text not null default 'draft' check (status in ('draft', 'running', 'winner', 'failed', 'paused')),
  lift numeric,
  confidence numeric,
  revenue_attributed numeric default 0,
  started_at timestamptz,
  ended_at timestamptz,
  idea_id uuid references public.ideas(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Automations
create table public.automations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null check (trigger_type in ('Schedule', 'Event', 'Condition')),
  status text not null default 'active' check (status in ('active', 'paused')),
  run_count integer not null default 0,
  last_run_at timestamptz,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  report_type text not null check (report_type in ('Monthly', 'Quarterly', 'Experiment', 'Channel')),
  content jsonb not null default '{}',
  page_count integer not null default 0,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);

-- 7. Integrations
create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null,
  category text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  config jsonb not null default '{}',
  events_summary text,
  connected_at timestamptz,
  created_at timestamptz not null default now()
);

-- 8. Analytics Snapshots (daily aggregates)
create table public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  date date not null,
  total_experiments integer not null default 0,
  avg_lift numeric not null default 0,
  win_rate numeric not null default 0,
  revenue_attributed numeric not null default 0,
  channel_data jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique(workspace_id, date)
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.experiments enable row level security;
alter table public.automations enable row level security;
alter table public.reports enable row level security;
alter table public.integrations enable row level security;
alter table public.analytics_snapshots enable row level security;

-- Helper: get the current user's workspace_id
create or replace function public.get_user_workspace_id()
returns uuid
language sql
stable
security definer
as $$
  select workspace_id from public.profiles where id = auth.uid()
$$;

-- Workspaces: owners can read/update their workspace
create policy "Users can view own workspace"
  on public.workspaces for select
  using (owner_id = auth.uid());

create policy "Users can update own workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

-- Profiles: users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- Generic workspace-scoped policies for all data tables
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'ideas', 'experiments', 'automations', 'reports', 'integrations', 'analytics_snapshots'
  ])
  loop
    execute format(
      'create policy "Workspace members can view %1$s"
        on public.%1$s for select
        using (workspace_id = public.get_user_workspace_id())',
      tbl
    );
    execute format(
      'create policy "Workspace members can insert %1$s"
        on public.%1$s for insert
        with check (workspace_id = public.get_user_workspace_id())',
      tbl
    );
    execute format(
      'create policy "Workspace members can update %1$s"
        on public.%1$s for update
        using (workspace_id = public.get_user_workspace_id())',
      tbl
    );
    execute format(
      'create policy "Workspace members can delete %1$s"
        on public.%1$s for delete
        using (workspace_id = public.get_user_workspace_id())',
      tbl
    );
  end loop;
end
$$;


-- ============================================================
-- Auto-setup trigger: create workspace + profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  -- Create workspace
  insert into public.workspaces (owner_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'My') || '''s Workspace'
  )
  returning id into new_workspace_id;

  -- Create profile
  insert into public.profiles (id, workspace_id, full_name)
  values (
    new.id,
    new_workspace_id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );

  -- Seed default integrations
  insert into public.integrations (workspace_id, provider, category) values
    (new_workspace_id, 'Google Analytics 4', 'Analytics'),
    (new_workspace_id, 'Stripe',             'Payments'),
    (new_workspace_id, 'Slack',              'Communication'),
    (new_workspace_id, 'HubSpot',            'CRM'),
    (new_workspace_id, 'Mixpanel',           'Analytics'),
    (new_workspace_id, 'Mailchimp',          'Email');

  -- Seed default automations
  insert into public.automations (workspace_id, name, description, trigger_type) values
    (new_workspace_id, 'Weekly Idea Generation',     'Generate new AI experiment ideas every Monday',          'Schedule'),
    (new_workspace_id, 'Auto-pause Failing Tests',   'Pause experiments that drop below 80% confidence',       'Condition'),
    (new_workspace_id, 'Winner Notification',        'Notify Slack when an experiment is marked as winner',    'Event'),
    (new_workspace_id, 'Monthly Report Generation',  'Auto-generate monthly growth report on the 1st',         'Schedule'),
    (new_workspace_id, 'Integration Error Alert',    'Alert when any integration loses connection',             'Event');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- Updated_at trigger
-- ============================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  for tbl in select unnest(array[
    'workspaces', 'profiles', 'ideas', 'experiments', 'automations'
  ])
  loop
    execute format(
      'create trigger set_updated_at
        before update on public.%s
        for each row execute function public.update_updated_at()',
      tbl
    );
  end loop;
end
$$;
