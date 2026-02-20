"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { BentoGridShowcase } from "@/components/BentoGridShowcase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import "./dashboard.css"
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Label,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Chart as SkillsRadar } from "./chart"
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
  Loader2,
  RefreshCw,
  Briefcase,
  GraduationCap,
  DollarSign,
  ArrowUpRight,
  Star,
  TrendingDown,
  Building2,
  Code,
  Users,
  ChevronRight,
  BookOpen,
  Rocket,
  Shield,
  Database,
  Cloud,
  Cpu,
  MapPin,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getDashboardData, getSkills, type DashboardData, type Skill } from "@/lib/api"
import { toaster } from "@/lib/toaster"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [dashboardResult, skillsResult] = await Promise.all([
        getDashboardData(),
        getSkills(),
      ])

      if (dashboardResult.data) {
        setDashboardData(dashboardResult.data)
      } else if (dashboardResult.error) {
        console.error("Dashboard API error:", dashboardResult.error)
        setError(dashboardResult.error)
        toaster.create({
          title: "Dashboard Error",
          description: dashboardResult.error,
          type: "error"
        });
      }

      if (skillsResult.data?.skills) {
        setSkills(skillsResult.data.skills)
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
      toaster.create({
        title: "Load Error",
        description: "Failed to load dashboard data.",
        type: "error"
      });
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchDashboardData()
    }
  }, [mounted, fetchDashboardData])

  if (!mounted) return null

  const profileOverview = dashboardData?.profile_overview
  const careerDashboard = dashboardData?.career_dashboard
  const quickStats = dashboardData?.quick_stats
  const profileSummary = careerDashboard?.profile_summary

  // Prepare chart data — normalize raw points to percentages (each category has a different max)
  const categoryMaxes: Record<string, number> = {
    basic_info: 15, skills: 15, education: 10,
    experience: 20, preferences: 10, resume: 15, peer_learning: 15,
  }
  const toPercent = (val: number, max: number) => Math.round((val / max) * 100)
  const bd = profileOverview?.completeness_breakdown

  const completenessBreakdownData = [
    { name: "Peer Learning", value: bd ? toPercent(bd.peer_learning ?? 0, categoryMaxes.peer_learning) : 0, fill: "#06b6d4" },
    { name: "Preferences",   value: bd ? toPercent(bd.preferences ?? 0, categoryMaxes.preferences)     : 0, fill: "#a855f7" },
    { name: "Experience",    value: bd ? toPercent(bd.experience ?? 0, categoryMaxes.experience)       : 0, fill: "#f59e0b" },
    { name: "Education",     value: bd ? toPercent(bd.education ?? 0, categoryMaxes.education)         : 0, fill: "#10b981" },
    { name: "Skills",        value: bd ? toPercent(bd.skills ?? 0, categoryMaxes.skills)               : 0, fill: "#3b82f6" },
    { name: "Resume",        value: bd ? toPercent(bd.resume ?? 0, categoryMaxes.resume)               : 0, fill: "#ec4899" },
    { name: "Basic Info",    value: bd ? toPercent(bd.basic_info ?? 0, categoryMaxes.basic_info)       : 0, fill: "#f97316" },
  ]

  const completenessChartConfig = {
    "Basic Info":    { label: "Basic Info",    color: "#f97316" },
    "Resume":        { label: "Resume",        color: "#ec4899" },
    "Skills":        { label: "Skills",        color: "#3b82f6" },
    "Education":     { label: "Education",     color: "#10b981" },
    "Experience":    { label: "Experience",    color: "#f59e0b" },
    "Preferences":   { label: "Preferences",   color: "#a855f7" },
    "Peer Learning": { label: "Peer Learning", color: "#06b6d4" },
  } as Record<string, { label: string; color: string }>

  const careerPathsData = careerDashboard?.recommended_career_paths?.map(path => ({
    name: path.title.length > 20 ? path.title.substring(0, 18) + "..." : path.title,
    fullName: path.title,
    matchScore: path.match_score,
    fill: path.match_score >= 90 ? "#10b981" : path.match_score >= 80 ? "#3b82f6" : "#f59e0b",
  })) || []

  // Prepare Skills Radar Data
  const skillHeatmapData = careerDashboard?.skill_heatmap && careerDashboard.skill_heatmap.length > 0
    ? careerDashboard.skill_heatmap
    : skills.length > 0
      ? skills.slice(0, 8).map(s => ({
          category: s.skill_name,
          value: s.proficiency || 80,
        }))
      : [
          { category: "System Design", value: 85 },
          { category: "Cloud Architecture", value: 75 },
          { category: "Data Structures", value: 90 },
          { category: "Backend Dev", value: 70 },
          { category: "Frontend Dev", value: 80 },
          { category: "DevOps/CI-CD", value: 65 },
          { category: "AI/LLMs", value: 55 },
          { category: "Soft Skills", value: 88 },
        ];

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2 text-foreground">
                    {dashboardData?.user_name ? `Welcome, ${dashboardData.user_name.split(" ")[0]}` : user?.name ? `Welcome, ${user.name.split(" ")[0]}` : "Career Dashboard"}
                  </h1>
                  <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI-powered career insights tailored just for you
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="hover:bg-muted border-none shadow-none"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                    <Sparkles className="w-4 h-4" />
                    Refresh Insights
                  </Button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </section>

            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="size-16" />
                  <p className="text-muted-foreground">Loading your career insights...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Bento Grid Showcase for Profile Overview */}
                <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <BentoGridShowcase
                    integration={
                      <div className="h-full flex flex-col relative overflow-hidden bg-card/50 backdrop-blur-sm p-6 rounded-xl border-none shadow-none">
                        <h3 className="text-xl font-bold text-foreground mb-4 z-10">Completeness Breakdown</h3>
                        <div className="w-full relative z-10 flex-1 flex items-center justify-center">
                          <ChartContainer
                            config={completenessChartConfig}
                            className="mx-auto aspect-square w-full max-h-[220px]"
                          >
                            <RadialBarChart
                              data={completenessBreakdownData}
                              startAngle={90}
                              endAngle={-270}
                              innerRadius={30}
                              outerRadius={110}
                            >
                              <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="var(--border)"
                                strokeOpacity={0.3}
                              />
                              <RadialBar
                                dataKey="value"
                                background={{ fill: "var(--muted)" }}
                                cornerRadius={5}
                                maxBarSize={20}
                                label={{
                                  position: "insideStart",
                                  fill: "#fff",
                                  fontSize: 9,
                                  fontWeight: 700,
                                  formatter: (value: number, entry: any) => {
                                    const item = completenessBreakdownData.find(d => d.value === value)
                                    return item ? `${item.name}: ${value}%` : `${value}%`
                                  }
                                }}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null
                                  const data = payload[0]?.payload
                                  return (
                                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                                      <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data?.fill }} />
                                        <span className="text-sm font-medium text-foreground">{data?.name}</span>
                                        <span className="text-sm font-bold text-foreground ml-auto">{data?.value}%</span>
                                      </div>
                                    </div>
                                  )
                                }}
                              />
                            </RadialBarChart>
                          </ChartContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center z-10">
                          {[
                            { name: "Basic Info", color: "#f97316" },
                            { name: "Resume", color: "#ec4899" },
                            { name: "Skills", color: "#3b82f6" },
                            { name: "Education", color: "#10b981" },
                            { name: "Experience", color: "#f59e0b" },
                            { name: "Preferences", color: "#a855f7" },
                            { name: "Peer Learning", color: "#06b6d4" },
                          ].map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-xs text-muted-foreground">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                    trackers={
                      <Card className="h-full p-6 bg-linear-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-between border-none shadow-none">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <CheckCircle2 className="w-24 h-24 text-emerald-500 rotate-12" />
                        </div>
                        <div className="absolute top-6 left-6 z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Resume Score</h3>
                          </div>
                        </div>
                        <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                           <div className="flex items-baseline justify-end gap-1">
                             <span className="text-6xl font-black text-foreground tracking-tighter">
                              {profileOverview?.resume_score !== null && profileOverview?.resume_score !== undefined
                                ? profileOverview.resume_score
                                : "N/A"}
                            </span>
                             <span className="text-xl font-medium text-muted-foreground">/100</span>
                          </div>
                           <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                            {profileOverview?.resume_score ? "ATS Optimized" : "Upload to score"}
                          </p>
                        </div>
                      </Card>
                    }
                    statistic={
                       <Card className="h-full p-6 bg-linear-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-between border-none shadow-none">
                         <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <GraduationCap className="w-24 h-24 text-orange-500 rotate-12" />
                         </div>
                         <div className="absolute top-6 left-6 z-10">
                           <div className="flex items-center gap-2 mb-1">
                             <div className="p-1.5 rounded-lg bg-orange-500/20">
                               <GraduationCap className="w-4 h-4 text-orange-500" />
                             </div>
                             <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Level</h3>
                           </div>
                         </div>
                          <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                            <p className="text-4xl font-black text-foreground tracking-tight capitalize">{profileSummary?.current_level || "Junior"}</p>
                          </div>
                      </Card>
                    }
                    focus={
                       <Card className="h-full p-6 bg-linear-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-between border-none shadow-none">
                         <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Briefcase className="w-24 h-24 text-blue-500 rotate-12" />
                         </div>
                         <div className="absolute top-6 left-6 z-10">
                           <div className="flex items-center gap-2 mb-1">
                             <div className="p-1.5 rounded-lg bg-blue-500/20">
                               <Briefcase className="w-4 h-4 text-blue-500" />
                             </div>
                             <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Experience</h3>
                           </div>
                         </div>
                          <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                            <p className="text-5xl font-black text-foreground tracking-tighter">{quickStats?.years_of_experience || 0}<span className="text-2xl font-bold text-muted-foreground ml-1">Yrs</span></p>
                          </div>
                      </Card>
                    }
                    productivity={
                       <Card className="h-full p-6 bg-linear-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-between border-none shadow-none">
                         <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-24 h-24 text-purple-500 rotate-12" />
                         </div>
                         <div className="absolute top-6 left-6 z-10">
                           <div className="flex items-center gap-2 mb-1">
                             <div className="p-1.5 rounded-lg bg-purple-500/20">
                               <Sparkles className="w-4 h-4 text-purple-500" />
                             </div>
                             <h3 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">Skills</h3>
                           </div>
                         </div>
                          <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                            <p className="text-5xl font-black text-foreground tracking-tighter">{quickStats?.total_skills || 0}<span className="text-2xl font-bold text-muted-foreground ml-1">Total</span></p>
                          </div>
                      </Card>
                    }
                    shortcuts={
                      <Card className="h-full p-6 bg-card/50 backdrop-blur-sm flex flex-col justify-center relative overflow-hidden cursor-pointer hover:bg-card/80 transition-all border-none shadow-none" onClick={() => router.push("/resume-builder")}>
                         <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-primary/10 to-transparent" />
                         <div className="relative z-10 flex items-center justify-between">
                            <div>
                               <h3 className="font-bold text-foreground text-lg mb-1">Build Targeted Resume</h3>
                               <p className="text-sm text-muted-foreground">Create a personalized resume for your dream role instantly.</p>
                            </div>
                            <div className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                               <ArrowUpRight className="w-5 h-5" />
                            </div>
                         </div>
                      </Card>
                    }
                  />
                </section>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column (2/3 width) */}
                  <div className="lg:col-span-2 space-y-8">

                    {/* Recommended Career Paths - Graph (cards moved to Opportunities page) */}
                    {careerDashboard?.recommended_career_paths && careerDashboard.recommended_career_paths.length > 0 && (
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                              <Rocket className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Recommended Career Paths</h2>
                          </div>
                          <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI-Powered
                          </span>
                        </div>

                        {/* Career Match Chart */}
                        <Card className="p-6 bg-card/50 backdrop-blur-sm mb-6 border-none shadow-none">
                          <h3 className="text-lg font-semibold mb-4 text-foreground">Match Score Analysis</h3>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={careerPathsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" horizontal={true} vertical={false} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: "hsl(var(--color-muted-foreground))" }} />
                                <Tooltip
                                  cursor={{ fill: 'transparent' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                                          <p className="font-bold text-foreground">{data.fullName}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Match Score: <span className="font-bold text-primary">{data.matchScore}%</span>
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="matchScore" radius={[0, 4, 4, 0]} barSize={24}>
                                  {careerPathsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>

                      </section>
                    )}

                    {/* Career Trajectory Timeline */}
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Calendar className="w-5 h-5 text-orange-500" />
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">Your Career Trajectory</h2>
                        </div>

                        <Card className="p-8 bg-card/50 backdrop-blur-sm relative overflow-hidden border-none shadow-none">
                          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-50" />

                          <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[28px] top-4 bottom-4 w-0.5 bg-border" />

                            <div className="space-y-10">
                              {/* Short Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                  <Clock className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-400">Short Term</span>
                                    <span className="text-xs text-muted-foreground">6-12 months</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard?.career_trajectory?.short_term_goal || "Complete your profile to get AI-powered career goals"}</h4>
                                  <p className="text-sm text-muted-foreground">Focus on building foundational skills and gaining initial experience in your target domain.</p>
                                </div>
                              </div>

                              {/* Medium Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                  <TrendingUp className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400">Medium Term</span>
                                    <span className="text-xs text-muted-foreground">1-2 years</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard?.career_trajectory?.medium_term_goal || "Upload your resume for personalized trajectory"}</h4>
                                  <p className="text-sm text-muted-foreground">Expand your responsibilities, take on leadership in smaller projects, and specialize further.</p>
                                </div>
                              </div>

                              {/* Long Term */}
                              <div className="relative flex items-start gap-6 group">
                                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-card shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform">
                                  <Rocket className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1 pt-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400">Long Term</span>
                                    <span className="text-xs text-muted-foreground">3-5 years</span>
                                  </div>
                                  <h4 className="text-lg font-bold text-foreground mb-2">{careerDashboard?.career_trajectory?.long_term_vision || "Your long-term vision will appear here"}</h4>
                                  <p className="text-sm text-muted-foreground">Achieve a senior or lead role, driving major initiatives and mentoring others in the field.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </section>

                  </div>

                  {/* Right Column (1/3 width) */}
                  <div className="space-y-8">

                    {/* Skills Radar Chart */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-pink-500/10">
                          <Brain className="w-5 h-5 text-pink-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Skills Profile</h2>
                      </div>

                      <div className="p-4 bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-none border-none">
                        <SkillsRadar data={skillHeatmapData} />
                      </div>
                    </section>

                    {/* Trending Roles 2026 */}
                      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Flame className="w-5 h-5 text-orange-500" />
                          </div>
                          <h2 className="text-xl font-bold text-foreground">Trending Roles</h2>
                        </div>

                        <div className="space-y-4">
                          {(careerDashboard?.trending_roles_2026 && careerDashboard.trending_roles_2026.length > 0
                            ? careerDashboard.trending_roles_2026.slice(0, 3)
                            : [
                                { title: "AI/ML Engineer", demand_level: "Very High", why_trending: "Explosion of AI applications across all industries" },
                                { title: "Cloud Solutions Architect", demand_level: "Very High", why_trending: "Continued cloud migration and multi-cloud strategies" },
                                { title: "Cybersecurity Engineer", demand_level: "High", why_trending: "Rising cyber threats and compliance requirements" },
                              ]
                          ).map((role, idx) => (
                            <Card
                              key={idx}
                              className="p-4 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all border-none shadow-none"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {idx === 0 ? <Cpu className="w-5 h-5 text-orange-500" /> :
                                    idx === 1 ? <Cloud className="w-5 h-5 text-orange-500" /> :
                                      <Code className="w-5 h-5 text-orange-500" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground text-sm">{role.title}</h4>
                                  <div className="flex items-center gap-2 mt-1 mb-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${role.demand_level === 'Very High' ? 'bg-red-500/10 text-red-600' :
                                      'bg-orange-500/10 text-orange-600'
                                      }`}>
                                      {role.demand_level} Demand
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{role.why_trending}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </section>

                  </div>
                </div>

                {/* Your Next Steps CTAs - full-width section */}
                <section className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Your Next Steps</h3>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="p-6 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl border-none shadow-none">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">1</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Build Your Targeted Resume</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create a personalized resume for your designated job role
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" onClick={() => router.push("/resume-builder")}>
                        Start Building <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl border-none shadow-none">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">2</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Build Your Portfolio</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create 2-3 projects showcasing your best work
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline" onClick={() => router.push("/portfolio")}>
                        Create Portfolio <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl border-none shadow-none">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">3</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">Practice Interviews</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Practice mock interviews before real ones
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline"
                        onClick={() => window.location.href = "https://hacksync-interview.vercel.app/"}
                      >
                        Start Practice <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>

                    <Card className="p-6 bg-card/60 transition-colors flex flex-col gap-4 rounded-2xl border-none shadow-none">
                      <div className="flex items-start gap-5">
                        <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-xl">4</span>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">View Opportunities</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Maximize your opportunities of getting the perfect job
                          </p>
                        </div>
                      </div>
                      <Button className="w-full mt-auto gap-2" variant="outline" onClick={() => router.push("/opportunities")}>
                        Find Jobs <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Card>
                  </div>
                </section>

                {/* Data Sources Footer */}
                {careerDashboard?.data_sources && (
                  <div className="mt-12 text-center text-sm text-muted-foreground pt-6">
                    <p className="flex items-center justify-center gap-2">
                      <Database className="w-3 h-3" />
                      Insights generated from: {careerDashboard.data_sources.join(" • ")}
                    </p>
                    <p className="mt-2 text-xs opacity-70">
                      Last updated: {dashboardData?.generated_at ? new Date(dashboardData.generated_at).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
