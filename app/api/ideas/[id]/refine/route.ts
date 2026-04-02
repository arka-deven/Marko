import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { tracedClaude } from "@/lib/ai/traced-claude"
import { getModel, getMaxTokens } from "@/lib/ai/config"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const tip = (body.tip ?? "").trim()
    if (!tip) return apiError("Tip is required", 400)

    // Fetch the current idea
    const { data: idea, error } = await auth.supabase
      .from("ideas")
      .select("*")
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .single()

    if (error || !idea) return apiError("Idea not found", 404)

    // Ask Claude to refine the idea based on the tip
    const model = getModel("idea-generation")
    const max_tokens = getMaxTokens("idea-generation")

    const result = await tracedClaude(
      "idea-refine",
      [
        {
          role: "user",
          content: `Here is the current idea:

Title: ${idea.title}
Rationale: ${idea.rationale ?? "none"}
Channel: ${idea.channel}
Audience: ${idea.audience}
Theme: ${idea.theme ?? "auto"}
Awareness Stage: ${idea.awareness_stage}
Expected Lift: ${idea.expected_lift ?? "unknown"}
Effort: ${idea.effort ?? "unknown"}
Hook Type: ${idea.hook_type ?? "unknown"}

User feedback: "${tip}"

Refine this idea based on the feedback. Keep the same channel and audience. Return JSON with these fields:
{
  "title": "refined title",
  "rationale": "refined rationale (1-2 sentences)",
  "theme": "Cialdini principle name",
  "awareness_stage": "one of: unaware, problem_aware, solution_aware, product_aware, most_aware",
  "expected_lift": "e.g. +15% engagement",
  "effort": "Low, Medium, or High",
  "hook_type": "one of: stat-shock, before-after, myth-bust, application, dark-side"
}`,
        },
      ],
      {
        model,
        max_tokens,
        system: `You are a marketing strategist for the Cialdini Institute. You refine content ideas based on user feedback. Return ONLY valid JSON matching the original idea structure — no markdown, no explanation.`,
        workspaceId: auth.workspaceId,
      }
    )

    // Parse the refined idea from Claude's response
    const text = result.content[0]?.type === "text" ? result.content[0].text : ""
    let refined: Record<string, string>
    try {
      // Extract JSON from response (handle possible markdown wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No JSON found")
      refined = JSON.parse(jsonMatch[0])
    } catch {
      return apiError("Failed to parse refined idea", 500)
    }

    // Update the idea in the database
    const { data: updated, error: updateError } = await auth.supabase
      .from("ideas")
      .update({
        title: refined.title ?? idea.title,
        rationale: refined.rationale ?? idea.rationale,
        theme: refined.theme ?? idea.theme,
        awareness_stage: refined.awareness_stage ?? idea.awareness_stage,
        expected_lift: refined.expected_lift ?? idea.expected_lift,
        effort: refined.effort ?? idea.effort,
        hook_type: refined.hook_type ?? idea.hook_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("workspace_id", auth.workspaceId)
      .select()
      .single()

    if (updateError || !updated) return apiError("Failed to update idea", 500)

    return NextResponse.json({ idea: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
