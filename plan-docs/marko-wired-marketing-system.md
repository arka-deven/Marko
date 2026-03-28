# Marko — Wired Marketing System
**How Every Channel Connects, Automates, and Feeds Back Into Each Other**
Generated: March 2026

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MARKO PLATFORM                          │
│                                                             │
│  Ideas Engine ──→ Content Engine ──→ content_assets table   │
│        ↑                                      ↓             │
│  Experiment results              Publishing Queue           │
│        ↑                                      ↓             │
│  Analytics ←── Signups ←── Landing page  Distributor        │
└─────────────────────────────────────────────────────────────┘
                                                ↓
              ┌──────────────────────────────────────────┐
              │              DISTRIBUTION LAYER           │
              │                                          │
              │  Buffer API  ──→  LinkedIn, X, IG, YT   │
              │  Beehiiv API ──→  Newsletter             │
              │  Next.js     ──→  Blog (auto-publish)   │
              │  Zapier      ──→  TikTok queue (manual) │
              │  Higgsfield  ──→  AI video              │
              └──────────────────────────────────────────┘
                                                ↓
              ┌──────────────────────────────────────────┐
              │             ANALYTICS LOOP               │
              │                                          │
              │  GA4 ──→ which posts drove signups       │
              │  Buffer insights ──→ best-performing      │
              │  Beehiiv ──→ open rate, clicks, referrals│
              │  Supabase ──→ experiment results         │
              └──────────────────────────────────────────┘
```

---

## Tool Stack — What Each Does

| Tool | Role | Cost | Already Built? |
|------|------|------|----------------|
| **Marko Content Engine** | Generates all copy per experiment | Free (own product) | ✅ Phase 8 |
| **Higgsfield** | AI video from script | Pay-per-video | ✅ Phase 8 (webhook) |
| **Buffer** | Schedules LinkedIn, X, Instagram, YouTube Shorts | $6/mo (Essentials) | ❌ Build Phase 11 |
| **Beehiiv** | Newsletter with referral program + growth network | $0 (Launch plan, up to 2,500 subs) | ❌ Replace Resend for newsletter |
| **Zapier** | Gap-fill: Supabase triggers → Buffer, blog alerts | $0 (free tier, 100 tasks/mo) | ❌ Configure |
| **Resend** | Transactional only (onboarding, winner emails, reports) | ✅ Already built | ✅ Phase 7 |
| **Inngest** | Orchestrates the automation between all tools | Free tier | ✅ Phase 7 |
| **Langfuse** | Tracks which prompts produce best content | Free cloud tier | ✅ Phase 10 |
| **GA4** | Which channels drive signups | Free | Planned Phase 9 |

**Total monthly cost to run the full wired system: ~$6/month** (Buffer Essentials).

---

## What Gets Automated vs. What Stays Manual

| Task | Status | Tool |
|------|--------|------|
| Generate weekly content ideas | ✅ Automated | Marko + Inngest cron |
| Write LinkedIn post copy | ✅ Automated | Claude via Content Engine |
| Write X/Twitter thread | ✅ Automated | Claude via Content Engine |
| Write Instagram caption | ✅ Automated | Claude via Content Engine |
| Write email newsletter | ✅ Automated | Claude via Content Engine |
| Write blog post draft | ✅ Automated | Claude via Content Engine |
| Generate video script | ✅ Automated | Claude via Content Engine |
| Generate AI video (Higgsfield) | ✅ Automated | Higgsfield webhook |
| Schedule LinkedIn post | ✅ Automated | Buffer API |
| Schedule X thread | ✅ Automated | Buffer API |
| Schedule Instagram feed post | ✅ Automated | Buffer API |
| Schedule YouTube Shorts | ✅ Automated | Buffer API |
| Send newsletter draft to Beehiiv | ✅ Automated | Beehiiv API |
| Publish blog post | ✅ Automated | Next.js + Vercel redeploy |
| Auto-kill underperforming content experiments | ✅ Automated | Inngest auto-kill |
| **TikTok posting** | ❌ Manual | Native app only (20–50% algo penalty if scheduled) |
| **Instagram Reels (trending audio)** | ❌ Manual | Trending audio only available in-app |
| **YouTube Long-Form upload** | ❌ Manual | Record + edit + upload |
| **Replying to comments** | ❌ Manual | Human judgment required |
| **Approving content before publish** | Optional | Review queue in Marko dashboard |

**Rule of thumb:** Automate everything that doesn't require judgment or native platform access. Protect the 4 manual channels that the algorithm rewards for native behaviour.

---

## The 5-System Wiring

### System 1: Marko → Buffer (Social Distribution)

**What it does:** Content Engine outputs are automatically scheduled to LinkedIn, X, Instagram, and YouTube Shorts via Buffer's API.

**Flow:**
```
content_assets table (status="ready", asset_type="linkedin"|"twitter"|"instagram")
    ↓
Inngest function: content-distributor.ts
    ↓
Buffer API POST /v1/posts
    ↓
