"use client"

import { useState, useEffect, useRef } from "react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Send, FileText, Sparkles, Download, Code, Target, Wand2, Plus, Award, TrendingUp, Lightbulb, CheckCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import ReactMarkdown from "react-markdown"
import { useReactToPrint } from "react-to-print"
import { getResumeInfo, updateResume, generateLaTeX, tailorResume, type ResumeInfo } from "@/lib/api"
import { ModernTemplate, ClassicTemplate, MinimalTemplate } from "@/components/resume-templates"
import "@/app/dashboard/dashboard.css"

interface Message {
  role: "user" | "ai"
  content: string
  timestamp: Date
  type?: "info" | "success" | "warning"
}

const QUICK_ACTIONS = [
  { icon: Target, label: "Tailor to JD", action: "tailor", color: "text-blue-500" },
  { icon: Wand2, label: "Improve Summary", action: "improve_summary", color: "text-purple-500" },
  { icon: Plus, label: "Add Skills", action: "add_skills", color: "text-green-500" },
  { icon: Award, label: "Highlight Achievements", action: "achievements", color: "text-amber-500" },
]

const EXAMPLE_PROMPTS = [
  "Make my summary more impactful and results-oriented",
  "Add Docker, Kubernetes, and AWS to my technical skills",
  "Rewrite my experience bullets with stronger action verbs",
  "Make my resume more suitable for a Senior Engineer role",
  "Add quantifiable metrics to my project descriptions",
]

