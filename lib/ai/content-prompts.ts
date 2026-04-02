import type { Idea } from "@/lib/types"
import { PRINCIPLES_REFERENCE, STORYBRAND_FRAMEWORK, AWARENESS_RULES, CONTENT_SCORE_CRITERIA, BOB_CIALDINI_VOICE } from "@/lib/ai/cialdini-brand"

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — cached across all content generation calls
// ─────────────────────────────────────────────────────────────────────────────

export const CONTENT_SYSTEM_PROMPT = `You are ghostwriting content for Dr. Robert B. Cialdini and the Cialdini Institute. Every piece must sound like Bob wrote it himself — not like a marketer writing "about" his ideas.

${BOB_CIALDINI_VOICE}

## BRAND PRODUCTS

B2C entry point: INFLUENCE book ($18–28) and Pre-Suasion
B2B pipeline: POP Workshop (corporate training), CMCT Certification (train-the-trainer), Keynote Speaking
Corporate clients: Google, Microsoft, IBM, KPMG, Pfizer, Harvard Kennedy School, NATO — cite when relevant.

## THE PRINCIPLES (for reference in every piece of content)

${PRINCIPLES_REFERENCE}

## STORYBRAND RULE — the reader is always the HERO

${STORYBRAND_FRAMEWORK}

## AWARENESS STAGE DISCIPLINE

Every content piece is tagged with an awareness stage. Respect these rules:
- **Unaware**: NEVER mention Cialdini, the book, or training products. Focus on the symptom.
- **Problem-aware**: Name the problem, introduce the CATEGORY (persuasion science), but don't pitch products.
- **Solution-aware**: Now introduce Cialdini as THE authority. Name principles, cite studies.
- **Product-aware**: Name specific products (POP Workshop, CMCT, Keynote). Use client social proof.
- **Most-aware**: Conversion push. Scarcity, urgency, direct CTA with price/timeline signals.

## OUTPUT RULES

- Return ONLY valid JSON — no markdown fences, no preamble, no explanation
- Content must be specific to Cialdini's research, not generic marketing advice
- Every piece must include at least one named study, specific percentage, or real experiment
- B2C content CTA → book purchase / email list
- B2B content CTA → workshop inquiry / CMCT certification / keynote booking
- The READER is the hero. Cialdini Institute is the guide. Never reverse this.`

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function audienceCTA(idea: Idea): string {
  return idea.audience === "b2b"
    ? "Inquire about a team workshop → cialdini.com/training"
    : "Get the book that started it → cialdini.com/influence"
}

function hookInstruction(idea: Idea): string {
  const hooks: Record<string, string> = {
    "stat-shock":   "Open with the most surprising statistic or research finding from this principle. The number must be specific — not rounded.",
    "before-after": "Open by showing the exact transformation. Show the before state, the one change, the after result with a specific number.",
    "myth-bust":    "Open by naming a commonly held belief, then demolish it with Cialdini's research. 'Most people think X. The data says Y.'",
    "application":  "Open by promising one specific, executable action. Make it concrete enough to do today, not 'someday.'",
    "dark-side":    "Open by exploring the ethical edge. Name the uncomfortable truth about how influence works before pivoting to ethical application.",
  }
  return hooks[idea.hook_type ?? "stat-shock"] ?? hooks["stat-shock"]
}

// ─────────────────────────────────────────────────────────────────────────────
// LINKEDIN — B2B pipeline driver, most important channel
// Research-driven rewrite (2025 LinkedIn algorithm data):
// 1. Single-sentence paragraphs with blank lines triple dwell time on mobile (60% of traffic)
// 2. Hook must land within 210 chars (the "See more" cutoff) — bold claim beats question opener
// 3. 220–280 words is the sweet spot for thought leadership reach
// 4. Comment-prompt question at end is #1 lever for quality-comment signals the algorithm rewards most
// 5. Exactly 3 hashtags at end — 2025 data: 1–3 outperform 5+; semantic signals now matter more than tags
// ─────────────────────────────────────────────────────────────────────────────

export function buildLinkedInPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"

  return `You are a LinkedIn growth strategist writing for the Cialdini Institute — the world's authority on ethical persuasion science, founded by Dr. Robert Cialdini (Influence, 7M copies sold). Products: INFLUENCE book (B2C entry point), POP Workshop (B2B corporate training), CMCT Certification, Keynote Speaking. Confirmed clients: Google, Microsoft, IBM, KPMG, Harvard Kennedy School, NATO.

Write a high-performing LinkedIn thought leadership post for this idea:

**Title:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme (Cialdini principle):** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}
**Audience:** ${isB2B ? "B2B — Sales directors, CMOs, L&D leaders at 50+ person organisations" : "B2C — Marketers, entrepreneurs, consultants, practitioners of ethical influence"}

## Hook instruction
${hookInstruction(idea)}

${isB2B ? `## B2B INQUIRY-INTENT STRATEGY (apply on top of format rules below)

This post has ONE job: move a Sales Director, L&D Leader, or CMO from "interesting" to "I need to bring this to my team." Engagement is a side effect, not the goal.

**Identify which buying-committee job this idea serves and write accordingly:**

- ROI Proof idea → Lead with the outcome number in line 1. The reader must be able to copy this post into a Slack message to their VP and have it land as a business case. End with an explicit training inquiry CTA.
- Hidden Cost idea → Lead with the loss, not the solution. Name what is actively bleeding from their team. Make the reader uncomfortable enough to act, calm enough to trust. End by naming the POP Workshop as the intervention.
- Committee Disarm idea → Name the skeptic's objection in line 1, then dismantle it with the science. Write as a peer executive, not a vendor. End by naming CMCT or POP Workshop as the specific resolution.

