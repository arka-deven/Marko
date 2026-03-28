# Credit Efficiency Rules

Follow these rules on every task. They are non-negotiable.

---

## 1. Read Minimally

- Read only files you will **directly modify** + their **immediate imports**
- Never use the Explore agent for tasks where file paths are already known
- Use `Grep` for finding a specific function/pattern — never read whole files to find one line
- Use `Glob` to confirm a file exists before reading it
- If a pattern is documented in `instructions/codebase-patterns.md`, do NOT re-read the source file

**Bad:** Read `app/api/experiments/route.ts` to understand API route patterns
**Good:** Read `instructions/codebase-patterns.md` → API Routes section

---

## 2. Write in Parallel Batches

- All independent file writes go in a **single message** with multiple `Write` tool calls
- Never write File A, wait, then write File B if they don't depend on each other
- Group writes by: new files first, then modified files

**Bad:** Write route → wait → write component → wait → write page
**Good:** Write route + component + page all in one message

---

## 3. Don't Re-explore Known Architecture

- The tech stack, DB schema, and patterns are documented in `instructions/codebase-patterns.md`
- The sprint progress is in `plan-docs/marko-mvp-sprint-plan.md`
- If a file was written in this repo, assume it follows the documented patterns unless the task says otherwise

---

## 4. Scope Each Worker Tightly

- Each worker agent receives: the exact files to read, the exact files to write, and the pattern to follow
- Workers never do open-ended exploration
- Workers never modify files outside their assigned scope

---

## 5. Follow Existing Patterns Exactly

- Copy the exact same auth guard pattern from existing API routes
- Copy the exact same server component data-fetch pattern from existing pages
- Reuse types from `lib/types.ts` — never define inline types that already exist
- Do not add comments, docs, or error handling beyond what existing files have

---

## 6. Server Components Over Client Where Possible

- Data fetching always happens in server components
- Client components only for: form state, toggles, optimistic UI, browser-only APIs
- Less client code = fewer hydration issues = simpler = fewer tokens to write

---

## 7. No Extras

- No README updates unless explicitly asked
- No test files unless explicitly asked
- No comments unless the logic is non-obvious
- No TypeScript generics or utility types not already in the codebase
- No extra abstraction layers — if it's used once, write it inline

---

## Token Budget by Task Type

| Task Type | Typical Files to Read | Typical Files to Write |
|-----------|----------------------|------------------------|
| New API route | 1 existing route (pattern) | 1 route file |
| New dashboard page | 1 existing page + patterns doc | 1 page + maybe 1 client component |
| DB schema change | migration file | new migration file |
| Bug fix | 1-2 files with the bug | 1-2 files |
| Full feature | patterns doc only | 3-6 files in parallel |
