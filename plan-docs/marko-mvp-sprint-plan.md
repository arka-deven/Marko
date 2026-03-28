# Marko MVP Sprint Plan

## Context
Marko is currently a polished frontend prototype — Next.js 16 with a full landing page and 8 dashboard pages, all using hardcoded mock data. Zero backend infrastructure exists. The goal is to turn this into a working product with the AI experiment engine as the core feature, using Supabase + Claude API, deployed on Vercel.

### Progress Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | Done | Foundation (Supabase + Auth) |
| Phase 2 | Done | AI Experiment Engine |
| Phase 3 | Done | Dashboard Data Layer |
| Phase 4 | Done | Analytics & Reporting (computed from real experiment data) |
| Phase 5 | Pending | Stripe Billing (needs Stripe keys) |
| Phase 6 | Done | Landing Page → Signup Flow |

---

## Phase 1: Foundation (Supabase + Auth)

**New dependencies:** `@supabase/supabase-js`, `@supabase/ssr`

### Files created:
- `/.env.local` — Supabase URL, anon key, service role key, site URL
- `/lib/supabase/client.ts` — browser client (`createBrowserClient()`)
- `/lib/supabase/server.ts` — server client with cookie access (`createServerClient()`)
- `/lib/supabase/admin.ts` — service-role client for API routes
- `/lib/supabase/middleware.ts` — session refresh helper
- `/middleware.ts` — auth guard: redirect unauthenticated users from `/dashboard/*` to `/login`
- `/app/(auth)/layout.tsx` — centered auth layout (no sidebar)
- `/app/(auth)/login/page.tsx` — email + password login
- `/app/(auth)/signup/page.tsx` — signup form (name + email + password)
- `/app/(auth)/callback/route.ts` — OAuth callback handler
- `/supabase/migrations/001_initial_schema.sql` — full database schema

### Database schema (8 tables, all with RLS):
- `workspaces` — id, name, slug, owner_id, plan, stripe fields
- `profiles` — extends auth.users with workspace_id, full_name, notification prefs
- `experiments` — name, channel, status, lift, confidence, idea_id
- `ideas` — title, rationale, channel, expected_lift, effort, status, AI token tracking
- `automations` — name, trigger_type, status, run_count, config (JSONB)
- `reports` — name, report_type, content (JSONB), page_count
- `integrations` — provider, category, status, config (JSONB)
- `analytics_snapshots` — daily aggregates per workspace

### Database trigger:
- On new user signup → auto-create workspace + profile + seed default integrations & automations

### Files modified:
- `/app/dashboard/layout.tsx` — now a server component that fetches user data and passes to sidebar/header
- `/components/dashboard/sidebar.tsx` — accepts `userInfo` prop, shows user avatar + logout button
- `/components/dashboard/header.tsx` — accepts `userInitial` prop, replaces hardcoded "M"

---

## Phase 2: AI Experiment Engine (Core Feature)

**New dependency:** `@anthropic-ai/sdk`
**Env var:** `ANTHROPIC_API_KEY`

### Files created:
- `/lib/types.ts` — shared TypeScript types matching DB schema
- `/lib/ai/claude.ts` — Anthropic client singleton
- `/lib/ai/prompts.ts` — system prompt + idea generation prompt template
- `/app/api/ideas/generate/route.ts` — POST: Claude generates 5-10 experiment ideas based on workspace context
- `/app/api/ideas/route.ts` — GET: list ideas
- `/app/api/ideas/[id]/route.ts` — PATCH: update status, DELETE: dismiss
- `/app/api/ideas/[id]/launch/route.ts` — POST: promote idea → new experiment
- `/app/api/experiments/route.ts` — GET: list, POST: create
- `/app/api/experiments/[id]/route.ts` — GET/PATCH/DELETE
- `/app/api/experiments/[id]/status/route.ts` — PATCH: validated status transitions
- `/components/dashboard/ideas/ideas-list.tsx` — interactive ideas list with Launch/Dismiss
- `/components/dashboard/ideas/generate-button.tsx` — "Generate More" button calling Claude
- `/components/dashboard/experiments/experiments-table.tsx` — experiments table with real data
- `/components/dashboard/experiments/new-experiment-dialog.tsx` — create experiment modal
- `/app/dashboard/experiments/[id]/page.tsx` — experiment detail with status controls + metrics input

### AI idea generation flow:
1. Authenticate user → fetch workspace experiments for context
2. Build Claude prompt with existing experiments to avoid duplicates
3. Call Claude Sonnet → parse JSON response → validate with Zod
4. Batch insert ideas into Supabase → return to UI