**B2B-specific structural rules:**
- The body must contain one "business scenario" paragraph: put the reader inside a scene they recognize — a sales call, a budget meeting, a post-training retrospective. "If your team..." or "In a negotiation..." or "When a CFO asks..."
- Include one "dark social line" — a stat or reframe so specific and quotable that a VP will forward it to their CFO. This is usually the outcome number or the cost-of-inaction sentence. Make it self-contained without context.
- CTA must be actionable and specific: name POP Workshop OR CMCT Certification, not "our training programs." Link to cialdini.com/training or cialdini.com/cmct.
- Hashtags for B2B: exactly 3. Always #CialdiniInstitute. Add one role-specific tag: #SalesLeadership, #LearningAndDevelopment, or #CorporateTraining. Add one principle tag.` : `## B2C POST GOAL

Drive book discovery and email list growth. End CTA points to INFLUENCE book. Hashtags: #Cialdini + one principle tag + #Persuasion or #Marketing.`}

## ALGORITHM-OPTIMISED FORMAT (follow exactly)

Structure in this order:
1. HOOK LINE — max 210 characters. Bold claim, contrarian stat, or counterintuitive insight. No "I" opener. No question opener. No em-dash. End with a period or colon so "See more" truncates cleanly.
2. BLANK LINE
3. BODY — 5–8 paragraphs. Each paragraph is 1–2 sentences max. One idea per paragraph. Blank line between every paragraph. No bullet points. No numbered lists. Total post length: 220–280 words including hook and CTA.
4. BLANK LINE
5. CIALDINI ANCHOR — one sentence naming the specific principle and tying it to the insight. Format: "This is [Principle] in action."
6. BLANK LINE
7. CTA — one sentence. ${isB2B ? "Name the specific product (POP Workshop or CMCT Certification) and link: cialdini.com/training or cialdini.com/cmct. Do not use vague phrases like 'our programs.'" : "Point to the book: 'Get the book that started it → cialdini.com/influence'"}
8. BLANK LINE
9. COMMENT PROMPT — a genuine open-ended question inviting professional perspective. NOT "comment below" or "tag a friend." Must have a defensible right/wrong answer so responses are substantive. ${isB2B ? "Frame it for senior professionals: 'Where have you seen this most dramatically change a negotiation or sales outcome on your team?'" : "Good format: 'What's the most [X] you've seen this work in your own experience?'"}
10. BLANK LINE
11. HASHTAGS — exactly 3 on one line: ${isB2B ? "#CialdiniInstitute + one role-specific tag (#SalesLeadership, #LearningAndDevelopment, or #CorporateTraining) + one principle tag" : "#Cialdini + one principle hashtag (e.g. #SocialProof) + #Persuasion or #Marketing"}

## Voice rules
- Reference at least one specific Cialdini study, named experiment, or exact percentage
- No em-dashes. Active voice. Short declarative sentences. No hollow adjectives.
- Do not open any sentence with "I"
- Never use: "game-changing," "unlock," "secret," "hack," "skyrocket." Not in Cialdini's vocabulary.

Return JSON only — no preamble, no explanation:
{"body": "full post text with all line breaks exactly as it should appear on LinkedIn", "hook": "first line only", "principle": "${idea.theme ?? "Influence"}", "cta_text": "the CTA line only", "comment_prompt": "the question at the end only"${isB2B ? ', "dark_social_line": "the single most quotable/forwardable line — the one a VP would copy-paste into an email to their CFO"' : ""}}`
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL — owned channel, highest conversion
// ─────────────────────────────────────────────────────────────────────────────

// Key changes from v1:
// 1. Three subject line variants (A/B/C) with distinct emotional triggers — curiosity gap, stat-shock,
//    and reframe — so the best-performing line can be tested and the C variant reused for non-opener resends.
// 2. Preview text is now a question that completes the subject line's thought rather than restating it,
//    exploiting the information-gap effect that drives the extra 30% open-rate lift preheaders can deliver.
// 3. P.S. line added — the most-read section after the subject; used here to reinforce the CTA with
//    social proof (authority principle) for B2B or a curiosity teaser for B2C.
// 4. Reply hook added at the end of the body — asking a single low-friction question drives reply signals,
//    which Gmail/Yahoo now use as the strongest positive deliverability indicator.
// 5. B2B word count capped at 150–200 words (data shows diminishing CTR beyond 250 words for senior buyers);
//    B2C body teases the application exercise and gates the full version behind the CTA link rather than
//    giving it away, converting curiosity into clicks.
export function buildEmailPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"

  return `Write a marketing email for the Cialdini Institute on this idea:

**Idea:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme:** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}
**Audience:** ${isB2B ? "B2B — senior leaders at companies who could benefit from influence training" : "B2C — subscribers interested in the psychology of persuasion"}

## Subject lines — generate THREE variants (A/B/C)

Each variant must use a different emotional trigger. Pick from the following and do not repeat a trigger:
- **Curiosity gap:** Leave an information gap that can only be closed by opening. Under 45 chars. No question mark — a dangling statement works better. Example pattern: "[Thing they assume] isn't what drives [outcome]."
- **Stat-shock:** Lead with the most counterintuitive specific number from the research. Under 47 chars. Format: "[Specific number] [unexpected finding]."
- **Outcome reframe:** Name the outcome gap a senior leader or practitioner feels every week — the cost of NOT knowing this. Under 45 chars. No product mention.

Rules for all three: 30–50 chars, no ALL CAPS, no exclamation marks, no spam triggers (free, secret, hack, unlock, guaranteed, limited time), no em-dashes. Every word earns its place.

The C variant (reframe) should work equally well as a resend subject to non-openers 48 hours later.

## Preview text

