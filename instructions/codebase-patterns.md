# Marko — Codebase Patterns Reference

Read this instead of exploring source files. Contains all recurring patterns.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Auth + DB:** Supabase (PostgreSQL + Row Level Security)
- **AI:** `@anthropic-ai/sdk` (Claude Sonnet)
- **Styling:** Tailwind CSS v4, `cn()` from `lib/utils.ts`
- **Icons:** `lucide-react`, `simple-icons`
- **Types:** All DB types live in `lib/types.ts`

---

## Directory Map

```
app/
  (auth)/           — login, signup, callback (no sidebar layout)
  api/              — all API routes (server-only, Supabase)
  dashboard/        — protected pages (sidebar layout)
    layout.tsx      — server component, fetches user, passes to sidebar/header
    page.tsx        — overview
    [feature]/page.tsx
components/
  dashboard/        — dashboard-specific components
    [feature]/      — client components for each feature
  sections/         — landing page sections
  ui/               — shared UI primitives
lib/
  supabase/
    client.ts       — browser client (createBrowserClient)
    server.ts       — server client (createServerClient, uses cookies)
    admin.ts        — service role client
  ai/
    claude.ts       — Anthropic client singleton
    prompts.ts      — prompt builders
  types.ts          — all shared TypeScript types
  utils.ts          — cn() helper
supabase/
  migrations/       — SQL migration files
instructions/       — this folder
plan-docs/          — sprint plan and reference docs
```

---

## Pattern: API Route (Standard)

File: `app/api/[resource]/route.ts`

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user.id)
    .single()
  if (!profile?.workspace_id) return NextResponse.json({ error: "No workspace" }, { status: 404 })

  const { data, error } = await supabase
    .from("table_name")
    .select("*")
    .eq("workspace_id", profile.workspace_id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
```

---

## Pattern: API Route with Dynamic Params (Next.js 15)

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params   // ← must await params in Next.js 15
  const supabase = await createClient()
  // ... rest of route
}
```

---

## Pattern: Dashboard Server Page

File: `app/dashboard/[page]/page.tsx`

```typescript
import { createClient } from "@/lib/supabase/server"
// No "use client" — this is a server component

export default async function PageName() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("id", user!.id)
    .single()

  const { data: rows = [] } = await supabase
    .from("table_name")
    .select("*")
    .eq("workspace_id", profile?.workspace_id)
    .order("created_at", { ascending: false })

  // compute stats from rows...

  return (
    <div className="space-y-6 w-full">
      {/* render with real data */}
    </div>
  )
}
```

**Rules:**
- No `"use client"` at top
- User is guaranteed logged-in (middleware handles redirect)
- Fetch data directly with server client — no API calls
- Pass data as props to client components for interactive parts

---

## Pattern: Client Component (Interactive)

File: `components/dashboard/[feature]/[name].tsx`

```typescript
"use client"

import { useState } from "react"
// imports...

interface Props {
  initialData: SomeType
}

export function ComponentName({ initialData }: Props) {
  const [state, setState] = useState(initialData)

  async function handleAction() {
    // call fetch() to API route
    const res = await fetch("/api/resource/id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: value }),
    })
    // optimistic UI update
    setState(...)
  }

  return <div>...</div>
}
```

---

## Pattern: Parallel Data Fetch (Server Component)

```typescript
const [
  { data: experiments = [] },
  { data: ideas = [] },
  { data: integrations = [] },
] = await Promise.all([
  supabase.from("experiments").select("*").eq("workspace_id", workspaceId),
  supabase.from("ideas").select("*").eq("workspace_id", workspaceId),
  supabase.from("integrations").select("*").eq("workspace_id", workspaceId),
])
```

---

## Pattern: Supabase Count Query

```typescript
const { count } = await supabase
  .from("experiments")
  .select("*", { count: "exact", head: true })
  .eq("workspace_id", profile?.workspace_id)
```

---

## Pattern: Auth Layout vs Dashboard Layout

- `app/(auth)/layout.tsx` — centered, no sidebar, no header
- `app/dashboard/layout.tsx` — server component, fetches user, renders sidebar + header

Pages under `app/dashboard/` are automatically protected by `middleware.ts`.

---

## Styling Conventions

```typescript
import { cn } from "@/lib/utils"

// Reusable pattern for icon badge (used across all dashboard pages)
function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-foreground/70" />
    </div>
  )
}

// Card container
<div className="rounded-2xl bg-card/80 border border-border p-6">

// Stats card
<div className="rounded-2xl bg-card/80 border border-border px-6 py-5">
  <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
  <p className="text-4xl font-black mt-2 tracking-tighter">{value}</p>
</div>

// Save button
<button className="px-4 py-2 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-all text-sm font-medium text-foreground/70">
  Save Changes
</button>
```

---

## Database Tables Reference

| Table | Key Fields | RLS |
|-------|-----------|-----|
| `workspaces` | id, name, slug, owner_id, plan, website | owner_id = auth.uid() |
| `profiles` | id, workspace_id, full_name, notification_* | id = auth.uid() |
| `experiments` | id, workspace_id, name, channel, status, lift, confidence, revenue_attributed | workspace scoped |
| `ideas` | id, workspace_id, title, channel, status, effort, expected_lift | workspace scoped |
| `automations` | id, workspace_id, name, trigger_type, status, run_count | workspace scoped |
| `reports` | id, workspace_id, name, report_type, content, shared | workspace scoped |
| `integrations` | id, workspace_id, provider, category, status | workspace scoped |
| `analytics_snapshots` | id, workspace_id, date, channel_data (jsonb) | workspace scoped |

**Channel values:** `"Web" | "Email" | "Paid" | "Social" | "Push"`
**Experiment status:** `"draft" | "running" | "winner" | "failed" | "paused"`
**Idea status:** `"queued" | "ready" | "launched" | "dismissed"`
**Plan values:** `"free" | "growth" | "scale"`

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL         — Supabase project API URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    — Public anon key
SUPABASE_SERVICE_ROLE_KEY        — Server-only service role key
ANTHROPIC_API_KEY                — Claude API key (optional until Phase 5)
NEXT_PUBLIC_SITE_URL             — App URL (localhost in dev)
STRIPE_SECRET_KEY                — (Phase 5, not yet set)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — (Phase 5, not yet set)
STRIPE_WEBHOOK_SECRET            — (Phase 5, not yet set)
```

---

## What's Already Built

Phase 1–4 + 6 are complete. See `plan-docs/marko-mvp-sprint-plan.md` for full status.

**Remaining:** Phase 5 (Stripe billing)
