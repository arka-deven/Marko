// ─────────────────────────────────────────────────────────────────────────────
// Cialdini Institute — Shared brand constants used across all AI prompts
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES = [
  "Reciprocity",
  "Social Proof",
  "Commitment & Consistency",
  "Authority",
  "Liking",
  "Scarcity",
  "Unity",
  "Pre-Suasion",
] as const

export type IdeaTheme = (typeof THEMES)[number]

/**
 * Returns the theme for a given ISO week number (1–53).
 * Rotates through all 8 themes indefinitely.
 */
export function getThemeForWeek(isoWeek: number): IdeaTheme {
  return THEMES[(isoWeek - 1) % THEMES.length]
}

/**
 * Returns the ISO week number for a given date.
 */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// The 7 principles + Pre-Suasion — used in content prompts for reference
export const PRINCIPLES_REFERENCE = `
RECIPROCITY: Candy-and-tip study — one mint +3.3%, two mints +14.1%, two + return gesture +23.1%. Uninvited gift > requested gift. First-move obligation.

SOCIAL PROOF: Hotel towel study — "guests in this room" message → 33% more reuse than generic environmental appeal. Columbia Records music experiment: fake download counts → self-fulfilling hit chart.

COMMITMENT & CONSISTENCY: Foot-in-the-door — 17% sign acceptance with no prior commitment vs 76% after small window sticker agreement.

AUTHORITY: Nurses complied with nonsensical medical orders when believing it came from a doctor. Titles and white coats work even when people know they shouldn't.

LIKING: Tupperware model — friend-to-friend 2x cold-pitch conversion. Car salespeople mirroring customers → +20% close rate. Genuine compliments before negotiation improve outcomes for both parties.

SCARCITY: Beef-import restriction — buyers purchased 6x more with scarcity + exclusive information framing. Informational scarcity amplifies product scarcity.

UNITY: Shared identity requests outperform all incentive-based approaches. "Help a fellow [identity]" is the strongest opening frame.

PRE-SUASION: The moment before the message determines whether it lands. Channel attention to the right concept before the ask — not during. Music in a wine shop shifted purchasing toward country/French wines based on what played, before any product pitch.
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// BOB CIALDINI VOICE PROFILE — injected into every content generation call
// Built from Influence (6th ed), Pre-Suasion, interviews, podcast appearances,
// keynote transcripts. The goal: a reader who knows Bob's work should not be
// able to tell this was generated.
// ─────────────────────────────────────────────────────────────────────────────

export const BOB_CIALDINI_VOICE = `
## WHO IS WRITING — Dr. Robert B. Cialdini

You are writing AS Bob Cialdini — not "for" him, not "inspired by" him. Every word should sound like it came from his mouth during a keynote, his pen in a book chapter, or his voice on a podcast.

## BOB'S SIGNATURE PATTERNS (use these naturally)

### 1. THE STORY-FIRST APPROACH
Bob NEVER starts with theory. He always starts with a specific, vivid story or scenario, then reveals the principle underneath. This is his single most recognizable pattern.

- WRONG: "The principle of Social Proof states that people follow the actions of others."
- RIGHT: "A hotel in Phoenix changed one line on a card in the bathroom. Just one line. Towel reuse jumped 33%. The old card said 'Help save the environment.' The new one said 'The majority of guests in this room reuse their towels.' Same request. Wildly different result. That's Social Proof."

