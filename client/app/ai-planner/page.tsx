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
    loadPlannerData()
  }, [])

  const loadPlannerData = async () => {
    setLoading(true)
    try {
      const roadmapRes = await getRoadmap()
      if (roadmapRes.data?.roadmap) {
        setRoadmap(roadmapRes.data.roadmap)
        const [milestonesRes, tasksRes, progressRes] = await Promise.all([
          getMilestones(),
          getTasks(),
          getProgress()
        ])
        if (milestonesRes.data?.milestones) setMilestones(milestonesRes.data.milestones)
        if (tasksRes.data?.tasks) setTasks(tasksRes.data.tasks)
        if (progressRes.data) setProgress(progressRes.data)
      }
    } catch (e) {
      console.warn("Planner data load error:", e)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateRoadmap = async () => {
    setGenerating(true)
    try {
      await generateRoadmap()
      await loadPlannerData()
    } catch (e) {
      console.error("Roadmap generation error:", e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-[#fcf9f5] flex flex-col">
        <DynamicNavbar />
        <main className="flex-1 pt-24 lg:pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ef4a18]/20 bg-[#fff0eb] px-3.5 py-1 text-xs font-semibold text-[#ef4a18]">
                  <Brain className="size-3.5" /> AI Planned Learning
                </span>
                <h1 className="mt-3 text-3xl font-bold text-[#171716]">Learning Roadmap</h1>
                <p className="mt-1 text-sm text-[#77716b]">Personalized milestone planning tailored to your career goal.</p>
              </div>
              <Button onClick={handleGenerateRoadmap} disabled={generating} className="bg-[#ef4a18] hover:bg-[#d93d10] text-white font-bold rounded-xl text-xs px-5 py-2.5">
                {generating ? <Spinner className="size-4 mr-2" /> : <Sparkles className="size-4 mr-2" />}
                Generate AI Roadmap
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center p-12"><Spinner className="size-8 text-[#ef4a18]" /></div>
            ) : roadmap ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white border border-[#e8e1da] rounded-xl p-1">
                  <TabsTrigger value="kanban" className="rounded-lg text-xs font-bold">Kanban Tasks</TabsTrigger>
                  <TabsTrigger value="timeline" className="rounded-lg text-xs font-bold">Timeline Milestones</TabsTrigger>
                  <TabsTrigger value="progress" className="rounded-lg text-xs font-bold">Progress Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="kanban"><TaskKanban tasks={tasks} onTaskUpdated={loadPlannerData} /></TabsContent>
                <TabsContent value="timeline"><RoadmapTimeline milestones={milestones} /></TabsContent>
                <TabsContent value="progress"><ProgressDashboard progress={progress} /></TabsContent>
              </Tabs>
            ) : (
              <Card className="p-12 text-center border-[#e8e1da] rounded-3xl space-y-4">
                <Brain className="size-12 mx-auto text-[#ef4a18]" />
                <h3 className="text-lg font-bold text-[#171716]">No active roadmap generated yet</h3>
                <p className="text-xs text-[#77716b]">Click below to create your personalized learning roadmap powered by Sarvam AI.</p>
                <Button onClick={handleGenerateRoadmap} disabled={generating} className="bg-[#ef4a18] hover:bg-[#d93d10] text-white font-bold rounded-xl text-xs px-6 py-2.5">
                  Generate First AI Roadmap
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
