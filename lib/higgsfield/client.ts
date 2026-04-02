// Higgsfield AI Cloud API client
// Docs: https://docs.higgsfield.ai
// Used for: AI avatar videos, talking-head clips, thought-leader content

const HIGGSFIELD_BASE = "https://api.higgsfield.ai/v1"

export interface HiggsfieldVideoJob {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  video_url?: string
  thumbnail_url?: string
  error?: string
  created_at: string
  completed_at?: string
}

export interface CreateAvatarVideoParams {
  script: string          // The spoken script (max ~500 words for 60-90s video)
  avatar_id?: string      // Higgsfield avatar ID — default to env var
  voice_id?: string       // Voice ID for lip-sync
  resolution?: "720p" | "1080p"
  aspect_ratio?: "16:9" | "9:16" | "1:1" // 9:16 for TikTok/Reels, 16:9 for YouTube
}

function getApiKey(): string {
  const key = process.env.HIGGSFIELD_API_KEY
  if (!key) throw new Error("HIGGSFIELD_API_KEY is not set")
  return key
}

async function higgsfieldFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${HIGGSFIELD_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Higgsfield API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

// Submit a video generation job — returns job ID immediately, video renders async
export async function createAvatarVideo(params: CreateAvatarVideoParams): Promise<string> {
  const body = {
    script: params.script,
    avatar_id: params.avatar_id ?? process.env.HIGGSFIELD_AVATAR_ID ?? "default",
    voice_id: params.voice_id ?? process.env.HIGGSFIELD_VOICE_ID,
    resolution: params.resolution ?? "1080p",
    aspect_ratio: params.aspect_ratio ?? "9:16", // default to vertical for social
  }

  const result = await higgsfieldFetch<{ job_id: string }>("/videos/avatar", {
    method: "POST",
    body: JSON.stringify(body),
  })

  return result.job_id
}

// Poll job status — call this from the check-higgsfield-jobs cron
export async function getVideoJob(jobId: string): Promise<HiggsfieldVideoJob> {
  return higgsfieldFetch<HiggsfieldVideoJob>(`/videos/${jobId}`)
}

// Get all pending jobs (useful for initial sync on startup)
export async function listPendingJobs(): Promise<HiggsfieldVideoJob[]> {
  const result = await higgsfieldFetch<{ jobs: HiggsfieldVideoJob[] }>(
    "/videos?status=pending,processing"
  )
  return result.jobs ?? []
}

export function isHighsfieldAvailable(): boolean {
  return Boolean(process.env.HIGGSFIELD_API_KEY)
}