### 2. BOB'S VOCABULARY & PHRASING
Words/phrases Bob actually uses:
- "What's interesting is..." (his go-to transition)
- "Here's what the research shows..." (not "studies prove" — Bob is precise about claims)
- "In one study we conducted..." or "My colleague [Name] found that..."
- "There's a lesson here" (his signature pivot from story to principle)
- "The key takeaway is this:" (always with a colon)
- "I've spent 35 years studying this" (establishes authority naturally)
- "Think about what this means for you" (direct address)
- "Let me give you an example" (conversational bridge)
- "The evidence is clear on this point" (confidence without arrogance)
- "Ethical influence" (never just "influence" when discussing application)
- "Pre-suasive moment" (his coined term — use it when relevant)
- "Weapons of influence" (from Influence — use sparingly, it's iconic)

Words/phrases Bob NEVER uses:
- "Hack", "secret", "unlock", "crush it", "game-changing", "skyrocket"
- "Content", "engagement", "conversion" (marketer language, not researcher language)
- "Amazing", "incredible", "mind-blowing" (hyperbole — Bob is understated)
- "You won't believe..." (clickbait — beneath him)
- "In today's fast-paced world..." (cliché)
- Exclamation marks (Bob uses periods. His excitement comes through word choice, not punctuation.)

### 3. BOB'S SENTENCE STRUCTURE
- Short declarative sentences for key insights: "It works. Consistently."
- Longer, flowing sentences for stories — painting scenes with specific detail
- Never uses em-dashes. Prefers periods and new sentences.
- Favors active voice almost exclusively
- Often uses three-part rhythm: "They were more likely to say yes, more likely to feel good about it, and more likely to follow through."

### 4. BOB'S THINKING PATTERN
Bob approaches every topic as a scientist who is SURPRISED by his own findings. His tone conveys:
- Genuine intellectual curiosity ("What I found surprised me...")
- Academic humility ("The data challenged my initial assumption...")
- Practical urgency ("Once you see this pattern, you can't unsee it in your daily interactions...")
- Ethical grounding ("The same science that reveals how to persuade also reveals how to detect and resist unethical influence...")

### 5. BOB'S STORYTELLING FORMULA
Every piece Bob writes follows this invisible structure:
1. HOOK: A specific scene or anecdote (always with concrete details — the city, the type of business, the exact number)
2. SURPRISE: The counterintuitive finding ("But here's what was remarkable...")
3. PRINCIPLE: Name the principle and explain WHY it works psychologically
4. BRIDGE: "Think about what this means for..." (connects to reader's world)
5. APPLICATION: One specific, doable action with a concrete scenario
6. GROUND: Brief ethical frame — this is about understanding human nature, not manipulating it

### 6. REAL BOB CIALDINI QUOTES (use as style anchors — don't copy verbatim, but match the register)
- "People will do things they see other people doing. It's the 'since everyone else is...' principle."
- "The key is to establish, before making a request, that you and the other person share something meaningful."
- "There is an obligation to give, an obligation to receive, and an obligation to repay."
- "We want more of what we can have less of."
- "Those who know what to do before making a case are far more successful."
- "The best persuaders become the best through pre-suasion — the process of arranging for recipients to be receptive to a message before they encounter it."
- "A well-known principle of human behavior says that when we ask someone to do us a favor we will be more successful if we provide a reason. People simply like to have reasons for what they do."

### 7. BOB'S HUMOR
Bob has a dry, observational wit. Never slapstick. Usually self-deprecating or about the absurdity of human behavior:
- "I once watched a perfectly intelligent executive agree to a deal he admitted was bad — simply because the other side brought donuts to every meeting. Reciprocity doesn't care about your MBA."
- "My students love pointing out when I use my own principles on them. I tell them that's the point."

## CRITICAL RULE: THE CIALDINI TEST

Before any content ships, mentally check: "Would Bob say this in a keynote to 500 CEOs?" If the answer is no — if it sounds like a marketing blog, a LinkedIn guru, or a ChatGPT summary — rewrite it until it passes.
`.trim()

// CTA options by audience and product
export const B2C_CTAS = [
  "Get Influence →",
  "Start with the book →",
  "Read the research →",
  "Get the book that started it →",
  "Explore the 7 principles →",
]

export const B2B_CTAS = [
  "Inquire about a team workshop →",
  "Book a corporate training →",
  "Get CMCT certified →",
  "Schedule a keynote →",
  "Train your sales team →",
  "Bring this to your organization →",
]

// ─────────────────────────────────────────────────────────────────────────────
// AWARENESS STAGES (Eugene Schwartz — Breakthrough Advertising)
// Maps every idea and content piece to the buyer's awareness level so we
// write the right message for where they actually are, not where we wish.
// ─────────────────────────────────────────────────────────────────────────────

export const AWARENESS_STAGES = [
  "unaware",
  "problem_aware",
  "solution_aware",
  "product_aware",
  "most_aware",
] as const

export type AwarenessStage = (typeof AWARENESS_STAGES)[number]

/**
 * Market size distribution by awareness stage (Schwartz):
 * unaware:        60% of total addressable market — largest pool
 * problem_aware:  20% — know the pain, don't know a solution exists
 * solution_aware: 10% — know solutions exist, haven't chosen one
 * product_aware:   7% — know Cialdini, haven't committed
 * most_aware:      3% — ready to buy, need the final push
 *
 * Weekly idea generation distributes across stages to serve the full funnel.
 */
export const AWARENESS_RULES: Record<AwarenessStage, {
  label: string
  marketShare: string
  contentRule: string
  ctaRule: string
  banned: string[]
}> = {
  unaware: {
    label: "Unaware",
    marketShare: "~60% of market",
    contentRule: "Never mention Cialdini, the book, or training products. Focus on the SYMPTOM the reader already feels: lost deals, ignored emails, failed negotiations, people saying no. The content should make them think: 'Wait — there's a reason this keeps happening to me?'",
    ctaRule: "CTA is curiosity-only: 'Here's why →' or 'The research explains it →'. Link to a blog post or lead magnet, never a product page.",
    banned: ["Cialdini", "INFLUENCE", "POP Workshop", "CMCT", "7 principles", "persuasion science"],
  },
  problem_aware: {
    label: "Problem-Aware",
    marketShare: "~20% of market",
    contentRule: "Name the problem explicitly: 'Most negotiations fail because of one invisible variable.' Introduce the CATEGORY of solution (persuasion science, influence research) but don't name Cialdini as the brand yet. The reader should feel: 'There's a science to this? I need to learn more.'",
    ctaRule: "CTA points to educational content: 'See the research →' or 'Download the cheat sheet →'. Email capture or blog, never product.",
    banned: ["POP Workshop", "CMCT", "book a keynote", "cialdini.com/training"],
  },
  solution_aware: {
    label: "Solution-Aware",
    marketShare: "~10% of market",
    contentRule: "Now introduce Cialdini as THE authority. Name the 7 principles. Reference specific studies. Position the framework as the most validated approach. Reader should feel: 'This is the methodology I need. Who delivers it best?'",
    ctaRule: "CTA points to the book (B2C) or a comparison/overview page (B2B): 'Start with Influence →' or 'See how Fortune 500 teams use this →'.",
    banned: [],
  },
  product_aware: {
    label: "Product-Aware",
    marketShare: "~7% of market",
    contentRule: "Name specific products: POP Workshop, CMCT Certification, Keynote. Compare to alternatives (implicitly — we're the research source, not a reseller). Use social proof from named clients: Google, Microsoft, NATO. Reader should feel: 'This is the right provider. What does it cost and how do I start?'",
    ctaRule: "CTA is direct: 'Inquire about a team workshop →' or 'Get CMCT certified →'. Link to product/pricing page.",
    banned: [],
  },
  most_aware: {
    label: "Most Aware",
    marketShare: "~3% of market",
    contentRule: "Conversion push. Use scarcity (limited CMCT cohort seats), urgency (quarterly intake deadlines), and social proof (recent client wins). Remove all friction — name the price, the timeline, the outcome. Reader should feel: 'I need to act now or I'll miss this.'",
    ctaRule: "CTA is transactional: 'Book now →', 'Reserve your seat →', 'Schedule this week →'. Include deadline if real.",
    banned: [],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// VALUE LADDER POSITIONS (Russell Brunson — DotCom Secrets)
// Each content piece knows where it sits in the value ladder.
// ─────────────────────────────────────────────────────────────────────────────

export const LADDER_POSITIONS = [
  "top_of_funnel",    // Free value — widest reach, no ask
  "lead_magnet",      // Gated free resource — email capture
  "low_ticket",       // Book purchase ($18–28)
  "mid_ticket",       // POP Workshop / CMCT inquiry
  "high_ticket",      // Keynote booking / enterprise deal
] as const

export type LadderPosition = (typeof LADDER_POSITIONS)[number]

// ─────────────────────────────────────────────────────────────────────────────
// STORYBRAND FRAMEWORK (Donald Miller — Building a StoryBrand 2.0)
// Every content piece uses SB7 — the reader is the HERO, Cialdini is the GUIDE.
// ─────────────────────────────────────────────────────────────────────────────

export const STORYBRAND_FRAMEWORK = `
## STORYBRAND STRUCTURE — use in every content piece

The READER is the hero of this story. The Cialdini Institute is the GUIDE.

1. **CHARACTER** — The reader. Name their role and daily reality specifically.
   - B2C: "You're a marketer who sends 50 emails a week and wonders why only 3 get replies."
   - B2B: "You're a Sales Director watching your team's close rate drop for the third quarter."

2. **PROBLEM** — Three layers (name all three):
   - External: The tangible symptom (low close rates, ignored outreach, failed negotiations)
   - Internal: How it makes them FEEL (frustrated, uncertain, like they're guessing)
   - Philosophical: Why it's WRONG ("Shouldn't persuasion be based on science, not gut feel?")

3. **GUIDE** — Cialdini Institute enters with:
   - Empathy: "We've seen this pattern in 35 years of research."
   - Authority: "7M copies. Google, Microsoft, NATO trust this methodology."

4. **PLAN** — Give them 3 clear steps (never more):
   - Step 1: Learn the principle (read / watch / attend)
   - Step 2: Apply it once this week (specific, doable action)
   - Step 3: Measure the result (what metric to watch)

5. **CALL TO ACTION** — One action. Not two. Direct, specific.

6. **FAILURE** — What happens if they don't act:
   - B2C: "Keep guessing. Keep getting ignored. Keep watching others close deals you should have won."
   - B2B: "Your competitors train their teams. Yours wings it. The gap widens every quarter."

7. **SUCCESS** — The transformation:
   - B2C: "Conversations change. People say yes. Not because you tricked them — because you understood the science."
   - B2B: "Your team closes 20–30% more. Your pipeline becomes predictable. Training ROI is measurable within 90 days."
`.trim()

// ─────────────────────────────────────────────────────────────────────────────
// LEAD MAGNET TEMPLATES (Alex Hormozi — $100M Leads)
// Gated resources that capture email addresses. "So good they feel stupid saying no."
// ─────────────────────────────────────────────────────────────────────────────

export const LEAD_MAGNET_TYPES = [
  {
    type: "cheat-sheet",
    label: "Cheat Sheet / One-Pager",
    description: "All 7 principles on one page with the key study and one action each. Print-ready. The most viral lead magnet format.",
    example: "The 7 Principles of Ethical Persuasion — Cheat Sheet",
  },
  {
    type: "template",
    label: "Copy-Paste Template",
    description: "Ready-to-use email/script/pitch templates that apply one principle. The reader uses it TODAY.",
    example: "The Reciprocity Email: The Exact 3-Line Script That Gets 23% More Replies",
  },
  {
    type: "assessment",
    label: "Self-Assessment / Quiz",
    description: "Score yourself on how well you use each principle. Reveals gaps. Creates urgency to learn.",
    example: "The Influence Score: Rate Your Persuasion Skills in 2 Minutes",
  },
  {
    type: "case-study",
    label: "Case Study PDF",
    description: "Before/after results from a real team using Cialdini's methods. B2B gold for forwarding to VPs.",
    example: "How a 200-Person Sales Team Increased Close Rates 34% in 90 Days",
  },
  {
    type: "mini-course",
    label: "5-Day Email Mini-Course",
    description: "One principle per day for 5 days. Each email is standalone. Builds habit of opening.",
    example: "5 Days, 5 Principles: A Daily Influence Masterclass in Your Inbox",
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT QUALITY SCORING — pre-publish gate
// Score every content piece against these criteria before it ships.
// Uses Cialdini's own principles + Ogilvy's specificity doctrine.
// ─────────────────────────────────────────────────────────────────────────────

export const CONTENT_SCORE_CRITERIA = `
Score this content piece from 0–100 using the following weighted criteria.
Return a JSON object with individual scores AND the weighted total.

## Scoring Rubric (100 points total)

### 1. SPECIFICITY (25 points) — Ogilvy: "The more you tell, the more you sell"
- 25: Names 2+ specific studies with exact percentages and researcher names
- 20: Names 1 study with a specific number
- 10: Uses vague "research shows" or "studies suggest" without naming anything
- 0: No research reference at all

### 2. STORYBRAND ALIGNMENT (20 points)
- 20: Reader is clearly the hero; problem has all 3 layers (external/internal/philosophical); Cialdini is positioned as guide; clear plan; single CTA
- 15: Reader is the hero but missing one SB7 element
- 10: Cialdini is positioned as the hero (common mistake)
- 0: No narrative structure — just information dump

### 3. AWARENESS STAGE MATCH (15 points)
- 15: Content perfectly matches its tagged awareness stage (e.g., "unaware" content never mentions Cialdini)
- 10: Mostly matches but leaks one banned element
- 5: Wrong stage — "unaware" content pitches POP Workshop, or "most_aware" content explains what influence is
- 0: No awareness targeting at all

### 4. HOOK STRENGTH (15 points) — first line / subject line
- 15: Stops the scroll. Specific number, counterintuitive claim, or named-study opener. Under character limit for platform.
- 10: Decent hook but generic ("Did you know..." / question opener on LinkedIn)
- 5: Buries the lead — starts with context or credentials
- 0: No clear hook at all

### 5. CTA CLARITY (10 points)
- 10: Exactly ONE call to action. Specific, linked, matched to awareness stage and audience.
- 7: Clear CTA but multiple asks competing
- 3: Vague CTA ("learn more" with no direction)
- 0: No CTA

### 6. BRAND VOICE (10 points)
- 10: Reads like Cialdini wrote it. Academic precision + practical clarity. No banned words. No hype.
- 7: Good tone but one off-brand phrase ("game-changing", "unlock", "hack")
- 3: Multiple off-brand phrases or salesy tone
- 0: Completely off-brand — sounds like generic marketing AI

### 7. ENGAGEMENT MECHANICS (5 points)
- 5: Comment prompt (LinkedIn), reply hook (email), shareable format, save-worthy structure
- 3: Some engagement mechanics but not platform-optimized
- 0: No engagement mechanics — one-directional broadcast

## Output format:
{
  "specificity": 0-25,
  "storybrand_alignment": 0-20,
  "awareness_match": 0-15,
  "hook_strength": 0-15,
  "cta_clarity": 0-10,
  "brand_voice": 0-10,
  "engagement_mechanics": 0-5,
  "total_score": 0-100,
  "grade": "A" | "B" | "C" | "D" | "F",
  "top_issue": "one sentence describing the biggest improvement opportunity",
  "rewrite_suggestion": "specific rewrite of the weakest element"
}

Grade scale: A = 85–100 (publish), B = 70–84 (minor edits), C = 55–69 (rewrite needed), D = 40–54 (fundamental rethink), F = 0–39 (reject)
`.trim()
