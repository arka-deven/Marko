import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { SYSTEM_PROMPT, buildIdeaGenerationPrompt } from "@/lib/ai/prompts"
import { getThemeForWeek, getISOWeek } from "@/lib/ai/cialdini-brand"

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    // Rate-limit: one manual generation per minute
    const { data: recentIdea } = await auth.supabase
      .from("ideas")
      .select("id")
      .eq("workspace_id", auth.workspaceId)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .limit(1)
      .single()

    if (recentIdea) return apiError("Please wait before generating again", 429)

    // Parse optional overrides from request body
    let themeOverride: string | undefined
    let audienceFocus: "b2b" | "b2c" | "both" = "both"
    let marketingBrief: string | undefined
    let stageFilter: string | undefined
    try {
      const body = await request.json()
      if (body.theme && typeof body.theme === "string") themeOverride = body.theme
      if (body.audience && ["b2b", "b2c", "both"].includes(body.audience)) audienceFocus = body.audience
      if (body.brief && typeof body.brief === "string" && body.brief.trim().length > 0) marketingBrief = body.brief.trim()
      if (body.stage && typeof body.stage === "string") stageFilter = body.stage
    } catch { /* no body */ }

    const isoWeek = getISOWeek(new Date())
    const theme   = (themeOverride ?? getThemeForWeek(isoWeek)) as Parameters<typeof buildIdeaGenerationPrompt>[0]

    // Pull recent titles to avoid repeating angles
    const { data: recentIdeas } = await auth.supabase
      .from("ideas")
      .select("title")
      .eq("workspace_id", auth.workspaceId)
      .order("created_at", { ascending: false })
      .limit(30)

    const recentTitles = (recentIdeas ?? []).map(i => i.title)
    const prompt = buildIdeaGenerationPrompt(theme, recentTitles, {
      audienceFocus,
      marketingBrief,
      stageFilter,
    })

    const message = await tracedClaude("idea-generation", [{ role: "user", content: prompt }], {
      system: SYSTEM_PROMPT,
      workspaceId: auth.workspaceId,
      cacheSystem: true,
    })

    const textBlock = message.content.find(b => b.type === "text")
    if (!textBlock || textBlock.type !== "text") return apiError("No response from AI", 500)

    let ideas: Array<{
      title: string
      rationale: string
      channel: string
      expectedLift: string
      effort: string
      audience: "b2b" | "b2c"
      theme: string
      hookType: string
      awarenessStage?: string
      ladderPosition?: string
    }>

    try {
      const cleaned = textBlock.text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
      ideas = JSON.parse(cleaned)
      if (!Array.isArray(ideas)) throw new Error("Not an array")
    } catch {
      return apiError("Failed to parse AI response", 500)
    }

    const rows = ideas.map(idea => ({
      workspace_id:         auth.workspaceId,
      title:                idea.title,
      rationale:            idea.rationale,
      channel:              idea.channel,
      expected_lift:        idea.expectedLift,
      effort:               idea.effort,
      audience:             idea.audience        ?? "b2c",
      theme:                idea.theme           ?? theme,
      hook_type:            idea.hookType        ?? null,
      awareness_stage:      idea.awarenessStage  ?? "solution_aware",
      ladder_position:      idea.ladderPosition  ?? "top_of_funnel",
      status:               "ready" as const,
      ai_model:             message.model,
      ai_prompt_tokens:     message.usage.input_tokens,
      ai_completion_tokens: message.usage.output_tokens,
      created_by:           auth.userId,
    }))

    const { data: insertedIdeas, error: insertError } = await auth.supabase
      .from("ideas")
      .insert(rows)
      .select()

    if (insertError) return apiError("Failed to save ideas", 500)

    return NextResponse.json({ ideas: insertedIdeas, theme })
  } catch (err) {
    return handleApiError(err)
  }
}
