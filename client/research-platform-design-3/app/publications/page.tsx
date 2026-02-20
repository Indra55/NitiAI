"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, Users, FileText } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ResearchPaper = {
  id: string
  title: string
  abstract: string
  authors: string[]
  fileName: string
  uploadedAt: string
  domain: string
  citations: number
}

export default function PublicationsPage() {
  const { user } = useAuth()
  const [papers, setPapers] = useState<ResearchPaper[]>([])

  useEffect(() => {
    const loadPapers = () => {
      const stored = localStorage.getItem("research-papers")
      if (stored) {
        setPapers(JSON.parse(stored))
      }
    }

    loadPapers()

    // Listen for real-time updates from admin uploads
    const handleUpdate = () => {
      console.log("[v0] Papers updated, reloading...")
      loadPapers()
    }

    window.addEventListener("papers-updated", handleUpdate)
    return () => window.removeEventListener("papers-updated", handleUpdate)
  }, [])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="gradient-overlay">
          <header className="flex h-16 shrink-0 items-center px-6 border-b border-border/40 sticky top-0 bg-background/50 backdrop-blur-md z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
              <BookOpen className="size-3.5 text-primary" />
              Research Repository
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold">Research Publications</h1>
                <p className="text-muted-foreground text-lg">
                  {user?.role === "admin"
                    ? "Manage and oversee all research papers in the system"
                    : "Explore the latest research papers uploaded by faculty"}
                </p>
              </div>

              {papers.length === 0 ? (
                <Card className="glass-strong">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Papers Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                      {user?.role === "admin"
                        ? "Upload your first research paper to get started"
                        : "Check back soon for new research papers"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {papers.map((paper) => (
                    <Card
                      key={paper.id}
                      className="glass-strong hover:border-primary/40 transition-all duration-200 group"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors">
                              {paper.title}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(paper.uploadedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {paper.authors.length} {paper.authors.length === 1 ? "Author" : "Authors"}
                              </span>
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {paper.domain}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Abstract
                          </h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">{paper.abstract}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Authors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {paper.authors.map((author, idx) => (
                              <Badge key={idx} variant="outline" className="font-normal">
                                {author}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">
                            File: <span className="font-mono">{paper.fileName}</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Citations: <span className="font-semibold text-foreground">{paper.citations}</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
