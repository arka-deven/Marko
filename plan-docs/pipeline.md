# Marko — Content Pipeline (Updated 2026-03-29)

> See `marko-master-plan.md` for full strategy, architecture, and roadmap.

## The Pipeline

```
Monday 9am UTC (or manual trigger)
    │
    ├─ Claude Sonnet generates 8 ideas
    │  ├─ Distributed across 5 awareness stages
    │  ├─ Mixed B2B/B2C, rotating Cialdini principle
    │  └─ Frameworks: Schwartz + StoryBrand + Brunson + Hormozi + Ogilvy
    │
    ▼
Admin reviews in /dashboard/ideas (Inbox)
    │
    ├─ [Approve] → Inngest fires 'idea/approved'
    └─ [Skip]    → status = rejected
    │
    ▼
Content generation (parallel, per channel):
    ├─ LinkedIn post (Haiku) — 210-char hook, comment prompt, 3 hashtags
    ├─ Email A/B/C subjects (Haiku) — preview line, P.S., reply hook
    ├─ Blog post (Sonnet) — SEO keywords, FAQ schema, EEAT signals
    ├─ Twitter thread (Haiku) — 5-tweet thread
    ├─ Video script (Sonnet) → Higgsfield avatar API (9:16)
    ├─ Lead magnet (Sonnet) — cheat-sheet/template/assessment/mini-course
    └─ Case study (Sonnet) — 3-act: Problem → Intervention → Result
    │
    ▼
Admin reviews in /dashboard/queue (Content Queue)
    │
    ├─ [Publish to Buffer] → LinkedIn/Twitter/Facebook
    ├─ [Mark Published]    → manual publish
    └─ [Log Metrics]       → channel-aware form
    │
    ▼
Metrics collection:
    ├─ Buffer daily sync → clicks, likes, comments, shares
    ├─ Manual entry → impressions, saves, conversions
    └─ Beehiiv sync (planned) → opens, clicks, growth
    │
    ▼
/dashboard/analytics — real per-piece performance
```

## Dashboard Pages (4 core + 2 utility)

| Page | Route | Purpose |
|---|---|---|
| Overview | /dashboard | Quick actions, pipeline status, published content |
| Inbox | /dashboard/ideas | Approve / skip ideas, generate with brief |
| Content Queue | /dashboard/queue | Preview, publish, log metrics |
| Analytics | /dashboard/analytics | Per-piece metrics, summary cards |
| Settings | /dashboard/settings | Workspace config |
| Profile | /dashboard/profile | Account details |

## Cost Optimization

| Model | Tasks | Input/Output per 1M |
|---|---|---|
| Sonnet | Ideas, blogs, video, lead magnets, case studies | $3 / $15 |
| Haiku | LinkedIn, email, push, ads, Twitter, scoring | $0.25 / $1.25 |

Prompt caching on system prompts saves ~90% on input tokens.
Estimated: ~$2-5/month at weekly cadence.

## Inngest Jobs

| Job | Schedule | Function |
|---|---|---|
| weekly-idea-generation | Mon 9am UTC | Generate ideas for all workspaces |
| on-idea-approved | Event-driven | Generate content assets per channel |
| sync-buffer-metrics | Daily 6am UTC | Pull metrics from Buffer API |
| check-higgsfield-jobs | Every 10min | Poll video render status |
| auto-kill-experiments | Daily | Kill failing experiments after 30 days |
| monthly-report | 1st of month | AI narrative growth report |
| weekly-digest | Mon 9am UTC | Email summary to admin |
