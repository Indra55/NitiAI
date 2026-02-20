"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { LineChart } from "lucide-react"
import { AdminAnalytics } from "@/components/admin-analytics"
import { ProtectedRoute } from "@/components/protected-route"

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="gradient-overlay">
          <header className="flex h-16 shrink-0 items-center px-6 border-b border-border/40 sticky top-0 bg-background/50 backdrop-blur-md z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
              <LineChart className="size-3.5 text-primary" />
              Institutional Intelligence
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive research metrics and institutional performance indicators
                </p>
              </div>

              <AdminAnalytics />
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
