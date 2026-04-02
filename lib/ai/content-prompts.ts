import type { Idea } from "@/lib/types"
import { BRAND_VOICE_BLOCK } from "@/lib/ai/cialdini-brand"

// ─── System prompt (cached — used repeatedly across all content generation) ──
// The full brand voice block is ~3,500 tokens. With prompt caching enabled,
// this costs ~$0.0003 per call after the first hit. Worth it for 100% brand alignment.

export const CONTENT_SYSTEM_PROMPT = `You are Marko, a growth content engine for the Cialdini Institute.
You write marketing content that applies Cialdini's influence principles.
Always write in a direct, confident, data-driven tone. No fluff. No filler sentences.
Output only the requested content — no preamble, no explanation.

${BRAND_VOICE_BLOCK}

CRITICAL: Every piece of content you generate MUST:
1. Reference at least one specific study from the PRINCIPLES_REFERENCE with real numbers
2. Name the Cialdini principle being applied
3. Follow the AWARENESS STAGE rules for the given stage
4. Pass the VOICE RULES — zero tolerance for banned words or off-brand tone
5. Match the FEW-SHOT EXAMPLES in style and specificity`

// ─── Per-channel content generation prompts ──────────────────────────────────

export function buildLinkedInPrompt(idea: Idea): string {
  // Research-driven rewrite (2025 algorithm data):
  // 1. Single-sentence line breaks triple dwell time on mobile (60% of LinkedIn traffic).
  // 2. Hook must land within 210 chars (the "See more" cutoff) — bold claim or contrarian stat beats questions.
  // 3. Posts 1,500+ characters outperform short posts; 200–280 words is the sweet spot for thought leadership.
  // 4. A genuine comment-prompt question (not "comment YES") at the end is the #1 lever for the quality-comment signal the algorithm weights most.
  // 5. Hashtags moved to 3 max at end — 2025 data shows 1–3 outperform 5+ and hashtags no longer drive meaningful reach alone.

  return `You are a LinkedIn growth strategist writing for the Cialdini Institute — the world's authority on ethical persuasion science, founded by Dr. Robert Cialdini (author of Influence, 7M copies sold). Products include the INFLUENCE book, POP Workshop (B2B corporate training), CMCT Certification, and Keynote Speaking.

Write a high-performing LinkedIn thought leadership post for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Expected lift:** ${idea.expected_lift ?? ""}

---

## ALGORITHM-OPTIMIZED FORMAT RULES (follow exactly)

### Structure (in this order):
1. HOOK LINE — one sentence, max 210 characters. Must be a bold claim, contrarian stat, or counterintuitive insight. No "I" opener. No question. No em-dash. End with a period or colon to create a hard stop that forces "See more."
2. BLANK LINE
3. BODY — 5 to 8 short paragraphs. Each paragraph is 1–2 sentences max. One idea per paragraph. Blank line between every paragraph. Use plain line breaks — no bullet points, no numbering. Total post length: 220–280 words including hook and CTA.
4. BLANK LINE
5. CIALDINI ANCHOR — one sentence that names a specific Cialdini principle (reciprocity, commitment, social proof, authority, liking, scarcity, or unity) and ties it to the insight. Format: "This is [Principle] in action."
6. BLANK LINE
7. CTA — one clear action. For training/workshop relevance: direct to bringing this to their team or the INFLUENCE book. Keep it to 1 sentence.
8. BLANK LINE
9. COMMENT PROMPT — end with a genuine open-ended question that invites professional perspective. NOT "comment below" or "tag a friend." Good format: "What's the most [X] you've seen this principle applied in your work?" The question should have a defensible right/wrong answer so responses are substantive.
10. BLANK LINE
11. HASHTAGS — exactly 3, at the very end, on one line: always include #Cialdini, one principle hashtag (e.g. #SocialProof), and one audience hashtag (#Leadership or #SalesLeadership or #Marketing).

### Voice rules:
- Direct. Confident. Data-driven. No fluff.
- Reference at least one specific study, statistic, or named Cialdini research finding (with a number or percentage — invent plausible-sounding specifics if needed, grounded in real persuasion science).
- No em-dashes. Active voice. Short declarative sentences.
- Do not open any sentence with "I".

---

Return JSON only — no preamble, no explanation:
{"body": "full post text with all line breaks and hashtags exactly as it should appear on LinkedIn", "hook": "first line only", "principle": "Cialdini principle name", "cta_text": "the CTA line only", "comment_prompt": "the question at the end only"}`
}

