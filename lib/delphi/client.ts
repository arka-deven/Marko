import { logger } from "@/lib/logger"

const DELPHI_API_BASE = process.env.DELPHI_API_BASE ?? "https://api.delphi.ai/v1"
const TIMEOUT_MS = 30_000

export async function queryClone(message: string): Promise<string> {
  const { DELPHI_API_KEY, DELPHI_CLIENT_ID, DELPHI_CLONE_ID } = process.env
  if (!DELPHI_API_KEY || !DELPHI_CLIENT_ID || !DELPHI_CLONE_ID) {
    throw new Error("Delphi not configured")
  }

  const url = `${DELPHI_API_BASE}/clones/${DELPHI_CLONE_ID}/messages`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-CLIENT-ID": DELPHI_CLIENT_ID,
      "X-API-KEY": DELPHI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    logger.error({ status: res.status, body }, "[delphi] API error")
    throw new Error(`Delphi API error: ${res.status}`)
  }

  const data = await res.json()
  // Delphi may return { response: "..." } or { message: "..." } or { content: "..." }
  return data.response ?? data.message ?? data.content ?? JSON.stringify(data)
}

export function isDelphiConfigured(): boolean {
  return !!(process.env.DELPHI_API_KEY && process.env.DELPHI_CLIENT_ID && process.env.DELPHI_CLONE_ID)
}