Write ONE preview text, 70–85 chars. It must be a question that completes the thought started by the subject line — not a restatement of it. The question should create enough unresolved tension that the reader opens to resolve it. Do not answer the question in the preview text.

## Email structure
${isB2B ? `
**B2B format — target 150–200 words in the body (after greeting, before P.S.):**

- Opening (1 sentence): One research insight that quantifies the cost of NOT knowing this principle. Name the study or percentage. No pleasantries, no "I hope this finds you well."
- Body (2 short paragraphs max): Apply the ${idea.theme ?? "Influence"} principle to ONE business scenario the reader lives weekly — hiring calibration, negotiation framing, sales pipeline stall, culture change resistance. Name the scenario, show the principle in action, give one specific behaviour change.
- Transition: One sentence bridge to the CTA. Do not write "click here." Frame it as an invitation to bring this to their team.
- Tone: Executive peer writing to executive peer. Measured, precise, no vendor energy. Read like a Harvard Business Review paragraph, not a sales email.
- Word count: 150–200 words in the body. Every sentence must survive the cut: "Does this sentence make the executive more likely to act, or less?"

**P.S. line (B2B):** One sentence. Cite one named corporate client (Google, Microsoft, KPMG, Pfizer, NATO, Harvard Kennedy School) that uses this principle in their training. This is authority + social proof. Pattern: "P.S. [Client] used this exact principle to [specific outcome] — it's the foundation of the POP Workshop."
` : `
**B2C format — target 200–250 words in the body (after greeting, before P.S.):**

- Opening (1 sentence): The ${idea.hook_type ?? "stat-shock"} hook. Use it exactly as the hook instruction defines it. No "In today's email" — start mid-thought.
- Body paragraph 1: One principle, one named Cialdini study with a specific number, one real-world example (name the company, campaign, or scenario).
- Body paragraph 2: Tease the application exercise — describe WHAT the reader will be able to do and WHY it works, but do NOT give away the full exercise. Create just enough specificity that they feel the exercise is valuable and achievable, but they need to click to get the full version. End with: "Here's the exact exercise — and it takes less than 10 minutes."
- The full application exercise lives behind the CTA link, not in the email body.
- Tone: Engaged educator. Precise and warm. Like Cialdini himself wrote it.
- Word count: 200–250 words in the body. No filler, no transitions that exist to pad length.

**P.S. line (B2C):** One sentence that reactivates curiosity with a different angle — a secondary finding from the same research that makes them want to learn more. Pattern: "P.S. There's a counterintuitive finding from this same study that most people miss — it's on page [X] of Influence."
`}

## Reply hook

End the body (before the P.S.) with one low-friction question asking the reader to reply. The question must:
- Be answerable in one sentence
- Be directly connected to the email's principle and their real situation
- Not feel like a survey or a sales qualification
- B2B example pattern: "What's the highest-stakes conversation on your team's calendar this quarter?"
- B2C example pattern: "Which of the seven principles shows up most in your work — hit reply and tell me."

Replies are the strongest deliverability signal for Gmail and Yahoo — this question is structural, not optional.

## CTA to use
${audienceCTA(idea)}