export function buildEmailPrompt(idea: Idea): string {
  return `You are writing a newsletter email for the Cialdini Institute — the world's authority on ethical persuasion science. Dr. Robert Cialdini authored "Influence" (7M copies sold).

Write a marketing email for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Expected lift:** ${idea.expected_lift ?? "unknown"}

## EMAIL FORMAT RULES (follow exactly)

### Subject line:
- Max 50 chars. Lead with a specific study detail, number, or counterintuitive finding.
- Good: "The 23% tip increase that rewrote persuasion science"
- Bad: "🔥 5 persuasion hacks you NEED"

### Preview text:
- Max 90 chars. Extends the curiosity from the subject — do NOT repeat it.

### Body (100–200 words):
1. OPEN with a specific Cialdini study or finding (name the study, include the number).
2. BRIDGE to the reader's world — how does this apply to their sales, marketing, or leadership?
3. TEACH one actionable takeaway grounded in the named principle.
4. CTA — one clear action appropriate to the awareness stage. Use button-style text.
5. P.S. line — a second hook or related finding that rewards readers who scroll.

### Voice:
- Tone: Smart colleague sharing research over coffee, NOT salesperson pitching.
- Reference at least one specific study from Cialdini's work with a real number.
- Name the principle being applied.
- No buzzwords, no hype, no em-dashes.

Return JSON only:
{"subject": "...", "preview": "...", "body": "full email in markdown", "cta": "button text", "ps": "P.S. line", "principle": "principle name"}`
}

export function buildBlogPrompt(idea: Idea): string {
  return `You are writing a blog post for the Cialdini Institute — the world's authority on ethical persuasion science.

Write a research-backed blog post for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Expected lift:** ${idea.expected_lift ?? "unknown"}

## BLOG FORMAT RULES

### SEO:
- SEO title: 50–60 chars, includes the core keyword, specific (number or named study)
- Meta description: 140–155 chars, benefit-led
- Good title: "The Hotel Towel Experiment That Proves Social Proof Works"
- Bad title: "5 Amazing Persuasion Tips for Business Leaders"

### Article (900–1,200 words):
1. **Hook** — Open with a specific Cialdini study. Set the scene, give the numbers, make it vivid.
2. **The Science** — Explain the principle at work. Reference the original research and at least one replication or application study.
3. **In Practice** — Bridge to the reader's business context. Give 2-3 concrete application examples for sales, marketing, or leadership.
4. **The Framework** — Provide a simple 3-step implementation framework the reader can use Monday morning.
5. **Common Mistakes** — What goes wrong when this principle is applied poorly or unethically.
6. **CTA Section** — "Apply This in Your Organization" — link to POP Workshop, CMCT Certification, or book depending on awareness stage.

### Voice:
- Tone: Harvard Business Review meets Malcolm Gladwell. Academic rigor, engaging storytelling.
- Every section must reference specific research with real numbers.
- StoryBrand: reader is the hero, Cialdini Institute is the guide.
- Include FAQ schema questions (3 Q&As) for SEO.

Return JSON only:
{"seo_title": "...", "meta_description": "...", "body": "full markdown article", "slug": "url-friendly-slug", "faq": [{"q": "...", "a": "..."}, {"q": "...", "a": "..."}, {"q": "...", "a": "..."}], "keywords": ["kw1", "kw2", "kw3"]}`
}

export function buildVideoScriptPrompt(idea: Idea): string {
  return `You are writing a video script for the Cialdini Institute — Dr. Robert Cialdini's organization, the world's authority on ethical persuasion science.

Write a 60–90 second talking-head video script for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Expected lift:** ${idea.expected_lift ?? "unknown"}

## VIDEO SCRIPT RULES

### Structure (in this order):
1. **HOOK (0-3 sec)** — Pattern interrupt. Open with a specific study finding or counterintuitive stat. "A restaurant server earned 23% more tips — by turning around." NOT a question. NOT "Hey guys." NOT "Did you know?"
2. **CONTEXT (3-15 sec)** — Set up the study or scenario briefly.
3. **THE SCIENCE (15-40 sec)** — Explain the Cialdini principle at work. Name it. Give the numbers.
4. **YOUR MOVE (40-55 sec)** — Bridge to the viewer's life. One concrete application.
5. **CTA (55-60/90 sec)** — "Follow for more persuasion science" or "Link in bio for the POP Workshop."

### Voice:
- Conversational but authoritative. Professor in a coffee shop, not TED speaker on stage.
- Written to be SPOKEN — short sentences, natural rhythm, no written-language constructions.
- Must name the specific Cialdini principle.
- Must cite at least one real study with a number.
- No buzzwords. No hype. No "game-changer" or "unlock."
- ~150 words for 60s, ~225 words for 90s.

### Platform: vertical video (9:16) for TikTok/Reels/Shorts.

Return JSON only:
{"title": "video title for upload", "script": "full spoken script with [PAUSE] markers", "hook": "first sentence only", "duration_estimate": "60s or 90s", "caption": "social media caption with 3 hashtags including #Cialdini", "principle": "principle name"}`
}

