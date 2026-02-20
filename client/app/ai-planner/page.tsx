"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Sparkles, TrendingUp, CheckCircle2, Clock, Target, BarChart3 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useState, useEffect } from "react"
import { generateRoadmap, getRoadmap, getMilestones, getTasks, getProgress } from "@/lib/plannerApi"
import { RoadmapTimeline } from "@/components/ai-planner/RoadmapTimeline"
import { TaskKanban } from "@/components/ai-planner/TaskKanban"
import { ProgressDashboard } from "@/components/ai-planner/ProgressDashboard"
import "@/app/dashboard/dashboard.css"

interface Roadmap {
  id: string
  title: string
  description: string
  total_tasks: number
  completed_tasks: number
  progress_percentage: number
  estimated_hours: number
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_hours: number
  milestone_title: string
  dependencies: any[]
  is_blocked: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  sequence_order: number
  progress_percentage: number
  total_tasks: number
  completed_tasks: number
}

export default function AIPlannerPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("kanban")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [roadmapRes, tasksRes, milestonesRes, progressRes] = await Promise.all([
        getRoadmap(),
        getTasks(),
        getMilestones(),
        getProgress()
      ])

      setRoadmap(roadmapRes.roadmap)
      setTasks(tasksRes.tasks || [])
      setMilestones(milestonesRes.milestones || [])
      setProgress(progressRes.progress)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateRoadmap() {
    setGenerating(true)
    try {
      await generateRoadmap()
      await loadData()
    } catch (error: any) {
      alert(error.message || "Failed to generate roadmap")
    } finally {
      setGenerating(false)
    }
  }

  if (loading && !roadmap) {
    return (
      <ProtectedRoute>
        <div className="dashboard-theme min-h-screen bg-background">
          <DynamicNavbar />
          <main className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Spinner className="size-16 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your roadmap...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-background">
        <DynamicNavbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold">AI Career Roadmap</h1>
                  </div>
                  <p className="text-muted-foreground">
                    {roadmap ? "Your personalized learning journey" : "Generate your AI-powered career roadmap"}
                  </p>
                </div>
                {!roadmap && (
                  <Button
                    className="gap-2 bg-primary hover:bg-primary/90"
                    onClick={handleGenerateRoadmap}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Roadmap
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Stats Cards */}
              {roadmap && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                        <p className="text-2xl font-bold text-foreground">{roadmap.total_tasks}</p>
                      </div>
                      <Target className="w-6 h-6 text-primary opacity-70" />
                    </div>
                  </Card>
                  <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Completed</p>
                        <p className="text-2xl font-bold text-foreground">{roadmap.completed_tasks}</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-70" />
                    </div>
                  </Card>
                  <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Progress</p>
                        <p className="text-2xl font-bold text-foreground">{roadmap.progress_percentage}%</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-primary opacity-70" />
                    </div>
                  </Card>
                  <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Est. Hours</p>
                        <p className="text-2xl font-bold text-foreground">{roadmap.estimated_hours}h</p>
                      </div>
                      <Clock className="w-6 h-6 text-amber-500 opacity-70" />
                    </div>
                  </Card>
                </div>
              )}
            </section>

            {/* Empty State */}
            {!roadmap && !generating && (
              <Card className="p-12 text-center border-border/40 bg-card/50 backdrop-blur-sm">
                <Brain className="w-20 h-20 mx-auto mb-4 text-primary opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No Roadmap Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Click "Generate Roadmap" to create a personalized learning path based on your career goals and skills
                </p>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handleGenerateRoadmap}
                  disabled={generating}
                >
                  <Sparkles className="w-5 h-5" />
                  Generate My Roadmap
                </Button>
              </Card>
            )}

            {/* Main Content */}
            {roadmap && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                {/* Roadmap Title */}
                <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{roadmap.title}</h2>
                      <p className="text-muted-foreground">{roadmap.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateRoadmap}
                      disabled={generating}
                    >
                      {generating ? "Generating..." : "New Roadmap"}
                    </Button>
                  </div>
                </Card>

                {/* Tabs for Different Views */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="kanban" className="gap-2">
                      <Target className="w-4 h-4" />
                      Kanban Board
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Progress
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="kanban" className="mt-6">
                    <TaskKanban tasks={tasks} onUpdate={loadData} />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-6">
                    <RoadmapTimeline milestones={milestones} tasks={tasks} />
                  </TabsContent>

                  <TabsContent value="progress" className="mt-6">
                    <ProgressDashboard progress={progress} tasks={tasks} onUpdate={loadData} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
