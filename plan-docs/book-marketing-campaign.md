# Book Marketing Campaign — Powered by Marko
**Full Campaign Brief: Using Marko as the Engine to Market the Book**
Generated: March 2026

> **Note:** This plan assumes the book is a growth/marketing/experimentation title by the Marko founder. Update `[BOOK TITLE]`, `[AUTHOR NAME]`, and `[BOOK TAGLINE]` throughout once confirmed.

---

## 1. Campaign Overview

**Campaign name:** The Experiment

**One-sentence summary:**
Use Marko — the AI growth engine — to run a systematic book launch campaign, treating every channel as an experiment and the book launch as the most visible proof of concept.

**Primary objective:**
1,000 book sales in the first 30 days. Everything else is an experiment leading to that number.

**Secondary objectives:**
- 2,000+ email subscribers (The Experiment Brief) from book readers
- 500 Marko signups attributed to book content
- Author established as the #1 voice on AI-powered growth experimentation

**The meta-story:**
The author is marketing a book about running growth experiments — using an AI growth engine. Every piece of content documents the experiment. The audience watches in real time. This is the ultimate proof of concept and the most compelling marketing story in the niche.

---

## 2. Target Audience

**Primary:** Founders and growth leads at early-to-mid stage SaaS companies (5–200 employees). They run experiments but slowly, manually, and without a system. They've read Cialdini, follow Lenny Rachitsky, and know what a growth loop is.

**Secondary:** Marketing consultants and growth agencies who run experiments for multiple clients simultaneously and need a scalable system.

**Pain point:** Not a lack of ideas. A lack of execution. They know what to test. They don't have the infrastructure to test it systematically.

**Where they live:** LinkedIn (primary), X/Twitter, Lenny's Newsletter, Reforge communities, growth-focused Slack groups, YouTube (tutorials), TikTok/Reels (increasingly).

**Buying stage:** Mostly consideration → decision. They already believe in experimentation. This book gives them the system.

---

## 3. Key Messages

**Core message:**
> "You don't have an ideas problem. You have an execution problem."

**Supporting messages:**
1. "Growth teams that run 30 experiments a month grow 2.7x faster than those running 5. The difference isn't intelligence — it's infrastructure."
2. "Every principle in this book was validated by an experiment. The book itself is the experiment."
3. "Cialdini taught you the psychology. This book gives you the operating system."
4. "One person. 30 simultaneous experiments. An AI handles the infrastructure."

**Proof points:**
- Marko running live — experiments being generated and killed in real time
- Real lift numbers from experiments documented in the book
- The 8-week build-in-public campaign that launched alongside the book

---

## 4. The Avatar Pipeline — Author Videos at Scale

This is the core infrastructure that enables video content without the author recording a new video every day.

### The Full Pipeline

```
STEP 1: Marko Content Engine
Claude (Sonnet) generates video script
from book excerpt + target platform + style
        ↓
STEP 2: Delphi
Author's AI clone refines script
into the author's exact voice, cadence, vocabulary
        ↓
STEP 3: ElevenLabs Voice Clone
Script text → author's cloned voice audio
(trained on 30+ min of author recordings)
        ↓
STEP 4: Higgsfield Kling Avatar 2.0
Author photo (or consistent avatar image) + audio file
→ 1080p talking head video with lip-sync
        ↓
STEP 5: Publishing Queue (Marko Dashboard)
Video file ready for TikTok/Reels/Shorts
Caption pre-written. 3-minute manual upload.
```

### Setup Requirements (One-Time)

| Tool | Setup | Cost |
|------|-------|------|
| **Delphi** (delphi.ai) | Upload: book manuscript, past interviews, blog posts, 2+ hours of video/audio | Creator plan ~$49/mo |
| **ElevenLabs** | Record 30 min clean audio → professional voice clone | Creator $22/mo (100K chars) |
| **Higgsfield** | Upload 5–10 author photos (different angles, lighting) | Pay per video |

### Output per Pipeline Run
- Input: 1 book excerpt or key message (30–120 words)
- Output: 60–90 second talking head video, fully rendered, ready to post
- Time: ~15 minutes end-to-end (most of it waiting for render)
- Cost: ~$0.80–$1.50 per video (Higgsfield credits)

### When to Use the Pipeline vs. Real Video
| Use Pipeline | Record Real Video |
|-------------|-----------------|
| Daily TikTok/Reels/Shorts | Weekly YouTube long-form |
| Evergreen book quotes | Live reactions and launches |
| Multi-language versions | Podcast appearances |
| High-volume batch weeks | Events and conferences |

---

