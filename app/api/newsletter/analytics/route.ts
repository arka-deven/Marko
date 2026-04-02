import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/api/auth"
import { apiError, handleApiError } from "@/lib/api/errors"
import { getBeehiivClient, isBeehiivConfigured } from "@/lib/beehiiv/client"

export async function GET() {
  try {
    const auth = await getAuthContext()
    if (!auth) return apiError("Unauthorized", 401)

    if (!isBeehiivConfigured()) {
      return NextResponse.json({ configured: false, publication: null, recent_posts: [] })
    }

    const client = getBeehiivClient()!
    const pubId = process.env.BEEHIIV_PUBLICATION_ID!

    // Fetch publication stats
    const pubResponse = await client.publications.show(pubId, { expand: ["stats"] })
    const stats = pubResponse.data?.stats

    // Fetch recent posts with stats
    const postsResponse = await client.posts.index(pubId, {
      expand: ["stats"],
      limit: 10,
      order_by: "publish_date",
      direction: "desc",
    })

    const recentPosts = (postsResponse.data ?? []).map((post: any) => ({
      id: post.id,
      title: post.title,
      publishDate: post.publish_date,
      webUrl: post.web_url,
      stats: {
        recipients: post.stats?.email?.recipients ?? null,
        openRate: post.stats?.email?.open_rate ?? null,
        clickRate: post.stats?.email?.click_rate ?? null,
        uniqueOpens: post.stats?.email?.unique_opens ?? null,
        unsubscribes: post.stats?.email?.unsubscribes ?? null,
      },
    }))

    return NextResponse.json({
      configured: true,
      publication: {
        activeSubscriptions: stats?.active_subscriptions ?? null,
        averageOpenRate: stats?.average_open_rate ?? null,
        averageClickRate: stats?.average_click_rate ?? null,
        totalSent: stats?.total_sent ?? null,
      },
      recent_posts: recentPosts,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