Buffer schedules at optimal time (Mon–Fri 8–10 AM)
```

**What to build (Phase 11):**
- `lib/buffer/client.ts` — Buffer API client, reads `BUFFER_ACCESS_TOKEN`
- `lib/inngest/functions/content-distributor.ts` — polls `content_assets` for status="ready", pushes each to Buffer with the right channel profile ID

**Buffer channel map (set up once in Buffer dashboard):**
- LinkedIn: Founder personal account (NOT company page — 6–8x more reach)
- X: @marko handle
- Instagram: @markoapp
- YouTube: Marko channel (Shorts only from Buffer)

---

### System 2: Marko → Beehiiv (Newsletter)

**What it does:** The Experiment Brief draft is automatically created in Beehiiv every Tuesday, ready to review and send.

**Why Beehiiv, not Resend:**
- **Referral program** — subscribers get rewarded for referring friends → organic list growth
- **Recommendation network** — 30,000+ publishers. Newsletters in the network grow 2.75x faster. Participating publishers are 32x more likely to be recommended back.
- **Built-in A/B testing** — test subject lines automatically, winner sent to remaining list
- **Subscriber analytics** — see which posts drove opens, clicks, conversions (Resend doesn't have this)

**Resend stays for:** onboarding emails, winner notifications, weekly digest, monthly report — all transactional.

**Flow:**
```
Content Engine generates newsletter content (asset_type="email")
    ↓
Inngest function pushes draft to Beehiiv API
    ↓
Draft appears in Beehiiv dashboard for review
    ↓ (manual approval: 2 minutes)
Send to list — Tuesday 9 AM
```

**Beehiiv referral program setup:**
- Reward: Tier 1 (3 referrals) → Early access to Marko beta
- Reward: Tier 2 (10 referrals) → 3 months free Growth plan
- Reward: Tier 3 (25 referrals) → Lifetime free account
- These rewards cost $0 in real money and drive exponential list growth

---

### System 3: Marko → Blog (Auto-Publish)

**What it does:** Blog post drafts generated by the Content Engine are pushed to Next.js MDX files and deployed to Vercel automatically.

**Flow:**
```
Content Engine generates blog post (asset_type="blog")
    ↓
Inngest function writes MDX file to /app/blog/[slug]/page.mdx
    ↓
Triggers Vercel deploy hook (POST to VERCEL_DEPLOY_HOOK_URL)
    ↓
Blog post is live within 60 seconds
    ↓
Zapier trigger: new page deployed → Buffer schedules LinkedIn + X promotion
```

**What to build:**
- `app/blog/` directory structure with MDX support
- `lib/blog/publish.ts` — writes MDX file, triggers Vercel redeploy
- `VERCEL_DEPLOY_HOOK_URL` env var
- Zapier Zap: Vercel deploy webhook → Buffer API post scheduled

---

### System 4: TikTok & Reels (The Manual Pipeline)

**Why this can't be fully automated:**
- TikTok: Native posts get 20–50% more FYP distribution than scheduled posts from third-party tools
- Instagram Reels: Trending audio is only accessible inside the app

**The semi-automated workflow:**
```
Content Engine generates: video script + caption + hashtags
    ↓
Higgsfield generates AI video from script (automated)
    ↓
Video + caption appear in Marko's content_assets
    ↓
Marko dashboard shows "Ready to post" queue with:
  - Video file download button
  - Caption (pre-written, copy with one click)
  - Hashtag set (pre-generated)
  - Optimal posting time reminder
    ↓
Founder opens TikTok app → uploads video → pastes caption → posts
Time investment: 3 minutes per video
```

**Key principle:** The hard creative work is automated. The manual step is just "upload and paste." Target: 3 TikToks per week, 3 minutes each = 9 minutes of manual work.

**What to build (Phase 11):**
- `app/dashboard/publishing/page.tsx` — "Ready to Post" queue showing all approved content, per channel, with one-click copy for captions and download for video files

---

### System 5: Analytics → Marko (The Feedback Loop)

**What it does:** Performance data from every channel flows back into Marko as a workspace. Marko runs experiments on its own marketing. The best-performing content types become the next week's anchor.

**Flow:**
```
GA4 (Phase 9): which blog posts / landing page variants drive signups
    ↓
Metrics ingestion Inngest function (Phase 9): updates experiment lift/confidence
    ↓
Marko dashboard: shows which content experiment is winning
    ↓
Weekly review (15 min): pick the winning format, double it next week
    ↓
