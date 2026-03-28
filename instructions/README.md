# Marko — Agent Instructions

This folder defines how Claude agents should work on the Marko codebase to maximize execution quality while minimizing token usage.

## Agent Architecture

```
User Request
     │
     ▼
┌─────────────┐
│ MASTER AGENT │  — Plans, decomposes, assigns, validates
└──────┬──────┘
       │  dispatches parallel subtasks
  ┌────┴────┬────────┬────────┐
  ▼         ▼        ▼        ▼
Worker A  Worker B  Worker C  Worker D
(API)    (Pages)  (Comps)   (DB/Config)
```

- **One master agent** per task: plans, never executes file writes
- **Multiple worker agents** per task: execute in parallel, never plan
- Workers are scoped to non-overlapping file sets to avoid conflicts

## Files in This Folder

| File | Purpose |
|------|---------|
| `master-agent.md` | Instructions for the planning/orchestration agent |
| `worker-agents.md` | Instructions for execution agents |
| `codebase-patterns.md` | Marko architecture patterns — read this before writing any code |
| `efficiency-rules.md` | Credit efficiency rules — always follow these |
