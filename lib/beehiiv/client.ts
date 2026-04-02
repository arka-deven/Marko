import { BeehiivClient } from "@beehiiv/sdk"

let client: BeehiivClient | null = null

export function getBeehiivClient(): BeehiivClient | null {
  const token = process.env.BEEHIIV_API_KEY
  if (!token) return null

  if (!client) {
    client = new BeehiivClient({ token })
  }
  return client
}

export function isBeehiivConfigured(): boolean {
  return !!process.env.BEEHIIV_API_KEY
}
