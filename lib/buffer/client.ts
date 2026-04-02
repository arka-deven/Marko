import { logger } from "@/lib/logger"

const BUFFER_API = "https://api.bufferapp.com/1"
const ACCESS_TOKEN = process.env.BUFFER_ACCESS_TOKEN

interface BufferProfile {
  id: string
  service: string            // "linkedin", "twitter", "facebook", "instagram"
  service_username: string
  service_type: string       // "profile", "page", "group"
  formatted_username: string
  avatar_https: string
  default: boolean
}

interface BufferUpdate {
  id: string
  created_at: number
  text: string
  profile_id: string
  status: string           // "buffer" (queued), "sent", "error"
  sent_at?: number
  statistics?: {
    clicks?: number
    favorites?: number
    likes?: number
    mentions?: number
    retweets?: number
    reshares?: number
    comments?: number
    reach?: number
  }
  media?: {
    link?: string
    photo?: string
    thumbnail?: string
  }
}

interface BufferCreateParams {
  profileIds: string[]
  text: string
  mediaLink?: string
  mediaPhoto?: string
  scheduledAt?: string       // ISO 8601
  now?: boolean
  shorten?: boolean
}

class BufferClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const separator = endpoint.includes("?") ? "&" : "?"
    const url = `${BUFFER_API}${endpoint}${separator}access_token=${this.token}`

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      logger.error({ status: res.status, body, endpoint }, "[buffer] API error")
      throw new Error(`Buffer API error: ${res.status} - ${body}`)
    }

    return res.json() as Promise<T>
  }

  /** Get all connected social profiles */
  async getProfiles(): Promise<BufferProfile[]> {
    return this.request<BufferProfile[]>("/profiles.json")
  }

  /** Get a single profile by ID */
  async getProfile(profileId: string): Promise<BufferProfile> {
    return this.request<BufferProfile>(`/profiles/${profileId}.json`)
  }

  /** Create a new post/update and add to queue or publish immediately */
  async createUpdate(params: BufferCreateParams): Promise<{ success: boolean; updates: BufferUpdate[] }> {
    const body = new URLSearchParams()

    for (const id of params.profileIds) {
      body.append("profile_ids[]", id)
    }
    body.set("text", params.text)

    if (params.mediaLink) body.set("media[link]", params.mediaLink)
    if (params.mediaPhoto) body.set("media[photo]", params.mediaPhoto)
    if (params.scheduledAt) body.set("scheduled_at", params.scheduledAt)
    if (params.now) body.set("now", "true")
    if (params.shorten !== false) body.set("shorten", "true")

    return this.request<{ success: boolean; updates: BufferUpdate[] }>("/updates/create.json", {
      method: "POST",
      body: body.toString(),
    })
  }

  /** Get sent (published) updates for a profile */
  async getSentUpdates(profileId: string, opts?: { page?: number; count?: number }): Promise<{ updates: BufferUpdate[]; total: number }> {
    const page = opts?.page ?? 1
    const count = opts?.count ?? 20
    return this.request<{ updates: BufferUpdate[]; total: number }>(
      `/profiles/${profileId}/updates/sent.json?page=${page}&count=${count}`
    )
  }

  /** Get pending (queued) updates for a profile */
  async getPendingUpdates(profileId: string): Promise<{ updates: BufferUpdate[]; total: number }> {
    return this.request<{ updates: BufferUpdate[]; total: number }>(
      `/profiles/${profileId}/updates/pending.json`
    )
  }

  /** Get interactions (analytics) for a specific update */
  async getUpdateInteractions(updateId: string): Promise<{
    interactions: Array<{
      type: string
      created_at: number
      user?: { username: string; followers: number }
    }>
    total: number
  }> {
    return this.request(`/updates/${updateId}/interactions.json`)
  }

  /** Get a single update with its statistics */
  async getUpdate(updateId: string): Promise<BufferUpdate> {
    return this.request<BufferUpdate>(`/updates/${updateId}.json`)
  }
}

/** Get a Buffer client instance. Returns null if no token configured. */
export function getBufferClient(): BufferClient | null {
  if (!ACCESS_TOKEN) {
    logger.warn("[buffer] No BUFFER_ACCESS_TOKEN configured")
    return null
  }
  return new BufferClient(ACCESS_TOKEN)
}

/** Check if Buffer is configured */
export function isBufferConfigured(): boolean {
  return !!ACCESS_TOKEN
}

/** Map Buffer service names to Marko channel names */
export function bufferServiceToChannel(service: string): string {
  const map: Record<string, string> = {
    linkedin: "LinkedIn",
    twitter: "Twitter",
    facebook: "Facebook",
    instagram: "Instagram",
  }
  return map[service.toLowerCase()] ?? service
}

/** Map Marko channel names to Buffer service names */
export function channelToBufferService(channel: string): string {
  const map: Record<string, string> = {
    LinkedIn: "linkedin",
    Twitter: "twitter",
    Facebook: "facebook",
    Instagram: "instagram",
  }
  return map[channel] ?? channel.toLowerCase()
}

export type { BufferProfile, BufferUpdate, BufferCreateParams }
