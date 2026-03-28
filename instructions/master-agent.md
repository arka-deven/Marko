# Master Agent Instructions

The master agent plans and orchestrates. It never writes files directly.

---

## Role

You are the **planning and coordination agent** for Marko. Your job is to:

1. Read the task from the user
2. Read `instructions/codebase-patterns.md` (not source files)
3. Check `plan-docs/marko-mvp-sprint-plan.md` for current state
4. Decompose the task into **non-overlapping parallel subtasks**
5. Dispatch worker agents simultaneously
6. Validate results

---

## Step-by-Step Process

### Step 1 — Understand the Task

Read:
- `instructions/codebase-patterns.md` (always)
- `plan-docs/marko-mvp-sprint-plan.md` (for context)
- Only the specific source files mentioned in the task (if any)

Do NOT read files speculatively.

### Step 2 — Decompose

Break the task into subtasks that:
- Own **distinct, non-overlapping files**
- Can run **fully in parallel** (no subtask waits for another)
- Are scoped tightly — each worker gets exactly what it needs

Good decomposition example for "Add Stripe billing":
```
Worker A: app/api/stripe/checkout/route.ts + app/api/stripe/webhook/route.ts
Worker B: app/api/stripe/portal/route.ts + lib/stripe.ts + lib/plans.ts
Worker C: app/dashboard/profile/page.tsx (update plan UI)
Worker D: app/dashboard/settings/page.tsx (update plan UI)
```

Bad decomposition:
```
Worker A: "Handle all Stripe stuff"  ← too broad, sequential
```

### Step 3 — Write Worker Prompts

Each worker prompt must include:

```markdown
## Task
[1-3 sentence description of exactly what to build]

## Files to Read
- [file path] — [why: what pattern/context to get from it]

## Files to Write
- [file path] — [what it should contain]

## Pattern Reference
See instructions/codebase-patterns.md → [section name]

## Rules
- Follow the exact auth guard pattern
- No extras: no comments, no types beyond lib/types.ts
- Write all files in one parallel batch
```

### Step 4 — Dispatch Workers Simultaneously

Launch all workers in a **single message** using multiple Agent tool calls.
Never launch Worker B after waiting for Worker A unless B depends on A's output.

### Step 5 — Validate

After all workers complete:
- Run `npm run build` to catch TypeScript errors
- Spot-check that the key files match the expected patterns
- If a worker made an error, fix it directly (don't re-run the full worker)

---

## Decomposition Rules

| Rule | Why |
|------|-----|
| Max 4 workers per task | More creates coordination overhead |
| Each worker owns ≤ 6 files | Larger scope = more errors |
| Workers never share files | Causes merge conflicts |
| Pass exact file paths, not descriptions | Workers don't explore |
| Include the relevant pattern section | Workers don't read docs themselves |

---

## When NOT to Use Workers

For simple tasks (1-3 files, clear pattern), do it directly without spawning workers:
- Fix a bug in one file
- Add a field to an existing form
- Update a copy/text string
- Add one new API route that follows the exact existing pattern

Only use workers when:
- 4+ files need to change
- Work is genuinely parallelizable
- The task is a full feature (not a tweak)

---

## Example Master Plan: "Add Stripe billing"

**Workers to launch simultaneously:**

**Worker A — Stripe infrastructure**
- Read: `instructions/codebase-patterns.md`
- Write: `lib/stripe.ts`, `lib/plans.ts`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/portal/route.ts`

**Worker B — Stripe webhook**
- Read: `instructions/codebase-patterns.md`, `app/api/experiments/route.ts` (pattern)
- Write: `app/api/stripe/webhook/route.ts`

**Worker C — Profile/Settings UI**
- Read: `app/dashboard/profile/page.tsx`, `components/dashboard/profile/profile-form.tsx`
- Write: Updated `components/dashboard/profile/profile-form.tsx` (Upgrade button → Stripe checkout)

**Worker D — Plan enforcement**
- Read: `app/api/experiments/route.ts`, `app/api/ideas/generate/route.ts`
- Write: Updated versions of both with plan limit checks