### Files modified:
- `/app/dashboard/ideas/page.tsx` — now server component fetching from Supabase
- `/app/dashboard/experiments/page.tsx` — now server component fetching from Supabase

---

## Phase 3: Dashboard Data Layer (Pending)

### Files to create:
- `/lib/data/experiments.ts` — `getExperiments()`, `getExperiment()`, `getExperimentCounts()`
- `/lib/data/ideas.ts` — `getIdeas()`, `getIdeaCounts()`
- `/lib/data/automations.ts` — `getAutomations()`, `toggleAutomation()`
- `/lib/data/reports.ts` — `getReports()`
- `/lib/data/integrations.ts` — `getIntegrations()`
- `/lib/data/analytics.ts` — `getAnalyticsMetrics()`, `getChannelBreakdown()`
- `/lib/data/profile.ts` — `getProfile()`, `updateProfile()`
- `/app/api/automations/route.ts` + `[id]/route.ts`
- `/app/api/reports/route.ts` + `[id]/route.ts`
- `/app/api/integrations/[id]/route.ts`
- `/app/api/profile/route.ts`
- `/supabase/seed.sql` — default automations + integration placeholders per workspace

### Pages to convert (remove `"use client"`, fetch from Supabase, extract client components):
- `/app/dashboard/page.tsx` — overview cards
- `/app/dashboard/automations/page.tsx` — automation toggles
- `/app/dashboard/analytics/page.tsx` — charts (recharts needs client)
- `/app/dashboard/integrations/page.tsx` — connect/disconnect
- `/app/dashboard/reports/page.tsx` — report list
- `/app/dashboard/profile/page.tsx` — profile form
- `/app/dashboard/settings/page.tsx` — settings form

---

## Phase 4: Analytics & Reporting (Pending)

### Files to create:
- `/app/api/experiments/[id]/metrics/route.ts` — update lift/confidence/revenue
- `/app/api/reports/generate/route.ts` — Claude generates report narrative from experiment data
- `/lib/ai/report-prompt.ts` — report generation prompt template

### Analytics aggregation (in `/lib/data/analytics.ts`):
- Total experiments, avg lift, win rate, revenue — computed from experiments table
- Channel breakdown — group by channel, calculate per-channel stats
- Lift over time — monthly aggregates from experiment dates

---

## Phase 5: Stripe Billing (Pending)

**New dependency:** `stripe`
**Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Files to create:
- `/lib/stripe.ts` — Stripe client + price IDs
- `/lib/plans.ts` — plan limits (free: 5 experiments/50 ideas, growth: unlimited, scale: unlimited)
- `/app/api/stripe/checkout/route.ts` — create checkout session
- `/app/api/stripe/webhook/route.ts` — handle subscription events
- `/app/api/stripe/portal/route.ts` — billing portal session

### Files to modify:
- `/app/dashboard/profile/page.tsx` — "Upgrade to Pro" → real checkout
- `/app/dashboard/settings/page.tsx` — "Upgrade" → real checkout
- API routes for experiments/ideas — enforce plan limits

---

## Phase 6: Landing Page to Signup Flow (Partial)

### Done:
- `/components/sections/hero-section.tsx` — CTA link `/dashboard` → `/signup`
- `/components/sections/cta-section.tsx` — same
- `/components/ui/navbar.tsx` — "Get Started" → `/signup`, added "Log in" → `/login`

### Pending:
- `/components/sections/pricing-section.tsx` — plan CTAs → `/signup?plan=starter|growth|scale`
- `/app/dashboard/onboarding/page.tsx` — first-time setup (workspace name, website URL)

---

## Dependency Graph

```
Phase 1 (Foundation) → Phase 2 (AI Engine) → Phase 3 (Data Layer) → Phase 4/5/6 (parallel)
     ✅                      ✅                   ⏳                    ⏳
```

## Verification Checklist
- [ ] **Phase 1:** Sign up → login → see empty dashboard → logout → redirected to /login
- [ ] **Phase 2:** Click "Generate Ideas" → see AI-generated ideas → click "Launch" → experiment appears in experiments table
- [ ] **Phase 3:** All dashboard pages show real data from Supabase, mutations work
- [ ] **Phase 4:** Enter metrics on experiment → analytics page updates → generate a report
- [ ] **Phase 5:** Click upgrade → Stripe checkout → plan changes → limits enforced
- [ ] **Phase 6:** Landing page CTAs → signup → onboarding → dashboard

## Environment Setup

```bash
# .env.local required variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Setup Steps:
1. Create Supabase project and add credentials to `.env.local`
2. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor
3. Add Anthropic API key to `.env.local`
4. Run `npm run dev`
