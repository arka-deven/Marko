// ============================================================
// Beehiiv API v2 Client
// Docs: https://developers.beehiiv.com/docs/v2
//
// Requires env vars:
//   BEEHIIV_API_KEY          — API key from Beehiiv dashboard
//   BEEHIIV_PUBLICATION_ID   — Publication ID (starts with "pub_")
// ============================================================

const BASE_URL = "https://api.beehiiv.com/v2"

function getConfig() {
  return {
    apiKey: process.env.BEEHIIV_API_KEY ?? "",
    publicationId: process.env.BEEHIIV_PUBLICATION_ID ?? "",
  }
}

/** Returns true if both BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are set. */
export function isBeehiivConfigured(): boolean {
  const { apiKey, publicationId } = getConfig()
  return apiKey.length > 0 && publicationId.length > 0
}

// -- Response types ----------------------------------------------------------

export interface BeehiivPost {
  id: string
  title: string
  subtitle: string | null
  status: "draft" | "confirmed" | "archived"
  web_url: string | null
  created_at: number
}

export interface BeehiivSubscription {
  id: string
  email: string
  status: "active" | "inactive" | "validating"
  created_at: number
}

export interface BeehiivListResponse<T> {
  data: T[]
  total_results: number
  page: number
  limit: number
}

// -- Client ------------------------------------------------------------------

export class BeehiivClient {
  private apiKey: string
  private publicationId: string

  constructor(
    apiKey = process.env.BEEHIIV_API_KEY ?? "",
    publicationId = process.env.BEEHIIV_PUBLICATION_ID ?? "",
  ) {
    this.apiKey = apiKey
    this.publicationId = publicationId
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    }
  }

  private url(path: string): string {
    return `${BASE_URL}/publications/${this.publicationId}${path}`
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method,
      headers: this.headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Beehiiv API ${method} ${path} failed (${res.status}): ${text}`)
    }

    return res.json() as Promise<T>
  }

  // -- Posts (drafts) --------------------------------------------------------

  /**
   * Create a draft newsletter post.
   *
   * @param title     - Email subject / post title
   * @param content   - HTML body content
   * @param subtitle  - Optional subtitle
   * @returns The created post object
   */
  async createDraft(params: {
    title: string
    content: string
    subtitle?: string
  }): Promise<{ data: BeehiivPost }> {
    return this.request<{ data: BeehiivPost }>("POST", "/posts", {
      title: params.title,
      subtitle: params.subtitle ?? null,
      content_html: params.content,
      status: "draft",
    })
  }

  /**
   * Get a single post by ID.
   */
  async getDraft(postId: string): Promise<{ data: BeehiivPost }> {
    return this.request<{ data: BeehiivPost }>("GET", `/posts/${postId}`)
  }

  // -- Subscribers -----------------------------------------------------------

  /**
   * List subscribers (paginated).
   *
   * @param page  - Page number (1-based), defaults to 1
   * @param limit - Results per page, defaults to 100
   */
  async listSubscribers(
    page = 1,
    limit = 100,
  ): Promise<BeehiivListResponse<BeehiivSubscription>> {
    return this.request<BeehiivListResponse<BeehiivSubscription>>(
      "GET",
      `/subscriptions?page=${page}&limit=${limit}`,
    )
  }

  /**
   * Get the total subscriber count without fetching full list.
   */
  async getSubscriberCount(): Promise<number> {
    const res = await this.listSubscribers(1, 1)
    return res.total_results
  }
}

/** Shared singleton instance — safe to import anywhere. */
export const beehiiv = new BeehiivClient()
