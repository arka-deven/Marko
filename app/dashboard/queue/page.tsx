"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import type { ContentAsset } from "@/lib/types"
import { ContentAssetCard } from "@/components/dashboard/queue/content-asset-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FilterTab = "all" | "ready" | "generating" | "published" | "failed"

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "ready",      label: "Ready" },
  { key: "generating", label: "Generating" },
  { key: "published",  label: "Published" },
  { key: "failed",     label: "Failed" },
]

export default function QueuePage() {
  const [allAssets, setAllAssets] = useState<ContentAsset[]>([])
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAssets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch("/api/content")
      if (!res.ok) throw new Error("Failed")
      const json = await res.json()
      setAllAssets(json.assets ?? [])
    } catch {
      setAllAssets([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const hasGenerating = allAssets.some((a) => a.status === "generating")
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (hasGenerating) {
      intervalRef.current = setInterval(() => fetchAssets(true), 15_000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [allAssets, fetchAssets])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  function handlePublished(id: string) {
    setAllAssets((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: "published" as const } : a
    ))
  }

  const assets = useMemo(() => {
    if (activeTab === "all") return allAssets
    return allAssets.filter((a) => a.status === activeTab)
  }, [allAssets, activeTab])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allAssets.length }
    for (const a of allAssets) {
      c[a.status] = (c[a.status] ?? 0) + 1
    }
    return c
  }, [allAssets])

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Content Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-generated content ready to publish.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAssets(true)}
          disabled={refreshing || loading}
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
              {(counts[tab.key] ?? 0) > 0 && (
                <span className="ml-1 text-[10px] opacity-60">{counts[tab.key]}</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-background/50 animate-pulse h-20"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-14 text-center">
          {allAssets.length === 0 ? (
            <>
              <p className="text-sm font-medium text-foreground/70">Pipeline empty</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Approve ideas in the{" "}
                <Link href="/dashboard/ideas" className="text-foreground/70 font-medium hover:underline">
                  Inbox
                </Link>
                {" "}to start generating content.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground/70">No {activeTab} content</p>
              <p className="mt-1 text-xs text-muted-foreground">Switch tabs to see other content.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <ContentAssetCard
              key={asset.id}
              asset={asset}
              onPublished={handlePublished}
            />
          ))}
        </div>
      )}
    </div>
  )
}
