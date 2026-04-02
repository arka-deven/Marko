import { Client } from "@hubspot/api-client"

let client: Client | null = null

export function getHubSpotClient(): Client | null {
  const token = process.env.HUBSPOT_ACCESS_TOKEN
  if (!token) return null

  if (!client) {
    client = new Client({ accessToken: token })
  }
  return client
}

export function isHubSpotConfigured(): boolean {
  return !!process.env.HUBSPOT_ACCESS_TOKEN
}
