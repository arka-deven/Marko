import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { SYSTEM_PROMPT, buildIdeaGenerationPrompt } from "@/lib/ai/prompts"

const IdeaSchema = z.object({
  title: z.string().min(3).max(200),
  rationale: z.string().min(10).max(500),
  channel: z.enum(["Web", "Email", "Paid", "Social", "Push"]),
  expectedLift: z.string(),
  effort: z.enum(["Low", "Medium", "High"]),
})

const GeneratedIdeasSchema = z.array(IdeaSchema).min(1).max(15)

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: recentIdea } = await auth.supabase
      .from("ideas")
      .select("id")
      .eq("workspace_id", auth.workspaceId)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .limit(1)
      .single()

    if (recentIdea) return apiError("Please wait before generating again", 429)

    const { data: experiments } = await auth.supabase
      .from("experiments")
      .select("name, channel, status")
      .eq("workspace_id", auth.workspaceId)
      .limit(50)

    let count = 5
    try {
      const body = await request.json()
      if (body.count && typeof body.count === "number") {
        count = Math.min(Math.max(body.count, 1), 10)
      }
    } catch {
      // No body or invalid JSON
    }

    const prompt = buildIdeaGenerationPrompt(experiments ?? [], count)

    const message = await tracedClaude("idea-generation", [{ role: "user", content: prompt }], {
      system: SYSTEM_PROMPT,
      workspaceId: auth.workspaceId,
    })

    const textBlock = message.content.find((b) => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return apiError("No response from AI", 500)
    }

    let parsed: z.infer<typeof GeneratedIdeasSchema>
    try {
      const raw = JSON.parse(textBlock.text)
      parsed = GeneratedIdeasSchema.parse(raw)
    } catch {
      return apiError("Failed to parse AI response", 500)
    }

    const ideaRows = parsed.map((idea) => ({
      workspace_id: auth.workspaceId,
      title: idea.title,
      rationale: idea.rationale,
      channel: idea.channel,
      expected_lift: idea.expectedLift,
      effort: idea.effort,
      status: "ready" as const,
      ai_model: message.model,
      ai_prompt_tokens: message.usage.input_tokens,
      ai_completion_tokens: message.usage.output_tokens,
      created_by: auth.userId,
    }))

    const { data: insertedIdeas, error: insertError } = await auth.supabase
      .from("ideas")
      .insert(ideaRows)
      .select()

    if (insertError) return apiError("Failed to save ideas", 500)

    return NextResponse.json({ ideas: insertedIdeas })
  } catch (err) {
    return handleApiError(err)
  }
}
