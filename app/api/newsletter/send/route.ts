import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { getBeehiivClient, isBeehiivConfigured } from "@/lib/beehiiv/client"

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    if (!isBeehiivConfigured()) {
      return apiError("Beehiiv not configured. Add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID.", 503)
    }

    const body = await request.json()
    const { subject, preview_text, body_html } = body

    if (!subject || !body_html) {
      return apiError("subject and body_html are required", 400)
    }

    const client = getBeehiivClient()!
    const pubId = process.env.BEEHIIV_PUBLICATION_ID!

    const response = await client.posts.create(pubId, {
      title: subject,
      body_content: body_html,
      email_settings: {
        email_subject_line: subject,
        email_preview_text: preview_text ?? undefined,
      },
    })

    return NextResponse.json({
      success: true,
      postId: response.data?.id ?? null,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