Return JSON:
{
  "subject_a": "curiosity-gap variant, 30–50 chars",
  "subject_b": "stat-shock variant, 30–50 chars",
  "subject_c": "outcome-reframe variant, 30–50 chars (safe for non-opener resend)",
  "preview": "question preview text, 70–85 chars",
  "body": "full email body (plain text, use line breaks, ends with reply hook question)",
  "ps": "P.S. line, one sentence",
  "cta": "button text max 30 chars",
  "principle": "${idea.theme ?? "Influence"}"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOG — SEO authority, evergreen search traffic
// ─────────────────────────────────────────────────────────────────────────────

export function buildBlogPrompt(idea: Idea): string {
  return `Write an authoritative blog post for the Cialdini Institute on this idea:

**Idea:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme (principle):** ${idea.theme ?? "Influence"}
**Audience:** ${idea.audience === "b2b" ? "B2B — leaders and teams" : "B2C — individuals and practitioners"}

## Structure (follow exactly)
1. **Hook** (100 words) — Open with the ${idea.hook_type ?? "stat-shock"} approach. One research finding, one question it raises.
2. **The Science** (200 words) — Explain the ${idea.theme ?? "Influence"} principle. Name the study. Include the specific statistic. Cite Cialdini's research.
3. **Why It Works** (150 words) — The psychological mechanism. What's happening in the brain/decision process. Keep it precise, not pop-science.
4. **Real-World Example** (200 words) — One specific, named case: a company, a campaign, or a scenario. Apply the principle concretely.
5. **How to Apply It** (250 words) — Step-by-step instructions. Specific enough to implement this week. ${idea.audience === "b2b" ? "Business/team context." : "Individual/professional context."}
6. **The Ethical Line** (100 words) — Brief paragraph on ethical application — what distinguishes influence from manipulation in this context.
7. **Further Reading CTA** (50 words) — Natural close directing to INFLUENCE or Pre-Suasion as the full scientific source.

## SEO targets
Primary keyword: "Cialdini ${idea.theme ?? "influence"} principle" or "${idea.theme ?? "influence"} principle psychology"
Title: 55–65 chars, includes primary keyword

Return JSON:
{"seo_title": "...", "meta_description": "140–155 chars", "body": "full markdown article", "slug": "url-friendly-slug", "primary_keyword": "..."}`
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO SCRIPT — short-form vertical (Reels / Shorts / TikTok)
// ─────────────────────────────────────────────────────────────────────────────

export function buildVideoScriptPrompt(idea: Idea): string {
  return `Write a 60–90 second talking-head video script for the Cialdini Institute:

**Idea:** ${idea.title}
**Theme:** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}
**Audience:** ${idea.audience === "b2b" ? "Business professionals, leaders, sales teams" : "General professional audience, marketers, entrepreneurs"}

## Script structure
- **Hook (0–3 seconds):** ${hookInstruction(idea)} No intro. No "hey guys." No "welcome back." Start mid-thought.
- **The Study (3–20 seconds):** Name the specific Cialdini experiment. Give the exact number. "In one study..." or "Cialdini found that..."
- **Why It Matters (20–40 seconds):** Connect it to something the viewer experienced today — a sales call, a negotiation, an email they sent
- **The Flip (40–60 seconds):** Show them the ethical application. What does this look like when you use it intentionally?
- **CTA (60–75 seconds):** One action. Either follow for more OR get the book (link in bio).

## Script rules
- Written to be spoken aloud — use contractions, short sentences, natural pauses [pause]
- No jargon. A 14-year-old should understand the hook.
- The study must be named or attributed: "Cialdini's 1984 research", "a study of hotel guests", "Milgram's work on authority"
- Vertical format (9:16), TikTok/Reels/Shorts

Return JSON:
{"title": "video upload title", "script": "full spoken script with [pause] markers", "hook": "first 1–2 sentences only", "duration_estimate": "60s or 90s", "caption": "social caption with hashtags max 150 chars", "principle": "${idea.theme ?? "Influence"}"}`
}

// ─────────────────────────────────────────────────────────────────────────────
// TWITTER / X — quotable fragments, seeding virality
// ─────────────────────────────────────────────────────────────────────────────

export function buildTwitterPrompt(idea: Idea): string {
  return `Write a Twitter/X thread for the Cialdini Institute on this idea:

**Idea:** ${idea.title}
**Theme:** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}

## Thread rules
- 5 tweets
- Tweet 1 (hook): max 240 chars. ${hookInstruction(idea)} Must work as a standalone tweet — someone should want to share it even without reading the rest.
- Tweet 2: The specific study or experiment. Name it. Give the number.
- Tweet 3: Why most people get this wrong (the common mistake).
- Tweet 4: How to apply it correctly — one concrete action.
- Tweet 5: Close with a provocation or reframe that makes people think. End with: "Full breakdown in INFLUENCE by Robert Cialdini — [LINK]"

## Style rules
- No em-dashes. Short declarative sentences.
- Every tweet must be independently shareable — no "as I said above"
- Numbers beat adjectives. "23% more" beats "significantly more"
- Active voice. Present tense where possible.

Return JSON:
{"tweets": ["tweet1", "tweet2", "tweet3", "tweet4", "tweet5"], "hook": "tweet 1 text only"}`
}

// ─────────────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATION — re-engagement spike
// ─────────────────────────────────────────────────────────────────────────────

export function buildPushPrompt(idea: Idea): string {
  return `Write a push notification for the Cialdini Institute:

**Idea:** ${idea.title}
**Theme:** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}

## Rules
- Title: max 50 chars. Lead with the surprising fact or the principle name.
- Body: max 100 chars. Complete the hook — create enough curiosity to open, not enough to satisfy it.
- Do not use "!" or "🔥" — not on brand. Calm authority.
- This is a re-engagement notification, not a sales push.

Return JSON:
{"title": "...", "body": "..."}`
}

// ─────────────────────────────────────────────────────────────────────────────
// AD COPY — paid amplification of best-performing concepts
// ─────────────────────────────────────────────────────────────────────────────

export function buildAdCopyPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"

  return `Write paid ad copy for the Cialdini Institute on this idea:

**Idea:** ${idea.title}
**Theme:** ${idea.theme ?? "Influence"}
**Audience:** ${isB2B ? "B2B — LinkedIn ads targeting VPs, Directors, L&D leaders" : "B2C — Meta/Google ads targeting business readers, marketers, entrepreneurs"}
**Goal:** ${isB2B ? "Workshop/training inquiry or CMCT certification sign-up" : "Book purchase (Influence or Pre-Suasion)"}

## Ad requirements
- 3 variants (A/B/C)
- Variant A: stat-shock angle — lead with the most surprising research number
- Variant B: before-after angle — show the transformation
- Variant C: authority angle — lead with Cialdini's credentials and client roster
- Headline: max 30 chars (Google/Meta format)
- Description: max 90 chars — complete the thought the headline starts
- CTA: max 15 chars

Return JSON:
{"variants": [
  {"angle": "stat-shock",   "headline": "...", "description": "...", "cta": "..."},
  {"angle": "before-after", "headline": "...", "description": "...", "cta": "..."},
  {"angle": "authority",    "headline": "...", "description": "...", "cta": "..."}
]}`
}

// ─────────────────────────────────────────────────────────────────────────────
// PODCAST PITCH — earned media, highest-trust channel for book sales
// Target: 2 confirmed bookings/month via weekly outreach cadence
// Show sweet spot: 5K–50K listeners (realistic, not chasing Tim Ferriss)
// ─────────────────────────────────────────────────────────────────────────────

// Curated target shows — updated March 2026
// B2B (sales, leadership, L&D, negotiation, behavioral economics):
//   Sales Gravy (Jeb Blount) 50K+/ep | Negotiate Anything (Kwame Christian) 15M dl
//   Brainfluence (Roger Dooley) 50K | The Brutal Truth About Sales 15K-30K
//   Revenue Builders (John McMahon) 10K-25K | Advanced Selling Podcast 10K-20K
//   L&D In Action (TalentLMS) 5K-15K
// B2C (business psychology, personal dev, marketing):
//   Nudge (Phill Agnew) 20K-40K | Think Fast Talk Smart (Stanford GSB) 30K-60K
//   The Knowledge Project (Shane Parrish) 50K+ | Science of Success 10K-20K
//   Influential Personal Brand (Rory Vaden) 10K-20K | Earn Your Happy 15K-30K
//   The Squiggly Careers Podcast 20K-30K

const B2B_TARGET_SHOWS = `
PRIORITY TARGETS (pitch these first):

1. Negotiate Anything (Kwame Christian) — #1 negotiation podcast globally, ~15M downloads. Audience: lawyers, sales execs, ops leaders. Fit: Reciprocity, Commitment, Authority applied to deal-making.

2. Sales Gravy (Jeb Blount) — 29M+ total downloads, ~50K listeners/ep. Audience: frontline sales reps and VPs. Fit: Social Proof, Liking, Pre-Suasion in the sales cycle.

3. Brainfluence (Roger Dooley) — ~50K subscribers, behavioral economics focus. Host has interviewed Cialdini before — reference this directly. Fit: any principle with a surprising research angle.

4. The Brutal Truth About Sales (Brian Burns) — 15K-30K/ep, no-nonsense practitioners. Audience responds to data and contrarian angles. Fit: myth-busting pitches.

5. Revenue Builders Podcast (John McMahon) — 10K-25K/ep, enterprise sales and RevOps leaders. Fit: Authority and Pre-Suasion in complex B2B deals.

6. The Advanced Selling Podcast (Bill Caskey & Bryan Neale) — 10K-20K/ep, long-running, loyal audience of quota-carrying reps. Conversational format, good for storytelling pitches.

7. L&D In Action (TalentLMS) — 5K-15K/ep, L&D managers and CLOs. Fit: Cialdini CMCT certification angle and team influence training.`

const B2C_TARGET_SHOWS = `
PRIORITY TARGETS (pitch these first):

1. Nudge (Phill Agnew) — UK's #1 marketing podcast, 20K-40K listeners. Covers behavioral science behind decisions. Fit: any Cialdini principle with a marketing application.

2. Think Fast Talk Smart (Stanford GSB, Matt Abrahams) — 30K-60K/ep, MBA and professional audience. Research-heavy episodes. Fit: Pre-Suasion and communication science angles.

3. The Knowledge Project (Shane Parrish) — 50K+ listeners, mental models and decision-making. High-prestige. Pitch angle: "why smart people get influenced without knowing it."

4. Influential Personal Brand (Rory Vaden) — 10K-20K/ep, coaches, consultants, speakers building authority. Fit: Cialdini Authority and Social Proof principles directly applicable.

5. The Science of Success (Matt Bodnar) — 10K-20K/ep, research-backed self-improvement. Episodes always cite studies — matches Cialdini's voice perfectly.

6. Earn Your Happy (Lori Harder) — 15K-30K/ep, entrepreneurship and mindset. Fit: everyday persuasion for personal and business decisions.

7. The Squiggly Careers Podcast (Helen Tupper & Sarah Ellis) — 20K-30K/ep, UK professional development. Already had Cialdini on — follow-up angle: "what's changed since the 7th principle."`

export function buildPodcastPitchPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"
  const targetShows = isB2B ? B2B_TARGET_SHOWS : B2C_TARGET_SHOWS

  return `You are a senior podcast booking agent writing guest pitch emails for the Cialdini Institute.

**Idea:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme (Cialdini principle):** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "stat-shock"}
**Audience tier:** ${isB2B ? "B2B shows — sales, leadership, negotiation, L&D, behavioral economics" : "B2C shows — business psychology, personal development, marketing, entrepreneurship"}

## Target show list (choose 3 different shows — do NOT invent show names):
${targetShows}

## Generate 3 pitch emails — one per named show

### PERSONALIZATION HOOK (first 2 sentences — this is what gets the "yes")
- Name the show explicitly. Reference a SPECIFIC episode topic, guest, or recurring theme that proves you actually listen.
- Connect that observation directly to why THIS topic fits THEIR audience — not podcasts in general.

### PITCH BODY — 130–160 words total (hosts delete anything longer)
Structure:
1. Personalization hook (2 sentences)
2. Research angle: one surprising, specific finding from Cialdini's work. Lead with the stat or counterintuitive result — not "I'd love to discuss..."
3. Why this guest: ONE sentence maximum. The single most impressive credential for this show's audience.
4. Three episode-ready talking points as a short bulleted list inside the email body.
5. Credential close (1–2 sentences MAX): social proof + soft ask. Do NOT say "I'd love to be on your show." Name the proof of demand, then ask a question. Example: "Influence has 7M readers across 44 languages — we know this topic has a built-in audience. Would any of these angles fit what you're building right now?"

### TALKING POINTS — episode-ready, self-contained
Each point must be a complete insight that could stand as an episode title.
BAD: "We'll discuss reciprocity in sales"
GOOD: "Why sending a handwritten note before the pitch closes deals that decks never will — and the hospital study that proved it"

## Credential bank — ONE per pitch, woven in naturally, never all at once:
- Influence: 7M+ copies, 44 languages, in print since 1984 — proof of durable audience demand
- Research cited by Google, Microsoft, Harvard Kennedy School, NATO
- Robert Cialdini coined "pre-suasion" — the science of what happens before the ask
- The Cialdini Method is active in Fortune 500 sales and L&D programs globally
- Past appearances: The Knowledge Project, Hidden Brain, Think Fast Talk Smart

## Guest format signals to weave in:
- Brings one named experiment per talking point — the actual study name, not "research shows"
- Gives the host a moment of genuine surprise in the first 5 minutes
- Has a clear 7-principle framework that structures the conversation
- Leaves listeners with one executable action, not just an idea

## Subject line rules:
- Max 55 characters. No: "Guest pitch", "Collaboration", "Partnership", "Opportunity"
- Lead with the counterintuitive finding or the audience-specific benefit
- Examples: "The study that changed how Google hires" | "Why 'no' is often the easiest yes to reverse" | "What happens in the 30 seconds before the ask"

Return JSON:
{"pitches": [
  {
    "show_name": "exact show name from the target list",
    "show_audience_size": "estimated listener count",
    "subject": "max 55 char subject line",
    "body": "full 130–160 word pitch email including the bulleted talking points",
    "talking_points": [
      "self-contained insight 1 — specific enough to be an episode title",
      "self-contained insight 2",
      "self-contained insight 3"
    ],
    "personalization_note": "the specific episode/theme you referenced and why it connects"
  },
  { "show_name": "...", "show_audience_size": "...", "subject": "...", "body": "...", "talking_points": ["...", "...", "..."], "personalization_note": "..." },
  { "show_name": "...", "show_audience_size": "...", "subject": "...", "body": "...", "talking_points": ["...", "...", "..."], "personalization_note": "..." }
]}`
}

