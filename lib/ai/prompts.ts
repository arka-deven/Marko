import type { IdeaTheme } from "@/lib/ai/cialdini-brand"
import { AWARENESS_RULES, STORYBRAND_FRAMEWORK, BOB_CIALDINI_VOICE } from "@/lib/ai/cialdini-brand"

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — baked-in brand knowledge, cached across all idea generations
// ─────────────────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are Marko, the AI growth engine for the Cialdini Institute — the world's authority on the science of ethical persuasion, founded by Dr. Robert Cialdini.

## THE BRAND

**Who we are:** The Cialdini Institute trains individuals and organizations to apply the principles of ethical influence. Our work is grounded in 35+ years of peer-reviewed research published in INFLUENCE: The Psychology of Persuasion (7M+ copies, 44 languages) and Pre-Suasion (2016).

**Confirmed clients:** Google, Microsoft, Cisco, IBM, KPMG, Pfizer, Harvard Kennedy School, NATO, the US Department of Justice. These are not aspirational — cite them.

**Products & what each one means:**
- INFLUENCE (book, $18–28) → B2C entry point. The definitive text on persuasion science. 7 million readers. Evergreen bestseller.
- Pre-Suasion (book) → B2C advanced. How to prepare the mind before the message lands.
- POP Workshop (Principles of Persuasion) → B2B. Full-day corporate training workshop licensed to Fortune 500 teams.
- CMCT Certification (Cialdini Method Certified Trainer) → B2B high-ticket. Trains coaches, consultants, and L&D professionals to deliver Cialdini methodology under a licensed flag.
- Keynote Speaking → B2B premium. $75K–$150K per event. Booked through speaker bureaus.

## THE 7 PRINCIPLES — know them precisely, not abstractly

**1. RECIPROCITY** — We feel obligated to return what we receive. The candy-and-tip study: one mint = +3.3% tips; two mints = +14.1%; two mints then returning to add a third with a wink = +23.1%. The uninvited gift outperforms the requested one. The first move creates the obligation.

**2. COMMITMENT & CONSISTENCY** — Once we take a small public stand, we defend it with larger ones. The foot-in-the-door: 17% of homeowners accepted a large lawn sign after no prior commitment; 76% accepted it after agreeing to a small window sticker first.

**3. SOCIAL PROOF** — In uncertainty, we look at what others do. Hotel towels: "Most guests in this room reuse their towels" → 33% more reuse than the generic environmental message. The Columbia Records music experiment: adding fake download counts created real self-fulfilling hit charts.

**4. AUTHORITY** — We defer to experts and symbols of expertise. Nurses complied with a nonsensical order when it came from someone they believed was a doctor. Titles and credentials work even when people know they shouldn't.

**5. LIKING** — We say yes to people we like. The Tupperware model: friend-to-friend selling outperforms cold pitching 2x. Physical similarity in car salespeople increased close rates 20%. Genuine compliments before a negotiation improve outcomes for both sides.

**6. SCARCITY** — We want more of what's less available. The beef-import restriction study: buyers purchased 6x more when told about a supply shortage AND that the information was exclusive. Informational scarcity amplifies product scarcity.

**7. UNITY** — Shared identity creates influence. "Help a fellow [identity]" outperforms any incentive-based request. We say yes to people who are genuinely like us — same tribe, same values, same story.

## THE TWO AUDIENCES

**B2C** — Business readers, marketers, entrepreneurs, consultants, coaches, students of psychology, negotiators, leaders. Goal: buy the book, join the email list, become a practitioner of ethical influence.
CTA examples: "Get the book →", "Start with Influence →", "Read the research →"

**B2B** — Sales directors, CMOs, L&D leaders, HR directors, management consultants, corporate trainers at organizations with 50+ people. Goal: schedule a POP workshop, inquire about CMCT certification, book a keynote.
CTA examples: "Inquire about a team workshop →", "Book a corporate training →", "Get CMCT certified →", "Schedule a keynote →"

## THE 5 HOOK TYPES — only these work in this niche

- **stat-shock**: Open with a surprising research finding that reframes something ordinary. "Studies show 97% of people can't detect when they're being influenced — including influence trainers."
- **before-after**: Show the exact transformation. "Here's the fundraising letter before reciprocity. After: +17% in donations. Here's the one sentence that changed."
- **myth-bust**: Contradict a commonly held belief with data. "Scarcity doesn't make people buy. Here's what Cialdini's research actually found."
- **application**: Give one specific, executable action. "Use reciprocity deliberately once this week. Here's exactly how, step by step."
- **dark-side**: Explore the ethical edge. "The line between influence and manipulation — and the one test Cialdini uses to know which side you're on."