export default function ResumeBuilderPage() {
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "classic" | "minimal">("modern")
  const [instruction, setInstruction] = useState("")
  const [loading, setLoading] = useState(false)
  const [zoom, setZoom] = useState(0.75)
  const [showTailorModal, setShowTailorModal] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const resumeRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `Resume_${resumeInfo?.extracted_name || 'User'}`,
  })

  useEffect(() => {
    loadResume()
  }, [])

  useEffect(() => {
    const checkAutoTailor = async () => {
      const storedJD = localStorage.getItem("tailor_jd")
      if (storedJD && resumeInfo) {
        // Clear it immediately so we don't re-trigger
        localStorage.removeItem("tailor_jd")

        // Set the state for visibility (though we're auto-submitting)
        setJobDescription(storedJD)

        // Trigger the tailoring
        await handleTailorToJD(storedJD)
      }
    }

    checkAutoTailor()
  }, [resumeInfo])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadResume() {
    const response = await getResumeInfo()
    if (response.data) {
      setResumeInfo(response.data)
    }
  }

  async function handleQuickAction(action: string) {
    switch (action) {
      case "tailor":
        setShowTailorModal(true)
        break
      case "improve_summary":
        setInstruction("Improve my professional summary to be more impactful, concise, and results-oriented. Use strong action verbs.")
        break
      case "add_skills":
        setInstruction("Suggest 5 relevant technical skills I should add based on my experience and current market demand.")
        break
      case "achievements":
        setInstruction("Identify my key achievements and rewrite them with quantifiable metrics and impact statements.")
        break
    }
  }

  async function handleTailorToJD(jd?: string) {
    const jdToUse = typeof jd === 'string' ? jd : jobDescription
    if (!jdToUse.trim() || !resumeInfo) return

    setShowTailorModal(false)
    const userMsg: Message = { role: "user", content: "🎯 Tailoring resume to job description...", timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await tailorResume(jdToUse)

      if (response.data) {
        // Update the resume info with the tailored data
        if (response.data.tailored_resume_data) {
          setResumeInfo(response.data.tailored_resume_data)
        }

        // Parse the tailored resume and update the state
        const aiMsg: Message = {
          role: "ai",
          content: `✅ **Resume Tailored Successfully!**\n\n**Changes Made:**\n${response.data.changes_made.map((c: string) => `• ${c}`).join('\n')}\n\n**Match Improvement:** ${response.data.match_score_improvement}\n\n*The tailored resume is now shown in the preview. You can further refine it using the chat.*`,
          timestamp: new Date(),
          type: "success"
        }
        setMessages(prev => [...prev, aiMsg])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ Failed to tailor resume. Please try again.", timestamp: new Date(), type: "warning" }])
    } finally {
      setLoading(false)
      setJobDescription("")
    }
  }

  async function handleUpdate() {
    if (!instruction.trim() || !resumeInfo) return

    const userMsg: Message = { role: "user", content: instruction, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await updateResume(resumeInfo, instruction)

      if (response.data) {
        setResumeInfo(response.data)
        const aiMsg: Message = {
          role: "ai",
          content: "✅ **Resume Updated!**\n\nI've applied your changes. Check the preview to see the updates. Feel free to ask for more modifications!",
          timestamp: new Date(),
          type: "success"
        }
        setMessages(prev => [...prev, aiMsg])
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "❌ Sorry, I couldn't update the resume. Please try rephrasing your request.", timestamp: new Date(), type: "warning" }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ Something went wrong. Please try again.", timestamp: new Date(), type: "warning" }])
    } finally {
      setLoading(false)
      setInstruction("")
    }
  }

  async function handleExportLaTeX() {
    if (!resumeInfo) return

    setLoading(true)

    try {
      const response = await generateLaTeX(resumeInfo, selectedTemplate)
      if (response.data) {
        const blob = new Blob([response.data.latex_code], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume_${selectedTemplate}.tex`
        a.click()

        setMessages(prev => [...prev, { role: "ai", content: "📄 **LaTeX Exported!**\n\nYour resume has been downloaded as a `.tex` file. You can edit it in Overleaf or any LaTeX editor.", timestamp: new Date(), type: "info" }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ Failed to generate LaTeX.", timestamp: new Date(), type: "warning" }])
    } finally {
      setLoading(false)
    }
  }

  function handleExampleClick(prompt: string) {
    setInstruction(prompt)
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-background">
        <DynamicNavbar />
        <main className="pt-20 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto w-full" style={{ height: 'calc(100vh - 0px)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

            {/* Left Panel: Resume Preview (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-0">
              {/* Header Bar */}
              <Card className="shrink-0 p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold hidden sm:block">Resume Preview</h2>
                    <div className="h-6 w-px bg-border/50 hidden sm:block" />
                    <Tabs value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as any)}>
                      <TabsList>
                        <TabsTrigger value="modern">Modern</TabsTrigger>
                        <TabsTrigger value="classic">Classic</TabsTrigger>
                        <TabsTrigger value="minimal">Minimal</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Resume Stats */}
                    {resumeInfo && (
                      <div className="hidden md:flex items-center gap-2 mr-4">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          ATS: {resumeInfo.ats_score || 'N/A'}%
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete: {resumeInfo.completeness_score || 'N/A'}%
                        </Badge>
                      </div>
                    )}

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>-</Button>
                      <span className="text-xs w-8 text-center">{Math.round(zoom * 100)}%</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}>+</Button>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleExportLaTeX} disabled={loading || !resumeInfo}>
                      <Code className="w-4 h-4 mr-2" />
                      LaTeX
                    </Button>
                    <Button size="sm" onClick={() => handlePrint()} disabled={!resumeInfo || loading}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Resume Preview Area */}
              <div className="flex-1 min-h-0 bg-gray-100/80 rounded-lg border border-border/40 overflow-auto shadow-inner">
                <div className="min-h-full flex justify-center p-8">
                  <div
                    className="transition-transform duration-200 ease-in-out shadow-2xl origin-top"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  >
                    {resumeInfo ? (
                      selectedTemplate === "modern" ? (
                        <ModernTemplate ref={resumeRef} data={resumeInfo} />
                      ) : selectedTemplate === "classic" ? (
                        <ClassicTemplate ref={resumeRef} data={resumeInfo} />
                      ) : (
                        <MinimalTemplate ref={resumeRef} data={resumeInfo} />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[800px] w-[600px] bg-white shadow-sm rounded-lg">
                        <Spinner className="size-8 mb-4" />
                        <p className="text-muted-foreground">Loading resume data...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: AI Editor (4 cols) */}
            <Card className="lg:col-span-4 flex flex-col h-full min-h-0 overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
              {/* Header */}
              <div className="shrink-0 p-4 border-b border-border/40 bg-linear-to-r from-primary/5 to-accent/5">
                <h2 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Resume Editor
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Edit your resume with natural language instructions
                </p>
              </div>

              {/* Quick Actions */}
              <div className="shrink-0 p-3 border-b border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.action}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 bg-background/50 hover:bg-background"
                      onClick={() => handleQuickAction(action.action)}
                      disabled={loading}
                    >
                      <action.icon className={`w-3 h-3 mr-1.5 ${action.color}`} />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-lg p-3 ${msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : msg.type === 'warning'
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-muted/50 border border-border/50'
                        }`}>
                        {msg.role === 'ai' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        <span className="text-[10px] opacity-50 mt-1 block">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 border border-border/50 rounded-lg p-3 flex items-center gap-2">
                        <Spinner className="w-4 h-4" />
                        <span className="text-sm">AI is working on your resume...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Example Prompts */}
              {messages.length <= 2 && (
                <div className="shrink-0 p-3 border-t border-border/40 bg-muted/5">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Try these examples
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(prompt)}
                        className="text-xs px-2 py-1 rounded-full bg-background/80 border border-border/50 hover:bg-background hover:border-primary/30 transition-colors truncate max-w-full"
                      >
                        {prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="shrink-0 p-4 border-t border-border/40 bg-muted/10">
                <div className="relative">
                  <Textarea
                    placeholder="E.g., 'Add Python to my skills' or 'Make my summary more concise'..."
                    className="min-h-[80px] pr-12 resize-none bg-background text-foreground caret-primary border-border/50 focus:border-primary/50"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleUpdate()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-3 right-3 h-8 w-8"
                    onClick={handleUpdate}
                    disabled={loading || !instruction.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </Card>

          </div>
        </main>

        {/* Tailor to JD Modal */}
        <Dialog open={showTailorModal} onOpenChange={setShowTailorModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Tailor Resume to Job Description
              </DialogTitle>
              <DialogDescription>
                Paste the job description below and AI will optimize your resume to match the requirements, keywords, and skills mentioned in the JD.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Paste the full job description here..."
                className="min-h-[200px] resize-none bg-background text-foreground caret-primary"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-600 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tip:</strong> Include the full JD with responsibilities, requirements, and preferred qualifications for best results.
                  </span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTailorModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleTailorToJD()} disabled={!jobDescription.trim() || loading}>
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Tailor My Resume
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