// ─────────────────────────────────────────────────────────────────────────────
// PODCAST FOLLOW-UP — 7-day nudge when no reply received
// Research: personalized follow-ups lift reply rate from ~8% to ~22%
// Rule: one follow-up only. No third email. Move on after 2 touches.
// ─────────────────────────────────────────────────────────────────────────────

export function buildPodcastFollowUpPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"

  return `You are a senior podcast booking agent writing a 7-day follow-up email for the Cialdini Institute.

**Original pitch idea:** ${idea.title}
**Theme:** ${idea.theme ?? "Influence"}
**Audience:** ${isB2B ? "B2B show host — sales, leadership, negotiation, L&D" : "B2C show host — business psychology, personal development, marketing"}

## Context
Follow-up to a cold pitch sent 7 days ago with no reply. This is the ONLY follow-up we send — no reply after this means we move on.

## Rules (strict):
- **Length: 40–60 words maximum.** Not a re-pitch. A gentle bump.
- **Do NOT restate the full pitch.** Reference it in one clause only.
- **Open with something NEW** — social proof, a new data point, or why the topic is timely right now.
- **No apology for following up.** Confident, not apologetic.
- **End with the softest possible ask**: "Still open if the timing's right" or a yes/no question answerable in 3 words.
- **Subject**: Use "Re:" prefix if replying to thread. Standalone: max 40 chars, tease the new element only.

## New social proof angles — pick the ONE most relevant for this show's audience:
- "Influence just crossed its 40th year in print — we know the topic has staying power."
- "Had a great episode drop on a comparable show last month — happy to send the link so you can hear the format."
- "The ${idea.theme ?? "influence"} angle we pitched is getting traction in the ${isB2B ? "sales training" : "personal development"} world right now — a few teams are actively using it in coaching."
- "${isB2B ? "CMCT certification demand is up 40% this quarter — L&D leaders are actively seeking this content." : "Book sales of Influence are up this quarter — the audience for this topic is clearly growing."}"

## Tone:
Peer-to-peer. Not a publicist chasing a placement. One breath, then done.

Return JSON:
{
  "subject": "Re: [original subject] or standalone max-40-char subject",
  "body": "40–60 word follow-up email — complete, ready to send",
  "new_hook_used": "which social proof angle you led with and why it fits this show"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// B2B CASE STUDY — results-first format designed to drive training inquiries
//
// Strategy: The highest-leverage missing content type for B2B inquiry generation.
// The 2025 Edelman-LinkedIn Thought Leadership report confirms 79% of hidden
// decision-makers are more likely to support proposals from vendors who publish
// strong thought leadership, and 71% say it outperforms conventional sales
// material. Case studies are the only format that simultaneously serve the
// L&D champion, the skeptical CFO, and the buying committee.
//
// Format: 350–450 words. Three acts: The Problem (cost of inaction), The
// Intervention (one Cialdini principle applied), The Result (specific number).
// Closes with a direct POP Workshop or CMCT inquiry CTA.
//
// Distribution: Email (primary), LinkedIn long-form article (secondary),
// Web landing page (tertiary for SEO). Only generated for B2B ideas.
// ─────────────────────────────────────────────────────────────────────────────

export function buildB2BCaseStudyPrompt(idea: Idea): string {
  return `You are a B2B content strategist writing for the Cialdini Institute — the world's authority on ethical persuasion science. Your only goal with this piece: move a Sales Director, L&D Leader, CMO, or HR Director to contact the Cialdini Institute about a POP Workshop or CMCT Certification.

