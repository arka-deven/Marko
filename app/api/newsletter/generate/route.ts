import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { NEWSLETTER_SYSTEM_PROMPT, buildNewsletterPrompt } from "@/lib/ai/newsletter-prompt"
import { getThemeForWeek, getISOWeek, type AwarenessStage, AWARENESS_STAGES } from "@/lib/ai/cialdini-brand"
import { queryClone, isDelphiConfigured } from "@/lib/delphi/client"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json().catch(() => ({}))
    const isoWeek = getISOWeek(new Date())
    const theme = body.theme ?? getThemeForWeek(isoWeek)
    const awarenessStage: AwarenessStage = AWARENESS_STAGES.includes(body.awarenessStage)
      ? body.awarenessStage
      : "solution_aware"

    // Step 1: Query Delphi for personality sample (optional, graceful fallback)
    let delphiPersonality: string | null = null
    let delphiUsed = false

    if (isDelphiConfigured() && !body.customDirection) {
      try {
        delphiPersonality = await queryClone(
          `Bob, tell me about a time you saw ${theme} play out in a way that surprised you. How would you explain this to someone who has never heard of it? What story comes to mind?`
        )
        delphiUsed = true
        logger.info({ theme }, "[newsletter] Delphi personality sample retrieved")
      } catch (err) {
        logger.warn({ err, theme }, "[newsletter] Delphi call failed, using fallback voice profile")
      }
    }

    // Step 2: Generate newsletter via Claude
    const userPrompt = buildNewsletterPrompt({
      theme,
      delphiPersonality,
      awarenessStage,
      customDirection: body.customDirection,
    })

    const response = await tracedClaude("content-newsletter", [
      { role: "user", content: userPrompt },
    ], {
      system: NEWSLETTER_SYSTEM_PROMPT,
      cacheSystem: true,
      workspaceId: auth.workspaceId,
    })

    // Step 3: Parse JSON from Claude response
    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    const newsletter = JSON.parse(cleaned)

    return NextResponse.json({
      ...newsletter,
      theme,
      awarenessStage,
      delphiUsed,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