## 5. Claude → Higgsfield Prompt Architecture

This is the exact prompt design Claude uses inside Marko's Content Engine to generate structured Higgsfield prompts. Designed for minimum tokens, maximum quality output.

### The Tiered Model Routing

```
Input type              → Model used       → Reason
─────────────────────────────────────────────────────
Book excerpt (raw)      → Haiku 4.5        → Simple extraction, cheap
Script draft            → Sonnet 4.6       → Creative quality needed
Final Higgsfield prompt → Sonnet 4.6       → Precision matters
Captions + hashtags     → Haiku 4.5        → Routine, cheap
Email newsletter        → Sonnet 4.6       → Voice quality critical
Blog post draft         → Sonnet 4.6       → SEO + depth needed
```

### System Prompt (Cached — Saves 90% on Repeated Context)

```
[CACHE THIS — stored as prefix, reused across all book marketing calls]

You are a marketing content engine for [BOOK TITLE] by [AUTHOR NAME].

BOOK CONTEXT:
- Title: [BOOK TITLE]
- Tagline: [BOOK TAGLINE]
- Core thesis: Growth teams fail at execution, not ideation. AI-powered experimentation infrastructure solves this.
- Key chapters: [list 5–7 chapter titles]
- Author voice: Direct, data-first, no fluff. Uses specific numbers. Conversational but authoritative. Sounds like Lenny Rachitsky meets Alex Hormozi.
- Target reader: SaaS founders and growth leads, 28–45, technically literate, already believe in A/B testing

PLATFORM RULES:
- TikTok/Reels: Hook in 3 seconds. Save-worthy. Educational. No CTAs until last 5 sec.
- LinkedIn: Insight-first. Question at end. No "Excited to share" openers.
- Email: One idea. One CTA. Under 300 words.
- Higgsfield video: 4 structured fields. Short commands. No descriptive paragraphs.
```

### Higgsfield Prompt Generator — Claude Prompt Template

**Input to Claude (minimal tokens):**
```
Generate a Higgsfield Kling Avatar video prompt.

Book excerpt: "[paste 2–3 sentences from book]"
Platform: [TikTok/Reel/Short]
Style: [educational / quote / story / tip]
Duration: [30s / 60s / 90s]
```

**Claude's Output Structure (what gets sent to Higgsfield API):**
```json
{
  "script": "Hook sentence that grabs attention.\n\nCore insight from the book, explained simply.\n\nOne actionable takeaway.\n\nCTA: [Save this / Follow for more / Link in bio for the book]",

  "avatar": "Professional author, confident, direct eye contact, neutral expression that reacts naturally to key points",

  "camera": "Medium close-up shot. Subtle push-in during key insight. Return to medium shot for CTA.",

  "motion": "Minimal hand gestures for emphasis on key numbers. Slight head nods. Natural blink rate. No excessive movement.",

  "style": "Clean, modern. Soft directional lighting from left. Shallow depth of field. Slightly warm colour grade.",

  "background": "Minimal home office or clean studio. Bookshelf subtly visible. Not distracting."
}
```

