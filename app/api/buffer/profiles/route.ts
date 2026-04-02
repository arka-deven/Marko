import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { getBufferClient, isBufferConfigured, bufferServiceToChannel } from "@/lib/buffer/client"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    if (!isBufferConfigured()) {
      return apiError("Buffer not configured. Add BUFFER_ACCESS_TOKEN to environment.", 503)
    }

    const client = getBufferClient()!
    const profiles = await client.getProfiles()

    // Map to a simpler format for the frontend
    const mapped = profiles.map((p) => ({
      id: p.id,
      service: p.service,
      channel: bufferServiceToChannel(p.service),
      username: p.formatted_username || p.service_username,
      type: p.service_type,
      avatar: p.avatar_https,
      default: p.default,
    }))

    return NextResponse.json({ profiles: mapped })
  } catch (err) {
    return handleApiError(err)
  }
}
