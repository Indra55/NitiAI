"use client"

import type React from "react"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ExtractedMetadata = {
  title: string
  abstract: string
  authors: string[]
  fileName: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
      extractMetadata(selectedFile)
    } else if (selectedFile) {
      setError("Please upload a PDF file")
      setFile(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileChange(droppedFile)
  }

  const extractMetadata = async (pdfFile: File) => {
    setIsExtracting(true)
    setError(null)

    // Simulate API call to backend for metadata extraction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulated extracted data - in production, this would come from your backend
    const extracted: ExtractedMetadata = {
      title: `Research Paper: ${pdfFile.name.replace(".pdf", "")}`,
      abstract:
        "This research presents a novel approach to distributed systems architecture, focusing on fault tolerance and consensus mechanisms. Our methodology demonstrates significant improvements in system reliability and performance under various failure scenarios.",
      authors: ["Dr. Jane Smith", "Prof. Michael Chen", "Dr. Sarah Williams"],
      fileName: pdfFile.name,
    }

    setMetadata(extracted)
    setIsExtracting(false)
  }

  const handleSave = () => {
    if (!metadata) return

    // Save to localStorage (in production, this would be a database)
    const existing = JSON.parse(localStorage.getItem("research-papers") || "[]")
    const newPaper = {
      ...metadata,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
      domain: "Distributed Systems",
      citations: 0,
    }
    localStorage.setItem("research-papers", JSON.stringify([...existing, newPaper]))

    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent("papers-updated"))

    setSuccess(true)
    setTimeout(() => {
      setFile(null)
      setMetadata(null)
      setSuccess(false)
    }, 3000)
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="gradient-overlay">
          <header className="flex h-16 shrink-0 items-center px-6 border-b border-border/40 sticky top-0 bg-background/50 backdrop-blur-md z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
              <Upload className="size-3.5 text-primary" />
              Upload Research Paper
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold">Upload Research Paper</h1>
                <p className="text-muted-foreground text-lg">
                  Upload a PDF and automatically extract metadata using AI
                </p>
              </div>

              {!file && !metadata && (
                <Card
                  className={`glass-strong border-2 transition-all duration-200 ${
                    isDragging ? "border-primary bg-primary/5" : "border-dashed"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                      Upload a research paper PDF to automatically extract title, abstract, and authors
                    </p>
                    <div className="flex items-center gap-4">
                      <Button asChild size="lg">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Select PDF File
                          <input
                            id="file-upload"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                          />
                        </label>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isExtracting && (
                <Card className="glass-strong">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Extracting Metadata</h3>
                    <p className="text-sm text-muted-foreground">Analyzing PDF with AI...</p>
                  </CardContent>
                </Card>
              )}

              {metadata && !success && (
                <Card className="glass-strong">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Metadata Extracted Successfully
                    </CardTitle>
                    <CardDescription>Review and edit the extracted information before saving</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fileName">File Name</Label>
                      <Input id="fileName" value={metadata.fileName} disabled className="bg-muted/50" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Paper Title</Label>
                      <Input
                        id="title"
                        value={metadata.title}
                        onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="abstract">Abstract</Label>
                      <Textarea
                        id="abstract"
                        value={metadata.abstract}
                        onChange={(e) => setMetadata({ ...metadata, abstract: e.target.value })}
                        rows={6}
                        className="bg-background/50 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authors">Authors (comma-separated)</Label>
                      <Input
                        id="authors"
                        value={metadata.authors.join(", ")}
                        onChange={(e) =>
                          setMetadata({ ...metadata, authors: e.target.value.split(",").map((a) => a.trim()) })
                        }
                        className="bg-background/50"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave} size="lg" className="flex-1">
                        Save Research Paper
                      </Button>
                      <Button
                        onClick={() => {
                          setFile(null)
                          setMetadata(null)
                        }}
                        variant="outline"
                        size="lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {success && (
                <Alert className="bg-primary/10 border-primary/20">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary">
                    Research paper uploaded successfully! Student portal has been updated.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
