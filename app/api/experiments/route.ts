import { NextResponse } from "next/server"
import { z } from "zod"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { ExperimentCreateSchema } from "@/lib/api/validate"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const { data: experiments, error } = await auth.supabase
      .from("experiments")
      .select("*")
      .eq("workspace_id", auth.workspaceId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) return apiError("Failed to fetch experiments", 500)

    return NextResponse.json({ experiments })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    const body = await request.json()
    const parsed = ExperimentCreateSchema.parse(body)

    const { data: experiment, error } = await auth.supabase
      .from("experiments")
      .insert({
        workspace_id: auth.workspaceId,
        name: parsed.name,
        description: parsed.description ?? null,
        channel: parsed.channel,
        status: "draft",
        idea_id: parsed.idea_id ?? null,
        created_by: auth.userId,
      })
      .select()
      .single()

    if (error) return apiError("Failed to create experiment", 500)

    return NextResponse.json({ experiment }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return apiError("Invalid input", 400)
    return handleApiError(err)
  }
}
