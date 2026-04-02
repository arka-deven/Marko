# Marko — Master Plan & Architecture

> Last updated: 2026-03-29
> Status: MVP built, integrations in progress

---

## 1. What Is Marko

Marko is an AI-powered growth engine for the **Cialdini Institute** — the world's authority on the science of ethical persuasion (founded by Dr. Robert Cialdini, author of *Influence*).

**The problem:** The Cialdini Institute has world-class IP but no systematic content marketing. No content calendar, inconsistent posting, 656 LinkedIn followers on the company page, no YouTube channel, no paid ads. Meanwhile, comparable brands (James Clear, Simon Sinek, Brene Brown) are growing millions-strong audiences with consistent content.

**What Marko does:** Automates the full content lifecycle — ideation, generation, publishing, and performance tracking — while embedding proven marketing frameworks into every piece of content.

---

## 2. Marketing Strategy

### 2.1 Cialdini's Current State (Research: March 2026)

| Platform | Status | Gap |
|---|---|---|
| influenceatwork.com | Active but static | No blog, no content engine |
| cialdini.com | Active — courses, CMCT | Separate from main brand |
| LinkedIn (personal) | Posts get 27-56 comments | Inconsistent, no schedule |
| LinkedIn (company) | 656 followers | Severely underused |
| YouTube | No channel | Massive gap — viral "Science of Persuasion" video exists elsewhere |
| Email newsletter | Two separate newsletters | No growth strategy |
| Podcast | Guest appearances only | No owned show |
| Paid Ads | None | Zero ad spend |
| Speaker Bureaus | 6-8 bureaus, $50K-$299K/talk | Passive, no control |

### 2.2 Competitor Benchmarks

| Brand | Core Channel | Key Metric | Conversion Model |
|---|---|---|---|
| James Clear | Newsletter | 3M+ subscribers | Newsletter → book → corporate speaking ($100K+/talk) |
| Simon Sinek | YouTube | 2.65M subs, 1,146 videos | TED talk (60M views) → YouTube → courses → training |
| Brene Brown | Podcast + Netflix | 15M followers | TED talk → books → Netflix → corporate training |
| Adam Grant | Podcast + LinkedIn | 80M+ podcast downloads | Academic cred → TED → podcast → consulting |
| BJ Fogg | Certification | Unknown | Stanford cred → book → free 5-day program → certification |

### 2.3 Channel Prioritization

**Tier 1 — Build immediately (highest ROI):**
1. **LinkedIn** — 80% of B2B social leads. Cialdini's audience (L&D directors, HR VPs, sales leaders) lives here. Target: 3-5 posts/week.
2. **Email Newsletter** — Only owned channel not dependent on algorithms. Via Beehiiv for growth tools.
3. **Blog/SEO** — Long-term compounding. "Cialdini principles" searched thousands of times/month.

**Tier 2 — Build next:**
4. **Video** — Short-form clips from keynotes. Higgsfield for avatar videos.
5. **Lead Magnets** — Gated resources for email capture (cheat sheets, assessments).
6. **Twitter/X** — Thread format for principle breakdowns.

**Tier 3 — Later:**
7. **LinkedIn Ads** — Targeting L&D directors, sales VPs.
8. **Podcast pitches** — Systematic guest appearances.

### 2.4 Marketing Frameworks Embedded in Content Engine

Every piece of content Marko generates uses these frameworks (embedded in AI prompts):

| Framework | Source | How It's Used |
|---|---|---|
| **5 Awareness Stages** | Eugene Schwartz | Ideas distributed across unaware→most_aware. Each stage has CTA rules and banned words |
| **StoryBrand SB7** | Donald Miller | Reader = hero, Cialdini = guide. Never reversed. |
| **Value Ladder** | Russell Brunson | Content maps to: free → lead magnet → book → workshop → keynote |
| **Lead Magnet Formula** | Alex Hormozi | "So good they feel stupid saying no" — templates, assessments, cheat sheets |
| **Specificity Doctrine** | David Ogilvy | Named studies, exact percentages, real experiments. No generic claims. |
| **Content Scoring** | Custom (7 criteria) | Pre-publish quality gate: specificity 25pts, storybrand 20pts, awareness match 15pts, hook 15pts, CTA 10pts, brand voice 10pts, engagement 5pts |

---

## 3. Technical Architecture

