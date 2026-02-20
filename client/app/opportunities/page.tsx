 "use client"
 
 import Link from "next/link"
 import { DynamicNavbar } from "@/components/dynamic-navbar"
 import { ProtectedRoute } from "@/components/protected-route"
 import { Card } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Badge } from "@/components/ui/badge"
 import {
   ResponsiveContainer,
   BarChart,
   Bar,
   CartesianGrid,
   XAxis,
   YAxis,
   Tooltip,
   Cell,
 } from "recharts"
 import {
   Sparkles,
   Target,
   TrendingUp,
   DollarSign,
   Clock,
   Layers,
   AlertCircle,
   ArrowRight,
 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
 import "@/app/dashboard/dashboard.css"
 import {
   getDashboardData,
   type DashboardData,
 } from "@/lib/api"
import { toaster } from "@/lib/toaster"
 import { useCallback, useEffect, useState } from "react"
 
 export default function OpportunitiesPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dashboardResult = await getDashboardData()

        if (dashboardResult.data) {
          setDashboardData(dashboardResult.data)
        } else if (dashboardResult.error) {
          console.error("Dashboard API error (opportunities):", dashboardResult.error)
          setError(dashboardResult.error)
          toaster.create({
            title: "Opportunities Error",
            description: dashboardResult.error,
            type: "error"
          })
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data (opportunities):", err)
        setError("Failed to load opportunities. Please try again.")
        toaster.create({
          title: "Load Error",
          description: "Failed to load opportunities.",
          type: "error"
        })
      } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const careerDashboard = dashboardData?.career_dashboard

  const careerPathsData = careerDashboard?.recommended_career_paths?.map(path => ({
    name: path.title.length > 20 ? path.title.substring(0, 18) + "..." : path.title,
    fullName: path.title,
    matchScore: path.match_score,
    fill: path.match_score >= 90 ? "#10b981" : path.match_score >= 80 ? "#3b82f6" : "#f59e0b",
  })) || []

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2 text-foreground">Personalized Opportunities Feed</h1>
                  <p className="text-muted-foreground font-medium">
                    Role matches curated just for your profile and timeline
                  </p>
                </div>
              </div>
            </section>



            {loading ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="size-16" />
                  <p className="text-muted-foreground">Loading personalized opportunities...</p>
                </div>
              </div>
            ) : careerDashboard?.recommended_career_paths && careerDashboard.recommended_career_paths.length > 0 ? (
              <>
                {/* Career Match Chart (moved from dashboard) */}
                <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Match Score Analysis</h3>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI-Powered
                    </span>
                  </div>
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
                                  <p className="text-sm text-muted-foreground">Match Score: <span className="font-bold text-primary">{data.matchScore}%</span></p>
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

                {/* Career Cards (moved from dashboard) */}
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  {careerDashboard.recommended_career_paths.map((path, idx) => (
                    <Card
                      key={idx}
                      className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {path.title}
                            </h3>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/20">
                                Top Pick
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{path.reasoning}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${path.match_score >= 90 ? 'bg-emerald-500/10 text-emerald-600' :
                            path.match_score >= 80 ? 'bg-blue-500/10 text-blue-600' :
                              'bg-amber-500/10 text-amber-600'
                            }`}>
                            <Target className="w-4 h-4" />
                            {path.match_score}% Match
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Salary Range</p>
                            <p className="text-sm font-semibold text-foreground">{path.salary_range}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Clock className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Transition Time</p>
                            <p className="text-sm font-semibold text-foreground">{path.estimated_transition_time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Growth Outlook</p>
                            <p className="text-sm font-semibold text-foreground">{path.growth_outlook}</p>
                          </div>
                        </div>
                      </div>

                      {path.skill_gaps && path.skill_gaps.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Skills to Develop:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {path.skill_gaps.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2.5 py-1 text-xs font-medium bg-background border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Find Jobs CTA */}
                      <div className="mt-6 flex justify-end">
                        <Link href="/linkedin-jobs">
                          <Button variant="outline" size="sm" className="gap-2">
                            Find Jobs
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </section>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-[30vh]">
                <p className="text-muted-foreground text-sm">
                  No personalized opportunities available yet. Complete your profile to unlock AI-powered recommendations.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