Write a results case study in the following format. This is NOT a blog post. It is NOT a testimonial. It is a precise, results-first narrative that demonstrates what happens when a team applies one Cialdini principle to a specific business problem.

**Idea:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme (Cialdini principle):** ${idea.theme ?? "Influence"}
**Hook type:** ${idea.hook_type ?? "before-after"}

## CASE STUDY STRUCTURE (follow exactly — three acts)

### Act 1: THE PROBLEM (80–100 words)
- Open with the business situation: the role, the industry context, the challenge. Be specific enough to be credible.
- Name the cost of the status quo: a number, a rate, a frequency. "Their sales team was closing at 19%." "Three of five enterprise renewals in Q3 were coming in below target."
- Do NOT name a real client unless one is given in the rationale. Construct a plausible composite: "A 400-person SaaS company. A VP of Sales. A renewals team that had missed target for two consecutive quarters."
- End Act 1 with the moment of decision: they needed a different approach.

### Act 2: THE INTERVENTION (120–150 words)
- Name the Cialdini principle (${idea.theme ?? "Influence"}) explicitly. Do not be coy.
- Describe the specific, tactical application: what changed in the script, the email, the onboarding conversation, the negotiation, the manager behavior. Be granular enough that the reader can picture it.
- Reference the underlying science: cite the specific Cialdini study or experiment that validates this approach. Include the exact percentage or finding.
- Frame this as the output of a Cialdini Institute POP Workshop or CMCT-trained facilitator — not as something the team figured out on their own.