### 3.1 Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 (App Router) | Dashboard UI |
| Styling | Tailwind CSS + shadcn/ui | Consistent component library |
| Database | Supabase (PostgreSQL + RLS) | All data, workspace-scoped |
| Auth | Supabase Auth (magic link) | Login/signup |
| AI | Anthropic Claude API | Content generation |
| Observability | Langfuse | AI call tracing, cost tracking |
| Background Jobs | Inngest | Cron + event-driven functions |
| Video | Higgsfield API | Avatar video generation |
| Social Publishing | Buffer API | Auto-publish to LinkedIn/Twitter |
| Newsletter | Beehiiv (planned) | Email newsletter with growth tools |
| Hosting | Vercel | Deployment |

### 3.2 Model Routing (Cost Optimization)

| Task | Model | Why |
|---|---|---|
| Idea generation | Sonnet | Creative, strategic, 8 diverse ideas |
| Blog posts | Sonnet | Long-form, SEO-rich, needs quality |
| Video scripts | Sonnet | Creative storytelling |
| Lead magnets | Sonnet | Comprehensive resource generation |
| Case studies | Sonnet | Narrative 3-act structure |
| LinkedIn posts | Haiku | Short, structured, templated |
| Email content | Haiku | Structured A/B/C subjects |
| Twitter threads | Haiku | Short-form, formulaic |
| Push notifications | Haiku | Very short, structured |
| Ad copy variants | Haiku | Short, A/B/C testing |
| Content scoring | Haiku | Rubric-based, no creativity needed |

**Prompt caching** (`cache_control: ephemeral`) on system prompts saves ~90% on input tokens across all content generation.

**Estimated cost:** ~$2-5/month at weekly generation cadence.

### 3.3 Database Schema

| Table | Purpose | Key Fields |
|---|---|---|
| `workspaces` | Multi-tenant container | id, plan, name |
| `profiles` | User accounts | id, workspace_id, full_name, role |
| `ideas` | AI-generated content ideas | title, channel, theme, audience, awareness_stage, ladder_position, hook_type, status (queued/approved/rejected) |
| `content_assets` | Generated content per idea | channel, asset_type, title, body, metadata, status (generating/ready/published/failed), higgsfield_job_id |
| `content_performance` | Real metrics per content piece | impressions, clicks, likes, comments, shares, saves, email_captures, training_inquiries, engagement_quality_score, conversion_score |
| `lead_magnets` | Gated resources | format, title, landing_headline, downloads, conversion_rate |
| `logs` | Audit trail | action, actor (engine/admin), entity_type, description |
| `automations` | Pipeline automation controls | name, trigger, enabled, run_count, last_run_at |
| `experiments` | A/B test tracking | lift, confidence, status |
| `analytics_snapshots` | Daily rollup aggregation | date, metrics blob |

All tables are workspace-scoped with RLS policies using `public.get_user_workspace_id()`.

---

## 4. Complete Pipeline Flow

```
 WEEKLY CYCLE
 ═══════════════

 Monday 9am UTC (Inngest cron)
    │
    ▼
 Claude Sonnet generates 8 ideas
 ├─ Distributed across 5 awareness stages
 ├─ Mixed B2B/B2C audience
 ├─ Rotating Cialdini principle (8-week cycle)
 ├─ Deduped against recent titles
 └─ Stored as status='queued' in ideas table
    │
    ▼
 ┌─────────────────────────────────────────────┐
 │  INBOX (/dashboard/ideas)                    │
 │                                             │
 │  Human reviews each idea:                   │
 │  ├─ [Approve] → triggers content generation │
 │  └─ [Skip]    → marks as rejected           │
 │                                             │
 │  Also: "Generate with Brief" for manual     │
 │  generation with specific instructions      │
 └──────────────────┬──────────────────────────┘
                    │ (on approve)
                    ▼
 Inngest event: idea/approved
    │
    ▼
 Content generation (parallel, per channel):
 ├─ LinkedIn post (Haiku) ─── 210-char hook, 3 hashtags
 ├─ Email with A/B/C subjects (Haiku)
 ├─ Blog post with SEO (Sonnet)
 ├─ Twitter thread (Haiku)
 ├─ Video script (Sonnet) → Higgsfield avatar API
 ├─ Lead magnet (Sonnet) — if ladder_position = lead_magnet
 └─ Case study (Sonnet) — if B2B + authority/social_proof
    │
    ▼
 ┌─────────────────────────────────────────────┐
 │  CONTENT QUEUE (/dashboard/queue)            │
 │                                             │
 │  For each asset:                            │
 │  ├─ Preview content body                    │
 │  ├─ See metadata (hook, subjects, keywords) │
 │  ├─ [Publish to Buffer] — social channels   │
 │  └─ [Mark Published]    — manual publish    │
 └──────────────────┬──────────────────────────┘
                    │ (on publish)
                    ▼
 Distribution:
 ├─ Buffer API → LinkedIn, Twitter, Facebook
 ├─ Beehiiv API → Newsletter draft (planned)
 ├─ Manual copy/paste → Blog, podcast pitches
 └─ Higgsfield video URL → TikTok, Reels, Shorts
    │
    ▼
 ┌─────────────────────────────────────────────┐
 │  METRICS COLLECTION                          │
 │                                             │
 │  Automatic:                                 │
 │  ├─ Buffer sync (daily cron) → clicks,      │
 │  │   likes, comments, shares                │
 │  └─ Beehiiv sync (planned) → opens, clicks  │
 │                                             │
 │  Manual:                                    │
 │  └─ "Log Metrics" button on published cards │
 │     → impressions, saves, conversions       │
 └──────────────────┬──────────────────────────┘
                    │
                    ▼
 ┌─────────────────────────────────────────────┐
 │  ANALYTICS (/dashboard/analytics)            │
 │                                             │
 │  Summary: Published | Impressions |         │
 │           Engagement | Conversions          │
 │                                             │
 │  Per-piece performance table                │
 │  "Needs Metrics" nudge for untracked posts  │
 └─────────────────────────────────────────────┘


 OTHER SCHEDULED JOBS
 ═══════════════════════

 Daily 6am UTC → Buffer metrics sync
 Every 10min   → Higgsfield video poll
 Daily         → Auto-kill failing experiments (30 days, <3% lift)
 Monthly 1st   → AI narrative growth report
 Monday 9am    → Weekly email digest summary
```