export function buildTwitterPrompt(idea: Idea): string {
  return `You are writing a Twitter/X thread for the Cialdini Institute — Dr. Robert Cialdini's organization, the world's authority on ethical persuasion science.

Write a thread for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}

## TWITTER THREAD RULES

### Structure (5 tweets):
1. **HOOK TWEET** — Max 280 chars. Open with a specific study finding or stat. Bold, counterintuitive, shareable. End with "🧵" to signal thread. No questions. No "I".
2. **THE STUDY** — Name the researchers, describe the setup, give the result with numbers.
3. **THE PRINCIPLE** — Name the Cialdini principle. Explain WHY it works in one tweet.
4. **YOUR MOVE** — One concrete application for the reader's sales, marketing, or leadership context.
5. **CTA** — Drive to Cialdini Institute resource + "Follow @RobertCialdini for more persuasion science."

### Voice:
- Punchy. Specific. Zero filler.
- Every tweet must earn its place — no "Let me explain" or "Here's the thing."
- Reference at least one named study with a real number.
- Name the principle.
- No em-dashes. No buzzwords. No emoji spam (one 🧵 on tweet 1 is OK).
- Active voice. Short declarative sentences.

Return JSON only:
{"tweets": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"], "hook": "first tweet only", "principle": "principle name"}`
}

export function buildPushPrompt(idea: Idea): string {
  return `Write a push notification for this growth experiment:

Title: ${idea.title}
Expected lift: ${idea.expected_lift ?? "unknown"}

Requirements:
- Title: max 50 chars
- Body: max 100 chars
- Urgent but not spammy
- Clear benefit or action

Return JSON:
{"title": "...", "body": "..."}`
}

export function buildAdCopyPrompt(idea: Idea): string {
  return `Write paid ad copy for this growth experiment:

Title: ${idea.title}
Rationale: ${idea.rationale ?? ""}

Requirements:
- Headline: max 30 chars (Google/Meta style)
- Description: max 90 chars
- CTA: max 15 chars
- Write 3 variants (A/B/C)

Return JSON:
{"variants": [
  {"headline": "...", "description": "...", "cta": "..."},
  {"headline": "...", "description": "...", "cta": "..."},
  {"headline": "...", "description": "...", "cta": "..."}
]}`
}

// Map idea channel to content generation tasks
export const CHANNEL_CONTENT_MAP: Record<string, Array<{
  channel: string
  asset_type: string
  promptFn: (idea: Idea) => string
  traceName: string
}>> = {
  Social: [
    { channel: "LinkedIn", asset_type: "post",   promptFn: buildLinkedInPrompt,   traceName: "content-linkedin" },
    { channel: "Video",    asset_type: "video",   promptFn: buildVideoScriptPrompt, traceName: "content-video-script" },
    { channel: "Twitter",  asset_type: "thread",  promptFn: buildTwitterPrompt,    traceName: "content-twitter" },
  ],
  Email: [
    { channel: "Email",    asset_type: "email",   promptFn: buildEmailPrompt,      traceName: "content-email" },
  ],
  Web: [
    { channel: "Blog",     asset_type: "blog",    promptFn: buildBlogPrompt,       traceName: "content-blog" },
    { channel: "LinkedIn", asset_type: "post",    promptFn: buildLinkedInPrompt,   traceName: "content-linkedin" },
  ],
  Paid: [
    { channel: "Ad",       asset_type: "ad",      promptFn: buildAdCopyPrompt,     traceName: "content-ad" },
    { channel: "Email",    asset_type: "email",   promptFn: buildEmailPrompt,      traceName: "content-email" },
  ],
  Push: [
    { channel: "Push",     asset_type: "push",    promptFn: buildPushPrompt,       traceName: "content-push" },
  ],
}