**Full Claude prompt (copy-paste ready for Marko's content engine):**

```
You generate video prompts for Higgsfield Kling Avatar 2.0.

Rules:
- Script: max 150 words. Hook in first sentence. Data point in middle. CTA at end.
- Camera: one movement maximum. Start wide or medium, push in once.
- Motion: conservative. Real gestures only.
- Style: clean professional. Warm grade.
- Background: minimal.
- Output: valid JSON only. No extra text.

Book context: [CACHED SYSTEM PROMPT ABOVE]

Input: {excerpt}
Platform: {platform}
Duration: {duration}

Output the JSON prompt object.
```

---

## 6. Token Cost Optimisation System

### The Problem
Generating content for 10 platforms × 4 pieces/week × 52 weeks = 2,080 generations/year. Without optimisation, this gets expensive.

### Solution: 3-Layer Cost Strategy

**Layer 1: Prompt Caching (90% savings on input)**
Cache the book context system prompt across all calls. Since every generation uses the same book context (title, author voice, chapters, rules), this is almost always a cache hit after the first call.

```typescript
// In lib/ai/content-prompts.ts
// Mark the book context block as cacheable
const BOOK_SYSTEM_PROMPT = {
  type: "text",
  text: `[Full book context here — 500–800 tokens]`,
  cache_control: { type: "ephemeral" }  // Anthropic prompt caching
}
```

Cost savings: 800 tokens × 2,080 calls × $0.003/1K tokens = **$5/year on input alone** → with caching: **$0.50/year**

**Layer 2: Model Routing (50–70% savings on generation)**

```typescript
// lib/ai/model-router.ts
export function selectModel(task: ContentTask): string {
  const HAIKU = "claude-haiku-4-5-20251001"   // $1/$5 per M tokens
  const SONNET = "claude-sonnet-4-6-20260301"  // $3/$15 per M tokens

  const haikuTasks = [
    "caption",
    "hashtags",
    "metadata",
    "title_variants",
    "simple_rewrite",
    "higgsfield_prompt"    // structured JSON, not creative
  ]

  const sonnetTasks = [
    "video_script",
    "linkedin_post",
    "email_newsletter",
    "blog_post",
    "book_excerpt_commentary",
    "x_thread"
  ]

  return haikuTasks.includes(task) ? HAIKU : SONNET
}
```

**Layer 3: Batch API (50% savings on everything)**
Run the full week's content generation in a single Monday batch via Inngest:

```typescript
// lib/inngest/functions/weekly-content-batch.ts
// Runs Monday 7 AM — before the weekly-ideas cron
// Generates ALL content for the week in one Anthropic Batch API call
// 50% discount on both input and output tokens
export const weeklyContentBatch = inngest.createFunction(
  { id: "weekly-book-content-batch" },
  { cron: "TZ=UTC 0 7 * * 1" },
  async ({ step }) => {
    await step.run("batch-generate-week-content", async () => {
      const requests = buildWeekContentRequests()  // all 20+ pieces
      const batch = await anthropic.batches.create({ requests })
      // Poll for completion, store results in content_assets
    })
  }
)
```

### Cost Estimate: Full Book Marketing Campaign

| Generation type | Volume/week | Model | Cost/call | Weekly cost |
|----------------|-------------|-------|-----------|-------------|
| Video scripts | 5 | Sonnet (cached) | ~$0.004 | $0.02 |
| Higgsfield prompts | 5 | Haiku | ~$0.001 | $0.005 |
| LinkedIn posts | 3 | Sonnet (cached) | ~$0.003 | $0.009 |
| Email newsletter | 1 | Sonnet (cached) | ~$0.008 | $0.008 |
| Blog post | 2 | Sonnet (cached) | ~$0.015 | $0.03 |
| Captions/hashtags | 15 | Haiku | ~$0.0005 | $0.0075 |
| X threads | 3 | Sonnet (cached) | ~$0.003 | $0.009 |
| **Total** | | | | **~$0.09/week** |

With Batch API 50% discount: **~$0.045/week = $2.34/year for ALL AI content generation.**

Higgsfield video rendering: ~$1/video × 5/week = $5/week = $260/year
ElevenLabs audio: ~$0.03/script × 5/week = $0.15/week = $7.80/year

**Total AI content production cost: ~$270/year for daily multi-platform video content.**

---

## 7. Channel Strategy

### Channel 1: LinkedIn (Primary — Book Audience Lives Here)
- **Format:** Text posts 3x/week + carousel 1x/week
- **Book angle:** Build-in-public launch. Every post documents the experiment of launching the book using its own principles.
- **Why it works:** The audience is growth leaders. They will share posts about growth systems.
- **Budget:** $0 (organic only until Week 8+)

### Channel 2: TikTok + Instagram Reels (Avatar Pipeline)
- **Format:** 60–90 second Higgsfield talking head videos, 3x/week
- **Book angle:** "One insight from the book" series. Each video = one experiment, one principle, one result.
- **Why it works:** Saves are the top signal. Educational content saves well. Each video is a book sample.
- **Budget:** $5/week (Higgsfield rendering)

### Channel 3: YouTube Shorts (Repurposed)
- **Format:** Same videos as TikTok, uploaded natively to YouTube
- **Budget:** $0 (repurpose only)

### Channel 4: YouTube Long-Form
- **Format:** Monthly "Book Chapter Deep Dive" — 15–20 minute video per chapter
- **Why:** Where buying decisions happen for B2B books. Amazon links convert well from YouTube.
- **Budget:** $0 (record once, distribute)

### Channel 5: Email — The Experiment Brief
- **Format:** Weekly newsletter. Each issue: one experiment from the book, how to replicate it, result.
- **Why:** Moves readers from aware → buyer. Newsletter subscribers convert to book buyers at 3–8x vs. social.
- **Beehiiv referral program:** 3 referrals = free book chapter PDF. 10 referrals = signed copy.
- **Budget:** $0 (Beehiiv Launch plan, free to 2,500 subs)

### Channel 6: X/Twitter
- **Format:** Threads 3x/week. Single posts daily.
- **Angle:** Data drops from the book. Contrarian takes on growth. Build-in-public numbers.
- **Budget:** $19/month (X Premium for reach boost)

### Channel 7: SEO Blog
- **Format:** One blog post per book chapter. Written to rank for the chapter's core search term.
- **Examples:**
  - Chapter on Cialdini → "Cialdini principles applied to SaaS growth"
  - Chapter on auto-kill → "When to stop an A/B test"
  - Chapter on experiments → "How many experiments should your growth team run"
- **Budget:** $0

### Channel 8: Amazon/Goodreads SEO
- **Book listing optimisation:** Keywords in title/subtitle, A+ content page with experiment results, 5+ verified reviews from launch list before Day 1.
- **Budget:** $0

---

## 8. Content Calendar (8-Week Launch)

| Week | Theme | Anchor Content | Channels |
|------|-------|---------------|----------|
| **-4** | Waitlist build | "You don't have an ideas problem" LinkedIn post | LinkedIn, X |
| **-4** | | Beehiiv newsletter launch | Email |
| **-3** | Chapter teasers | Avatar video: core thesis | TikTok, Reels, Shorts |
| **-3** | | "The 8 experiments I ran to write this book" thread | X |
| **-2** | Social proof | Beta reader results carousel | LinkedIn, Instagram |
| **-2** | | Blog: "How to run 30 experiments simultaneously" | Blog, shared on all |
| **-1** | Launch prep | "Book drops in 7 days. Here's what's in it." | All channels |
| **-1** | | AMA invitation post | LinkedIn, X |
| **0** | LAUNCH DAY | Avatar video: Chapter 1 key insight | All channels simultaneously |
| **0** | | Email: "It's live — here's your first experiment" | Email list |
| **0** | | LinkedIn: "We just launched. Here's the real number: [X copies sold]" | LinkedIn |
| **+1** | Results | Day 1 numbers post | LinkedIn, X |
| **+1** | | Avatar video: Chapter 2 insight | TikTok, Reels |
| **+2** | Experiment docs | "Week 1 experiment: which CTA drove most sales" | All channels |
| **+2** | | Blog: Chapter 3 expanded | Blog |
| **+3** | Social proof | First reader results | LinkedIn carousel, email |
| **+4** | Sustain | Chapter series continues (one video per chapter) | TikTok, YouTube |
| **+4** | | Monthly experiment brief | Email |

---

## 9. Content Assets Needed

### Pre-Launch (Must-Have)
| Asset | Description | Priority | Lead Time |
|-------|-------------|----------|-----------|
| Author photo set | 10+ professional photos, varied angles, clean backgrounds | Must | 1 week |
| ElevenLabs voice clone | 30 min clean audio recording → trained voice clone | Must | 3 days |
| Delphi clone setup | Upload manuscript + 5+ hours of existing content | Must | 1 week |
| Higgsfield account + avatar | Test Kling Avatar 2.0 with author photo + ElevenLabs audio | Must | 1 day |
| Beehiiv publication | Set up with referral program, branding, welcome sequence | Must | 1 day |
| Landing page | Book description, buy button, sample chapter download | Must | 3 days |
| Lead magnet | Sample chapter PDF → email optin | Must | 1 day |
| Email welcome sequence | 5 emails, moves subscriber toward purchase | Must | 2 days |
| 5x pre-launch LinkedIn posts | Build-in-public series before launch | Must | 1 week |
| 10x TikTok scripts | Pre-generated via pipeline, ready to render | Must | 2 days (AI) |

### Launch Week (Must-Have)
| Asset | Description | Priority |
|-------|-------------|----------|
| Launch day avatar video | Chapter 1 key insight, 90 sec | Must |
| Launch email | "It's live" email to full list | Must |
| LinkedIn launch post | Real numbers, direct link | Must |
| Day 1 results post | Transparency builds trust | Must |
| Amazon listing A+ content | Enhanced description with experiment results | Must |

### Ongoing (Nice-to-Have)
| Asset | Description | Priority |
|-------|-------------|----------|
| Chapter deep-dive YouTube videos | 1 per chapter, 15–20 min | High |
| Goodreads author profile | For discovery | Medium |
| Press release | For PR channels | Low |
| Podcast pitch list | Guest appearances | Medium |

---

## 10. Success Metrics

| KPI | Target | How to Track |
|-----|--------|-------------|
| **Book sales (30 days)** | 1,000 copies | Amazon KDP dashboard |
| **Email subscribers** | 2,000 | Beehiiv |
| **Marko signups from book** | 500 | UTM links in book + landing page → GA4 |
| **TikTok saves per video** | >3% of views | TikTok Analytics |
| **LinkedIn post engagement** | >2% engagement rate | LinkedIn Analytics |
| **Email open rate** | >40% | Beehiiv |
| **Newsletter referrals** | 200 (Beehiiv referral program) | Beehiiv |
| **Amazon ranking** | Top 100 in Growth category | Amazon Best Seller rank |

---

## 11. Budget

| Item | Monthly | One-Time | Notes |
|------|---------|----------|-------|
| Delphi creator plan | $49 | — | Cancel post-launch if not scaling |
| ElevenLabs creator plan | $22 | — | Can downgrade after batch creation |
| Higgsfield video rendering | $20–40 | — | ~$1/video × 20–40/month |
| Buffer scheduling | $6 | — | All social channels |
| Beehiiv | $0 | — | Free to 2,500 subscribers |
| X Premium | $19 | — | Reach boost |
| Author photo shoot | — | $200–500 | One-time |
| Book cover design | — | $300–800 | If not already done |
| **Total** | **~$116–136/mo** | **$500–1,300** | Lean launch budget |

Claude API (Batch + cached): ~$4/month — effectively free.

---

## 12. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Higgsfield avatar looks uncanny/off | Medium | Test 10+ output samples before campaign. Have real video backup for launch day. |
| Algorithm changes suppress video reach | Medium | Diversify: never rely on one channel. Email list is the safety net. |
| Low launch week sales | Low | Pre-build list to 500+ before launch. Warm launch > cold launch. |
| ElevenLabs voice doesn't match real voice | Low | Use professional voice cloning (30+ min sample). Test extensively before pipeline goes live. |

---

## 13. Next Steps

**This week:**
1. Confirm book title, tagline, key chapters → update all placeholders in this plan
2. Book professional photo shoot session
3. Record 30+ minutes of clean audio for ElevenLabs voice clone
4. Set up Delphi: upload manuscript draft, existing video/audio content
5. Set up Beehiiv publication, configure referral program, write 5-email welcome sequence

**Next week:**
6. Test Higgsfield Kling Avatar 2.0 with 3 test scripts → review quality
7. Configure Marko content engine with book system prompt (cached)
8. Generate first 10 TikTok scripts via pipeline → render all 10 videos
9. Write 5 pre-launch LinkedIn posts
10. Set up Buffer, connect all channels

**Week 3–4:**
11. Begin pre-launch content (4 weeks before launch date)
12. Run first Beehiiv newsletter
13. Launch referral program

---

## 14. The Meta-Play (Most Important)

Every piece of marketing content is itself an experiment tracked in Marko. The author can:

1. Create a Marko workspace for "book launch"
2. Run these experiments simultaneously:
   - `LinkedIn text vs carousel` → which drives more link clicks?
   - `TikTok hook A vs hook B` → which gets more saves?
   - `Email subject line A vs B` → which open rate wins?
   - `Buy button CTA: "Get the book" vs "Run your first experiment"` → which converts?
3. Auto-kill underperforming content variants after 7 days
4. Document the winners as content ("We ran 30 experiments on our own book launch. Here's what won.")

This closes the loop: the book teaches systematic experimentation → the launch demonstrates it → the results become content → the content sells more books.

---

## Sources
- [Higgsfield Speak: Cinematic Talking-Head Videos](https://higgsfield.ai/blog/The-Fastest-Way-to-Create-Cinematic-Talking-Head-Videos)
- [Higgsfield Kling Avatar 2.0](https://higgsfield.ai/blog/Meet-KlingAI-Avatar-2.0-AI-Talking-Avatars)
- [Higgsfield AI Prompt Format Guide](https://blog.segmind.com/higgsfield-ai-prompt-guide-video-creation/)
- [How to Use Higgsfield API](https://apidog.com/blog/higgsfield-api/)
- [Delphi AI — Create Digital Clones](https://www.growthday.com/delphi-ai)
- [How Delphi Creates Digital Clones of Thought Leaders](https://www.assemblyai.com/blog/how-delphi-leverages-ai-to-create-digital-clones-of-thought-leaders)
- [ElevenLabs Professional Voice Cloning](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/professional-voice-cloning)
- [AI Audiobook Production with ElevenLabs](https://www.feisworld.com/blog/elevenlabs-audiobook)
- [Claude API Pricing 2026](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- [Claude API Token Optimization Guide](https://www.sitepoint.com/claude-api-token-optimization/)
- [Beehiiv Newsletter Referral Program](https://www.beehiiv.com/features/referral-program)
