"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts"
import {
  TrendingUp,
  Target,
  Zap,
  Award,
  Brain,
  Flame,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useEffect, useState } from "react"

// Advanced data for career progression analytics
const progressionData = [
  { month: "Jan", engagement: 45, completions: 30, skillGrowth: 35 },
  { month: "Feb", engagement: 52, completions: 38, skillGrowth: 42 },
  { month: "Mar", engagement: 68, completions: 45, skillGrowth: 58 },
  { month: "Apr", engagement: 74, completions: 52, skillGrowth: 65 },
  { month: "May", engagement: 85, completions: 68, skillGrowth: 78 },
  { month: "Jun", engagement: 92, completions: 75, skillGrowth: 88 },
]

const skillLevelData = [
  { skill: "System Design", level: 78, benchmark: 65 },
  { skill: "Communication", level: 82, benchmark: 70 },
  { skill: "Leadership", level: 65, benchmark: 72 },
  { skill: "Technical", level: 88, benchmark: 75 },
  { skill: "Problem Solving", level: 85, benchmark: 68 },
  { skill: "Collaboration", level: 80, benchmark: 72 },
]

const opportunityData = [
  { x: 85, y: 72, size: 400, role: "Senior SDE", salaryGrowth: "18%" },
  { x: 78, y: 65, size: 300, role: "Tech Lead" },
  { x: 72, y: 88, size: 350, role: "Staff Engineer" },
  { x: 65, y: 75, size: 250, role: "PM" },
  { x: 88, y: 80, size: 420, role: "Architect" },
]

const timelineData = [
  { date: "Jan 15", event: "System Design Mastery", status: "completed" },
  { date: "Feb 22", event: "Interview Preparation", status: "completed" },
  { date: "Mar 30", event: "Leadership Workshop", status: "in-progress" },
  { date: "Apr 20", event: "Negotiation Skills", status: "upcoming" },
  { date: "May 15", event: "Executive Presence", status: "upcoming" },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Welcome & Quick Stats */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2">
                  {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome to Your Dashboard"}
                </h1>
                <p className="text-muted-foreground font-medium">Your career growth at a glance</p>
              </div>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4" />
                Get AI Insights
              </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Overall Progress",
                  value: "78%",
                  change: "+12%",
                  icon: TrendingUp,
                  color: "text-emerald-500",
                },
                {
                  label: "Skill Mastery",
                  value: "6 Advanced",
                  change: "4 in progress",
                  icon: Award,
                  color: "text-amber-500",
                },
                {
                  label: "Interview Ready",
                  value: "4/5 Areas",
                  change: "+1 this month",
                  icon: Target,
                  color: "text-blue-500",
                },
                {
                  label: "Engagement Streak",
                  value: "28 days",
                  change: "Personal best",
                  icon: Flame,
                  color: "text-orange-500",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={idx}
                    className="p-4 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-lg cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${100 * idx}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground font-medium mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                      </div>
                      <Icon className={`w-6 h-6 ${stat.color} opacity-70`} />
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Main Analytics Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* Career Progression Chart - Large */}
            <Card className="lg:col-span-2 p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Career Progression
                </h2>
                <p className="text-sm text-muted-foreground">Your growth metrics over the last 6 months</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressionData}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-secondary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--color-secondary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(var(--color-primary))"
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                  />
                  <Area
                    type="monotone"
                    dataKey="skillGrowth"
                    stroke="hsl(var(--color-secondary))"
                    fillOpacity={1}
                    fill="url(#colorCompletions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Quick Actions Sidebar */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  Next Steps
                </h2>
                <div className="space-y-3">
                  {[
                    { icon: Brain, label: "Complete System Design", priority: "high" },
                    { icon: CheckCircle2, label: "Review Resume Feedback", priority: "medium" },
                    { icon: Clock, label: "Schedule Mock Interview", priority: "medium" },
                    { icon: AlertCircle, label: "Update Portfolio", priority: "low" },
                  ].map((item, idx) => {
                    const Icon = item.icon
                    const priorityColor = {
                      high: "bg-red-500/20 text-red-600 border-red-500/30",
                      medium: "bg-amber-500/20 text-amber-600 border-amber-500/30",
                      low: "bg-blue-500/20 text-blue-600 border-blue-500/30",
                    }[item.priority]
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border/30 hover:bg-card/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {item.label}
                            </p>
                            <div
                              className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium border ${priorityColor}`}
                            >
                              {item.priority}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </section>

          {/* Skill Analysis & Opportunities */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* Skill Radar Chart */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-primary" />
                  Skill Mastery Map
                </h2>
                <p className="text-sm text-muted-foreground">Your skills vs. industry benchmark</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillLevelData}>
                  <PolarGrid stroke="hsl(var(--color-border))" />
                  <PolarAngleAxis dataKey="skill" stroke="hsl(var(--color-muted-foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Radar
                    name="Your Level"
                    dataKey="level"
                    stroke="hsl(var(--color-primary))"
                    fill="hsl(var(--color-primary))"
                    fillOpacity={0.25}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="hsl(var(--color-secondary))"
                    fill="hsl(var(--color-secondary))"
                    fillOpacity={0.1}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            {/* Career Opportunities Scatter */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-primary" />
                  Opportunity Landscape
                </h2>
                <p className="text-sm text-muted-foreground">Roles matched to your profile</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis type="number" dataKey="x" name="Skill Match %" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Growth Potential %"
                    stroke="hsl(var(--color-muted-foreground))"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Scatter
                    name="Career Opportunities"
                    data={opportunityData}
                    fill="hsl(var(--color-primary))"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </section>

          {/* Development Timeline */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-primary" />
                  Your Development Timeline
                </h2>
                <p className="text-sm text-muted-foreground">Planned milestones for your career growth</p>
              </div>
              <div className="space-y-4">
                {timelineData.map((item, idx) => {
                  const statusColor = {
                    completed: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
                    "in-progress": "bg-blue-500/20 text-blue-600 border-blue-500/30 animate-pulse",
                    upcoming: "bg-slate-500/20 text-slate-600 border-slate-500/30",
                  }[item.status]

                  const Icon = {
                    completed: CheckCircle2,
                    "in-progress": Zap,
                    upcoming: Clock,
                  }[item.status]

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/30 hover:bg-card/80 transition-colors"
                    >
                      <div className={`p-2 rounded-lg border ${statusColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                        {item.status.replace("-", " ").charAt(0).toUpperCase() + item.status.replace("-", " ").slice(1)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