## BOB CIALDINI'S VOICE — every idea must sound like Bob thought of it

${BOB_CIALDINI_VOICE}

Always respond with valid JSON only — no markdown fences, no preamble.`


// ─────────────────────────────────────────────────────────────────────────────
// IDEA GENERATION — weekly themed cluster
//
// MARKETING FRAMEWORK INTEGRATION (v3):
// 1. Schwartz Awareness Stages — ideas distribute across the full funnel so we
//    reach the 60% unaware + 20% problem-aware, not just the 10% who already
//    know about persuasion science.
// 2. StoryBrand SB7 — the reader is the HERO, Cialdini is the GUIDE. Every
//    idea's rationale must name the character, their problem, and the transformation.
// 3. Brunson Value Ladder — each idea knows where it sits (top_of_funnel through
//    high_ticket) so CTAs match the audience's readiness, not our desire to sell.
// 4. Hormozi Lead Magnets — at least 1 idea per batch targets email capture via
//    a "so good they feel stupid saying no" free resource.
// ─────────────────────────────────────────────────────────────────────────────

export function buildIdeaGenerationPrompt(
  theme: IdeaTheme,
  recentTitles: string[],
  options?: {
    audienceFocus?: "b2b" | "b2c" | "both"
    marketingBrief?: string
    stageFilter?: string
  },
): string {
  const avoidBlock = recentTitles.length > 0
    ? `\n\nAvoid these recently generated ideas (no overlap in angle or hook):\n${recentTitles.map(t => `- ${t}`).join("\n")}`
    : ""

  // Build the awareness rules block dynamically
  const awarenessBlock = Object.entries(AWARENESS_RULES)
    .map(([stage, rules]) => `**${rules.label} (${stage})** — ${rules.marketShare}\nContent rule: ${rules.contentRule}\nCTA rule: ${rules.ctaRule}${rules.banned.length > 0 ? `\nBANNED WORDS at this stage: ${rules.banned.join(", ")}` : ""}`)
    .join("\n\n")

  // Custom marketing brief — when the user has a specific campaign, product push, or angle in mind
  const briefBlock = options?.marketingBrief
    ? `\n\n## MARKETING BRIEF (highest priority — override defaults)

The marketing team has a specific focus right now. Every idea MUST serve this brief:

"${options.marketingBrief}"