---

## 5. Dashboard Pages

| Page | Route | Purpose |
|---|---|---|
| **Overview** | /dashboard | Quick actions (Inbox, Queue, Analytics), pipeline status, published content with metrics |
| **Inbox** | /dashboard/ideas | Approve/skip AI-generated ideas. Generate with brief. Bulk approve. |
| **Content Queue** | /dashboard/queue | Preview content, publish to Buffer or mark published, log metrics |
| **Analytics** | /dashboard/analytics | Real per-piece metrics, summary cards, "needs metrics" nudge |
| **Settings** | /dashboard/settings | Workspace config, automation toggles |
| **Profile** | /dashboard/profile | Account details |

---

## 6. Integration Status

| Integration | Status | What It Does |
|---|---|---|
| **Claude API** | Built | All AI content generation (Sonnet + Haiku routing) |
| **Langfuse** | Built | Traces every AI call with cost, latency, model info |
| **Supabase** | Built | Database, auth, RLS, admin client |
| **Inngest** | Built | All cron jobs + event-driven content generation |
| **Higgsfield** | Built | Avatar video from script → 9:16 vertical video |
| **Buffer** | Built | Auto-publish to LinkedIn/Twitter/Facebook. Daily metrics sync (clicks, likes, comments, shares) |
| **Beehiiv** | **Planned** | Newsletter drafts, subscriber management, open/click tracking, referral program |
| **LinkedIn API** | **Planned** | Native impressions/reach data (Buffer can't provide this) |
| **Google Search Console** | **Planned** | Blog SEO: impressions, clicks, keyword positions |
| **Resend** | Built | Transactional emails (weekly digest, notifications) |

---

## 7. What's Built vs What's Pending

### Built (ready to test)

- [x] AI idea generation (weekly cron + manual with brief)
- [x] 5 awareness stages + value ladder in every idea
- [x] StoryBrand + Ogilvy + Hormozi frameworks in prompts
- [x] Content generation pipeline (7 content types)
- [x] Prompt caching for cost optimization
- [x] Dual model routing (Sonnet/Haiku)
- [x] Inbox with approve/skip/bulk approve
- [x] Content queue with preview + publish
- [x] Buffer API publish for social channels
- [x] Buffer daily metrics sync cron
- [x] Manual metrics entry form (channel-aware)
- [x] Metrics API endpoint with auto-calculated scores
- [x] Analytics page with real per-piece metrics
- [x] Simplified dashboard (Overview, Inbox, Queue, Analytics)
- [x] Higgsfield video generation pipeline
- [x] Langfuse observability on all AI calls
- [x] Activity logging (audit trail)
- [x] Supabase RLS on all tables
- [x] UI refactored to shadcn/ui components

### Pending

- [ ] **Test end-to-end** — Credits loaded, generate → approve → content → publish → log metrics
- [ ] **Beehiiv integration** — Newsletter drafts, subscriber sync, metrics
- [ ] **Newsletter CTA injection** — Every LinkedIn/blog/lead magnet includes newsletter signup link
- [ ] **LinkedIn native API** — For impressions/reach data Buffer doesn't provide
- [ ] **Google Search Console** — Blog SEO performance tracking
- [ ] **Content feedback loop** — High-performing ideas weight future generation
- [ ] **Run DB migrations** — `supabase db push` for migrations 004-007
- [ ] **Buffer profiles setup** — Connect LinkedIn/Twitter profiles in Buffer dashboard

---

## 8. Roadmap

### Phase 1: Prove It Works (This Week)
- Load Anthropic credits (done)
- Run `supabase db push` for migrations 004-007
- Generate 8 ideas via the dashboard
- Approve 3-4 ideas
- Review generated content in queue
- Publish 1 LinkedIn post via Buffer
- Manually log metrics after 48 hours
- Verify analytics page shows real data

### Phase 2: Buffer Integration Complete
- Connect Buffer profiles (LinkedIn, Twitter)
- Test auto-publish flow end-to-end
- Verify daily metrics sync cron is pulling data
- Verify metrics appear in analytics without manual entry

### Phase 3: Newsletter (Beehiiv)
- Create Beehiiv account, get API key
- Build Beehiiv API client (create draft, pull metrics)
- Push email content → Beehiiv as draft newsletter
- Add newsletter CTA to all LinkedIn posts and blog content
- Daily cron to sync open/click rates into content_performance

### Phase 4: Analytics Enrichment
- LinkedIn API OAuth for native impressions/reach
- Google Search Console API for blog keyword data
- Merge all data sources into unified analytics view
- Add trend charts (week-over-week performance)

### Phase 5: Feedback Loop
- Track which ideas/themes/hooks perform best
- Weight future idea generation toward winning patterns
- Auto-suggest "more like this" for top performers
- A/B test: AI-guided vs random idea selection

---

## 9. Newsletter Growth Engine

All content channels funnel to the newsletter:

```
LinkedIn post → CTA: "I go deeper in my weekly newsletter → [link]"
Blog article  → Inline email capture: "Get the 7 Principles cheat sheet"
Lead magnet   → Gated: "Enter email to download"
Podcast guest → "Find me at cialdini.com/newsletter"
```

Growth loops within Beehiiv:
1. **Referral program** — "Share with 3 people → unlock bonus content"
2. **Boost network** — Other newsletters recommend yours ($1-3/subscriber)
3. **Forward-friendly format** — Content people naturally share with teams

Target: Weekly Cialdini insight applying one principle to a real business case.

---

## 10. Cost Model

| Component | Monthly Cost | Notes |
|---|---|---|
| Claude API (Sonnet + Haiku) | ~$2-5 | Prompt caching, Haiku for structured tasks |
| Supabase | Free tier | Sufficient for single workspace |
| Vercel | Free tier | Hobby plan sufficient |
| Inngest | Free tier | 25K events/month |
| Buffer | Free or $6/mo | Free: 3 channels, $6: per additional channel |
| Beehiiv | Free | Up to 2,500 subscribers |
| Higgsfield | Pay-per-video | ~$0.50-1/video |
| Langfuse | Free tier | Self-hosted or cloud free tier |
| **Total** | **~$5-15/month** | Scales to ~$50/mo at 10K newsletter subs |

---

## 11. Key Files Reference

| File | Purpose |
|---|---|
| `lib/ai/prompts.ts` | Idea generation prompt with all frameworks |
| `lib/ai/content-prompts.ts` | All content generation prompts (LinkedIn, Email, Blog, Video, etc.) |
| `lib/ai/cialdini-brand.ts` | Brand constants, principles, awareness rules, StoryBrand, scoring criteria |
| `lib/ai/config.ts` | Model routing table (which task → which model) |
| `lib/ai/traced-claude.ts` | Claude API wrapper with Langfuse tracing + prompt caching |
| `lib/inngest/functions/weekly-ideas.ts` | Monday cron: generate ideas for all workspaces |
| `lib/inngest/functions/on-idea-approved.ts` | Event handler: generate content assets on approve |
| `lib/inngest/functions/sync-buffer-metrics.ts` | Daily cron: pull metrics from Buffer |
| `app/api/content/[id]/metrics/route.ts` | POST endpoint: log manual metrics |
| `app/api/ideas/generate/route.ts` | Manual idea generation with brief |
| `components/dashboard/queue/metrics-entry-form.tsx` | Channel-aware metrics entry form |
| `components/dashboard/ideas/generate-dialog.tsx` | Manual generation UI with brief |
| `lib/ui-config.ts` | Centralized UI style config |
| `supabase/migrations/007_marketing_framework.sql` | content_performance + lead_magnets tables |
