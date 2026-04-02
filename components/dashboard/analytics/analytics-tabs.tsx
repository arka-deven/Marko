"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { ReactNode } from "react"

interface AnalyticsTabsProps {
  overview: ReactNode
  contentPerformance: ReactNode
  funnelAnalysis: ReactNode
  leadMagnets: ReactNode
}

export function AnalyticsTabs({
  overview,
  contentPerformance,
  funnelAnalysis,
  leadMagnets,
}: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full max-w-lg">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Content Performance</TabsTrigger>
        <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
        <TabsTrigger value="leads">Lead Magnets</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        {overview}
      </TabsContent>
      <TabsContent value="performance" className="mt-6">
        {contentPerformance}
      </TabsContent>
      <TabsContent value="funnel" className="mt-6">
        {funnelAnalysis}
      </TabsContent>
      <TabsContent value="leads" className="mt-6">
        {leadMagnets}
      </TabsContent>
    </Tabs>
  )
}