Auto-kill: underperforming content experiments killed after 30 days
```

**Marko's own marketing experiments to run:**
1. LinkedIn text post vs. carousel vs. video — which drives most signups?
2. Email subject line A/B — which open rate wins?
3. CTA wording on landing page — "Start free" vs. "Run your first experiment"
4. Newsletter send time — Tuesday 9 AM vs. Thursday 8 AM
5. Blog post CTA placement — above fold vs. end of post

Each of these is a real experiment in Marko's own dashboard. The results are content ("We ran this experiment on our own marketing. Here's what we found.").

---

## The Publishing Dashboard (Phase 11 Build)

A new page: `app/dashboard/publishing/page.tsx`

This is Marko's internal marketing command centre. Shows:

```
┌─────────────────────────────────────────────────────┐
│  PUBLISHING QUEUE                                    │
│                                                     │
│  ● LinkedIn  — "You don't have an ideas problem"    │
│    Status: Scheduled — Tuesday 9 AM                 │
│    [Preview] [Edit] [Reschedule]                    │
│                                                     │
│  ● TikTok    — "The auto-kill rule"                 │
│    Status: Ready to post (manual)                   │
│    [Download video] [Copy caption] [Mark as posted] │
│                                                     │
│  ● Email     — The Experiment Brief #7              │
│    Status: Draft in Beehiiv                         │
│    [Review in Beehiiv →]                            │
│                                                     │
│  ● Blog      — "7 SaaS experiments for Q2"         │
│    Status: Live                [View post →]        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  LAST WEEK PERFORMANCE                              │
│                                                     │
│  LinkedIn: 847 impressions · 34 comments · +8 follows│
│  Email: 41.2% open rate · 9.1% CTR · 3 signups     │
│  Blog: 312 sessions · 2.1% conversion              │
│  TikTok: 4,200 views · 87 saves · 0 signups (yet)  │
└─────────────────────────────────────────────────────┘
```

---

## Phase 11: What to Build

Everything above requires these additions to Marko:

### New files:
- `lib/buffer/client.ts` — Buffer API client (POST /v1/posts)
- `lib/beehiiv/client.ts` — Beehiiv API client (create post draft)
- `lib/blog/publish.ts` — write MDX, trigger Vercel deploy hook
- `lib/inngest/functions/content-distributor.ts` — reads ready content_assets, routes to Buffer/Beehiiv/blog
- `app/dashboard/publishing/page.tsx` — publishing queue UI
- `app/api/publishing/[id]/route.ts` — mark manual content as posted, update status
- `supabase/migrations/005_publishing.sql` — add `scheduled_at`, `published_at`, `buffer_post_id`, `beehiiv_post_id` to `content_assets`

### New env vars:
```
BUFFER_ACCESS_TOKEN          — Buffer API (Settings → Developers)
BEEHIIV_API_KEY             — Beehiiv API (Settings → API)
BEEHIIV_PUBLICATION_ID      — Beehiiv publication ID
VERCEL_DEPLOY_HOOK_URL      — Vercel (Project Settings → Git → Deploy Hooks)
```

### Zapier Zaps to configure (no-code, 30 min setup):
1. **New Supabase row → Buffer post:** When `content_assets` status changes to "approved" → POST to Buffer API
2. **Vercel deploy complete → social alert:** When blog deploys → schedule LinkedIn + X post promoting it via Buffer
3. **Beehiiv new subscriber → Supabase:** New Beehiiv subscriber → upsert into Supabase profiles for analytics

---

## The Wired Weekly Rhythm (Once Built)

**Total human time required: ~4 hours/week**

| Day | Automated | Manual (you) |
|-----|-----------|-------------|
| **Monday** | Marko generates 5 content ideas for the week | Review ideas, pick anchor (5 min) |
| **Tuesday** | Content Engine writes LinkedIn, X, email, blog, captions | Post TikTok (3 min) · Send Beehiiv newsletter (2 min review + send) |
| **Wednesday** | Buffer schedules LinkedIn · Blog auto-publishes | Film Reel if doing exclusive IG content (15 min) |
| **Thursday** | Buffer posts X thread · Beehiiv sends newsletter | Reply to comments across all platforms (20 min) |
| **Friday** | Buffer posts Instagram carousel | Weekly performance review in Marko (15 min) |
| **Daily** | — | 10 min: engage with 5 target accounts (growth practitioners) |

**Weekly total: ~1 hour manual + 3 hours of comment engagement**

---

## The Compound Growth Model

Month 1: Set up tools, post consistently, 0 results
Month 2: Algorithm learns your content profile, reach starts growing
Month 3: LinkedIn thought leader status in growth community, email at 500+
Month 4: TikTok/Reels content starts compounding, SEO pages ranking
Month 6: Referral flywheel from Beehiiv, 1,000+ email subscribers
Month 9: Organic signups > paid, content pays for itself

**The key:** Every piece of content is an experiment. Marko measures which ones win. The winners get repeated. The losers get auto-killed. Over time, only the highest-signal content gets produced.

This is the thing Marko sells. It should also be exactly how Marko markets itself.

---

## Sources
- [Buffer API — Does Buffer have an API?](https://support.buffer.com/article/859-does-buffer-have-an-api)
- [Buffer: Schedule LinkedIn Posts](https://buffer.com/linkedin)
- [Using TikTok with Buffer](https://support.buffer.com/article/559-using-tiktok-with-buffer)
- [Beehiiv — Newsletter Referral Program](https://www.beehiiv.com/features/referral-program)
- [Beehiiv Review 2026](https://www.emailtooltester.com/en/reviews/beehiiv/)
- [Zapier Social Media Automation](https://zapier.com/automation/social-media-automation)
- [Automate Social Media with AI and Zapier](https://hastewire.com/blog/automate-social-media-with-ai-and-zapier-step-by-step-guide)