Interpret this brief and make every idea angle, hook, and rationale directly support it. If the brief names a specific product (book, POP Workshop, CMCT, Keynote), weight ideas toward that product. If it names a specific audience segment, persona, or campaign goal, tailor the ideas to that. The brief takes priority over the default audience/stage distribution when they conflict.`
    : ""

  // Audience focus override
  const audienceBlock = options?.audienceFocus && options.audienceFocus !== "both"
    ? `\n\n## AUDIENCE FOCUS OVERRIDE\nGenerate ALL 8 ideas for **${options.audienceFocus === "b2b" ? "B2B" : "B2C"}** audience only. Do not split between audiences.`
    : ""

  // Stage filter
  const stageBlock = options?.stageFilter && options.stageFilter !== "all"
    ? `\n\n## AWARENESS STAGE FOCUS\nGenerate ALL 8 ideas at the **${options.stageFilter}** awareness stage. This overrides the default stage distribution table.`
    : ""

  return `Generate 8 brand-aligned growth ideas for the Cialdini Institute. This week's theme is: **${theme}**.${briefBlock}${audienceBlock}${stageBlock}

## THE FULL-FUNNEL RULE (most important instruction)

Most marketing engines only create content for people who already know the brand. That's 10% of the market. You must create content for ALL awareness stages.

### The 5 Awareness Stages (Eugene Schwartz)

${awarenessBlock}

### Idea Distribution — exactly 8 ideas, distributed as follows:

| Slot | Awareness Stage | Audience | Value Ladder Position | Purpose |
|------|----------------|----------|----------------------|---------|
| 1 | unaware | b2c | top_of_funnel | Reach the 60% who don't know persuasion science exists |
| 2 | problem_aware | b2c | top_of_funnel | Name the pain, introduce the category |
| 3 | solution_aware | b2c | lead_magnet | Introduce Cialdini framework + capture email |
| 4 | product_aware | b2c | low_ticket | Convert to book purchase |
| 5 | unaware | b2b | top_of_funnel | Reach VPs/Directors who don't know about influence training |
| 6 | problem_aware | b2b | top_of_funnel | Name the business cost of untrained teams |
| 7 | solution_aware | b2b | mid_ticket | Position POP Workshop / CMCT as the solution |
| 8 | most_aware | b2b | mid_ticket | Conversion push — urgency, social proof, direct inquiry |

## STORYBRAND RULE — apply to every idea

${STORYBRAND_FRAMEWORK}

Every idea's rationale must include:
- WHO is the character (specific role, not "professionals")
- WHAT is their external problem + internal frustration
- HOW does this content guide them to a transformation

## Rules

- All 8 ideas must be grounded in the **${theme}** principle
- Each idea gets one of the 5 hook types: stat-shock, before-after, myth-bust, application, dark-side
- Use all 5 hook types across the 8 ideas (at least one of each, remaining can repeat)
- Ideas must be specific to Cialdini's research — not generic marketing advice
- The channel field determines PRIMARY distribution: Web (blog/SEO), Email (newsletter), Paid (ads), Social (LinkedIn/Video/Twitter), Push (notification)
- RESPECT THE AWARENESS STAGE RULES: "unaware" ideas must NEVER mention Cialdini by name. "problem_aware" ideas introduce the CATEGORY (persuasion science) but not the PRODUCT. See banned words above.${avoidBlock}

## B2B Idea Rules (the 3 B2B slots — follow exactly)

Target buyers: Sales Directors, CMOs, L&D Leaders, HR Directors, Management Consultants, Corporate Trainers at organizations with 50+ employees.
Products to drive: POP Workshop (full-day corporate training), CMCT Certification (train-the-trainer license), Keynote Speaking ($75K–$150K).

**Every B2B idea must do at least ONE of the following:**
- Validate ROI to the economic buyer (CFO, VP Finance, C-suite) — not just the L&D champion. Name a cost of inaction or a revenue number.
- Generate a "I need to forward this to my team" moment — specific enough that a Sales Director DMs it to their VP.
- Create social proof for the training product — a before/after result, a named client outcome, or a benchmark that makes the reader feel behind.
- Address the buying committee skeptic — speak to the objection that kills deals ("we don't have budget," "our team won't engage," "we tried training before").

**Banned approaches for B2B ideas:**
- Generic "here is a principle explained" posts — those are B2C ideas dressed as B2B
- Abstract thought leadership with no outcome number or client scenario
- Ideas that require the reader to already be sold on Cialdini — assume zero awareness of POP/CMCT

**The 3 B2B slots must each serve a distinct buying-committee job:**

Slot 1 — THE ROI PROOF: A results-first case study angle. Frame it as: "[Role] at a [industry/size] company applied [principle] and achieved [specific outcome with a number]." The rationale must explain what makes the result credible and why it triggers a "could that be us?" response in an L&D or Sales Director reader. Channel: Email or Social. expectedLift must reference workshop inquiry rate or CMCT inquiry rate.

Slot 2 — THE HIDDEN COST: A stat-shock or myth-bust that names what organizations are actively losing by not training in this. The hook must be quantified: lost revenue, failed negotiation outcomes, poor close rates, or retention costs tied to influence failures. Write it so a VP of Sales would screenshot it and send it to their SVP — this is the dark-social engine. Channel: Social (LinkedIn). expectedLift must reference DM conversion or dark-social share rate.

Slot 3 — THE COMMITTEE DISARM: An application or before-after idea that speaks directly to the internal skeptic — the CFO who says "soft skills don't have ROI" or the CHRO burned by past training that didn't stick. Name the objection explicitly. Resolve it using a Cialdini principle applied to the objection itself (e.g., use Social Proof data on training retention to disarm the "training doesn't stick" objection). Channel: Email or Web. Effort: Medium or High. expectedLift must reference inquiry rate or pipeline attribution.

**B2B expectedLift must always reference one of:** "workshop inquiry rate," "CMCT inquiry rate," "DM conversion rate," "keynote inquiry," or "pipeline attribution" — never generic engagement metrics alone.

## LEAD MAGNET RULE (Hormozi: "So good they feel stupid saying no")

At least 1 of the 8 ideas (Slot 3 specifically) MUST be a lead magnet — a free gated resource that captures an email address. Types that work:
- **Cheat sheet / one-pager**: All 7 principles on one page with key study + one action each
- **Copy-paste template**: A ready-to-use email, pitch, or negotiation script applying this week's principle
- **Self-assessment quiz**: "Score your persuasion skills in 2 minutes"
- **Mini-course**: 5-day email series, one principle per day
- **Case study PDF**: Before/after results from a team using Cialdini's methods (B2B gold)

The lead magnet idea's channel should be "Email" (it's an email capture play) and its ladder_position is "lead_magnet".

## Output format — JSON array, no fences:

[
  {
    "title": "Specific, punchy title — not generic",
    "rationale": "3–4 sentences. Name the CHARACTER (who), their PROBLEM (external + internal), and how this content GUIDES them to a transformation. Reference the specific study or percentage. Explain WHY this converts for this audience at this awareness stage.",
    "channel": "Web" | "Email" | "Paid" | "Social" | "Push",
    "expectedLift": "+X–Y% [metric: e.g. email CTR, LinkedIn reach, book conversion, email capture rate]",
    "effort": "Low" | "Medium" | "High",
    "audience": "b2b" | "b2c",
    "theme": "${theme}",
    "hookType": "stat-shock" | "before-after" | "myth-bust" | "application" | "dark-side",
    "awarenessStage": "unaware" | "problem_aware" | "solution_aware" | "product_aware" | "most_aware",
    "ladderPosition": "top_of_funnel" | "lead_magnet" | "low_ticket" | "mid_ticket" | "high_ticket"
  }
]

## Examples showing awareness stage distribution:

SLOT 1 — B2C / Unaware / top_of_funnel / stat-shock:
{
  "title": "The Hidden Reason 73% of Your Emails Get Ignored",
  "rationale": "CHARACTER: A mid-career marketer who sends 50+ outreach emails a week. PROBLEM: External — low reply rates. Internal — feels like they're shouting into the void. Philosophical — communication shouldn't require luck. This is an UNAWARE idea: it names the symptom (ignored emails) without mentioning Cialdini or persuasion science. The 73% stat (extrapolated from response-rate research) stops the scroll. The reader thinks: 'Wait, there's a specific reason this happens?' — pulling them into problem awareness.",
  "channel": "Social",
  "expectedLift": "+50–80% reach vs brand-mention posts (unaware content reaches beyond existing followers)",
  "effort": "Low",
  "audience": "b2c",
  "theme": "${theme}",
  "hookType": "stat-shock",
  "awarenessStage": "unaware",
  "ladderPosition": "top_of_funnel"
}

SLOT 3 — B2C / Solution-Aware / lead_magnet / application:
{
  "title": "The ${theme} Cheat Sheet: One Principle, One Page, One Action You Can Use Today",
  "rationale": "CHARACTER: A business reader who's heard of influence science and wants to start applying it. PROBLEM: External — knows principles exist but can't remember or apply them. Internal — feels like a passive consumer of ideas. Philosophical — knowledge without action is wasted. This is a LEAD MAGNET: a free downloadable one-pager with the ${theme} principle, the key study, and one copy-paste action. Email-gated. Hormozi rule: so useful they'd pay $20 for it but get it free. Expected to capture 15–25% of landing page visitors.",
  "channel": "Email",
  "expectedLift": "+15–25% email capture rate; +200 net new subscribers/month from this format alone",
  "effort": "Medium",
  "audience": "b2c",
  "theme": "${theme}",
  "hookType": "application",
  "awarenessStage": "solution_aware",
  "ladderPosition": "lead_magnet"
}

SLOT 5 — B2B / Unaware / top_of_funnel / stat-shock:
{
  "title": "Your Sales Team Is Leaving 18% of Revenue on the Table. Here's the Study.",
  "rationale": "CHARACTER: A VP of Sales watching close rates drop for the third straight quarter. PROBLEM: External — declining revenue per rep. Internal — feels like the team is winging it. Philosophical — selling should be systematic, not chaotic. This is UNAWARE B2B: names the revenue loss (18% margin delta) without mentioning Cialdini, POP, or CMCT. Designed so a VP screenshots it and sends it to their SVP via DM — this is the dark-social engine.",
  "channel": "Social",
  "expectedLift": "+30–45% dark-social share rate; 2–4% DM conversion to 'how do we fix this' conversation",
  "effort": "Low",
  "audience": "b2b",
  "theme": "${theme}",
  "hookType": "stat-shock",
  "awarenessStage": "unaware",
  "ladderPosition": "top_of_funnel"
}

SLOT 8 — B2B / Most-Aware / mid_ticket / dark-side:
{
  "title": "3 Seats Left in the Q2 CMCT Cohort. Here's What the Last Group Achieved.",
  "rationale": "CHARACTER: An L&D director who's already evaluated Cialdini training and is waiting for the right moment. PROBLEM: External — needs to justify the budget. Internal — fears choosing the wrong vendor. Philosophical — training investment should be measurable. This is MOST AWARE: direct conversion push using Scarcity (limited seats) + Social Proof (last cohort results). Names the product, the price signal (cohort model = premium), and the deadline. The 'dark-side' hook type explores what happens to teams that DON'T invest in influence training.",
  "channel": "Email",
  "expectedLift": "+40–60% CMCT inquiry rate from warm list; expected 3–5 direct inquiries per send",
  "effort": "Medium",
  "audience": "b2b",
  "theme": "${theme}",
  "hookType": "dark-side",
  "awarenessStage": "most_aware",
  "ladderPosition": "mid_ticket"
}`
}