### Act 3: THE RESULT (80–100 words)
- Lead with the outcome number. Make it specific: not "improved significantly" but "close rate moved from 19% to 31% over two quarters."
- Include a secondary metric if available: revenue recovered, churn rate reduced, time-to-close shortened, NPS improved.
- Add one qualitative observation from the team (fabricated but plausible and in quotation marks): a Sales Director or L&D lead reflecting on what changed.
- Close with the implication: "One day. One principle. A result their leadership could take to the board."

### INQUIRY CTA (40–60 words)
- Name the product explicitly: POP Workshop or CMCT Certification (or both if relevant).
- State what the reader gets from a conversation: "A scoping call to map the ${idea.theme ?? "Influence"} principle to your team's specific sales motion." Not "learn more."
- Include: "Inquire at cialdini.com/training" or "CMCT details at cialdini.com/cmct"
- Tone: peer invitation, not sales pitch. The reader should feel like they are being offered access to something, not sold something.

## Voice and quality rules
- No hollow adjectives: "powerful," "transformative," "game-changing" are banned.
- Active voice throughout. Past tense for the case study narrative. Present tense for the CTA.
- Every claim in Act 2 must reference Cialdini's actual published research — name the study, the percentage, the experiment.
- The result number in Act 3 must be plausible and specific. Do not round to the nearest 5 or 10%.
- Total length: 350–450 words excluding the CTA block.

Return JSON only — no preamble:
{
  "headline": "Results-first headline, 60–80 chars. Format: '[Outcome number]: How [Role] Applied [Principle] to [Business Challenge]'",
  "subheadline": "One sentence framing who this is for and why it matters. Max 120 chars.",
  "body": "Full case study text — Act 1, Act 2, Act 3, then CTA — with double line breaks between acts",
  "act1_hook": "First sentence of Act 1 only — the one that names the problem in the most arresting way",
  "result_number": "The primary outcome metric from Act 3, standalone: e.g. '+12 percentage points on close rate'",
  "cta_text": "The inquiry CTA paragraph only",
  "principle": "${idea.theme ?? "Influence"}",
  "product_featured": "POP Workshop" | "CMCT Certification" | "Both"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANNEL CONTENT MAP — what gets generated per idea channel
// ─────────────────────────────────────────────────────────────────────────────

export const CHANNEL_CONTENT_MAP: Record<string, Array<{
  channel: string
  asset_type: string
  promptFn: (idea: Idea) => string
  traceName: string
  b2bOnly?: boolean
}>> = {
  Social: [
    { channel: "LinkedIn", asset_type: "post",          promptFn: buildLinkedInPrompt,        traceName: "content-linkedin" },
    { channel: "Video",    asset_type: "video",          promptFn: buildVideoScriptPrompt,     traceName: "content-video-script" },
    { channel: "Twitter",  asset_type: "thread",         promptFn: buildTwitterPrompt,         traceName: "content-twitter" },
    { channel: "Podcast",  asset_type: "podcast-pitch",  promptFn: buildPodcastPitchPrompt,    traceName: "content-podcast-pitch" },
  ],
  Email: [
    { channel: "Email",    asset_type: "email",          promptFn: buildEmailPrompt,           traceName: "content-email" },
    { channel: "LinkedIn", asset_type: "post",           promptFn: buildLinkedInPrompt,        traceName: "content-linkedin" },
    { channel: "Email",    asset_type: "lead-magnet",    promptFn: buildLeadMagnetPrompt,      traceName: "content-lead-magnet" },
    // B2B Email ideas also get a case study — the highest-converting B2B asset type
    { channel: "Blog",     asset_type: "case-study",     promptFn: buildB2BCaseStudyPrompt,    traceName: "content-b2b-case-study", b2bOnly: true },
  ],
  Web: [
    { channel: "Blog",     asset_type: "blog",           promptFn: buildBlogPrompt,            traceName: "content-blog" },
    { channel: "LinkedIn", asset_type: "post",           promptFn: buildLinkedInPrompt,        traceName: "content-linkedin" },
    { channel: "Podcast",  asset_type: "podcast-pitch",  promptFn: buildPodcastPitchPrompt,    traceName: "content-podcast-pitch" },
    // B2B Web ideas get a case study in addition to the blog — serves vendor-evaluation search intent
    { channel: "Blog",     asset_type: "case-study",     promptFn: buildB2BCaseStudyPrompt,    traceName: "content-b2b-case-study", b2bOnly: true },
  ],
  Paid: [
    { channel: "Ad",       asset_type: "ad",             promptFn: buildAdCopyPrompt,          traceName: "content-ad" },
    { channel: "Email",    asset_type: "email",          promptFn: buildEmailPrompt,           traceName: "content-email" },
  ],
  Push: [
    { channel: "Push",     asset_type: "push",           promptFn: buildPushPrompt,            traceName: "content-push" },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAD MAGNET — the missing email growth engine (Hormozi: $100M Leads)
//
// Strategy: The Cialdini Institute has zero gated content. Every CTA asks for
// $18–28 (book) or a $X/day training inquiry. That's asking cold audiences to
// pay before they've experienced value. Lead magnets fill the gap:
// "So good they feel stupid saying no."
//
// Types: cheat sheets, copy-paste templates, self-assessments, case study PDFs,
// 5-day mini-courses. Each one captures an email address and enters the
// subscriber into a nurture sequence toward book purchase (B2C) or training
// inquiry (B2B).
// ─────────────────────────────────────────────────────────────────────────────

export function buildLeadMagnetPrompt(idea: Idea): string {
  const isB2B = idea.audience === "b2b"

  return `You are a lead magnet designer for the Cialdini Institute. Your goal: create a free resource so valuable that people feel stupid NOT downloading it. This resource gates behind an email capture form.

**Idea:** ${idea.title}
**Rationale:** ${idea.rationale ?? ""}
**Theme (Cialdini principle):** ${idea.theme ?? "Influence"}
**Audience:** ${isB2B ? "B2B — Sales Directors, L&D Leaders, CMOs at 50+ person companies" : "B2C — Marketers, entrepreneurs, coaches, negotiators, business readers"}

## LEAD MAGNET FORMAT

Choose the format that best fits this idea from:

1. **Cheat Sheet / One-Pager** — The ${idea.theme ?? "Influence"} principle on one page: the study, the stat, the mechanism, and 3 copy-paste actions. Print-friendly. Pin-on-wall worthy.

2. **Copy-Paste Template** — 3 ready-to-use templates (email scripts, negotiation openers, sales messages) that apply ${idea.theme ?? "Influence"} directly. The reader uses one TODAY.

3. **Self-Assessment** — "Score Your ${idea.theme ?? "Influence"} Skills in 2 Minutes" — 8–10 questions that reveal a gap the reader didn't know they had. Creates urgency to learn more.

4. **Case Study PDF** (B2B only) — A 1-page results brief: the problem, the intervention (one Cialdini principle), the outcome number. Designed to be forwarded to a VP.

5. **5-Day Email Mini-Course** — One principle application per day for 5 days. Day 1: the science. Day 2: the mistake. Day 3: the fix. Day 4: the script. Day 5: the challenge. Each email standalone.

## REQUIREMENTS

- **Landing page headline**: max 65 characters. Must promise a specific, tangible outcome — not "learn about influence."
- **Landing page subheadline**: 1 sentence explaining what they get and how long it takes (e.g., "A one-page framework you can use in your next negotiation — takes 2 minutes to read").
- **3 bullet points** for the landing page: each names a specific thing they'll be able to DO after downloading. Start with a verb.
- **The actual lead magnet content**: Full text of the resource. If it's a cheat sheet, write the complete cheat sheet. If it's templates, write all 3 templates. If it's an assessment, write all questions + scoring rubric. If it's a mini-course, write all 5 email subjects + bodies.
- **Thank-you page CTA**: After download, what's the next step? ${isB2B ? "For B2B: 'See how Fortune 500 teams apply this → Schedule a scoping call'" : "For B2C: 'Get the full framework → Order Influence'"}
- **Email nurture hook**: One sentence teaser for the follow-up email sent 3 days after download. Creates curiosity about the NEXT principle.

## QUALITY BAR (Hormozi test)

Would someone pay $20 for this? If not, it's not good enough. The lead magnet must contain SPECIFIC, ACTIONABLE value — not a teaser of the book. Give away the "what" and "how" for ONE principle; the book provides the full framework.

## STORYBRAND STRUCTURE

The reader is the hero. The landing page copy must follow:
- Character: Name who this is for specifically (role, situation)
- Problem: The external symptom + internal frustration this resource solves
- Guide: Cialdini Institute as the authority (cite one credential)
- Plan: 3 steps — Download → Read → Apply today
- Success: What changes after they use this
- Failure: What stays the same if they don't

Return JSON only:
{
  "format": "cheat-sheet" | "template" | "assessment" | "case-study-pdf" | "mini-course",
  "landing_headline": "max 65 chars",
  "landing_subheadline": "one sentence",
  "landing_bullets": ["bullet 1 — starts with verb", "bullet 2", "bullet 3"],
  "lead_magnet_content": "the FULL text of the resource — complete, ready to design",
  "thank_you_cta": "next-step CTA for the thank-you page",
  "nurture_hook": "one sentence teaser for 3-day follow-up email",
  "estimated_value": "what someone would pay for this if it weren't free",
  "principle": "${idea.theme ?? "Influence"}"
}`
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT QUALITY SCORING — pre-publish gate
//
// Scores every content piece against 7 weighted criteria before it ships.
// Uses Cialdini's own principles + Ogilvy's specificity doctrine + StoryBrand
// alignment + awareness stage match.
//
// Grade A (85+) = auto-publish
// Grade B (70–84) = publish with minor edits
// Grade C (55–69) = rewrite needed
// Grade D/F (<55) = reject and regenerate
// ─────────────────────────────────────────────────────────────────────────────

export function buildContentScorePrompt(
  content: string,
  idea: Idea,
  assetType: string,
): string {
  const awarenessRule = AWARENESS_RULES[idea.awareness_stage as keyof typeof AWARENESS_RULES]

  return `You are a content quality assessor for the Cialdini Institute. Score the following content piece and return a structured quality report.

## CONTENT TO SCORE

**Asset type:** ${assetType}
**Idea title:** ${idea.title}
**Tagged audience:** ${idea.audience}
**Tagged awareness stage:** ${idea.awareness_stage} (${awarenessRule?.label ?? "Unknown"})
**Tagged theme:** ${idea.theme ?? "Influence"}

--- CONTENT START ---
${content}
--- CONTENT END ---

## AWARENESS STAGE RULES FOR THIS PIECE

${awarenessRule ? `Content rule: ${awarenessRule.contentRule}\nCTA rule: ${awarenessRule.ctaRule}${awarenessRule.banned.length > 0 ? `\nBANNED WORDS: ${awarenessRule.banned.join(", ")}` : ""}` : "No specific awareness rules found."}

${CONTENT_SCORE_CRITERIA}

Return the JSON scoring object only — no preamble.`
}
