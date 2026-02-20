"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Brain, TrendingUp, Zap, Target, CheckCircle2 } from "lucide-react"

const performanceData = {
  overall: 78,
  interview: 72,
  technical: 88,
  communication: 65,
  leadership: 52,
}

const strengthsWeaknessesData = [
  { category: "System Design", score: 88, benchmark: 75 },
  { category: "Algorithm Skills", score: 85, benchmark: 72 },
  { category: "Communication", score: 65, benchmark: 70 },
  { category: "Leadership", score: 52, benchmark: 68 },
  { category: "Negotiation", score: 38, benchmark: 55 },
]

const insightsList = [
  {
    category: "Strength",
    title: "Technical Excellence",
    description: "Your system design and algorithm skills are in the top 15% of candidates",
    action: "Leverage in interviews",
  },
  {
    category: "Opportunity",
    title: "Communication Gap",
    description: "Communication skills 5% below target. Impacts leadership perception.",
    action: "Take communication course",
  },
  {
    category: "Opportunity",
    title: "Leadership Readiness",
    description: "Leadership assessment shows 16% gap to senior level expectations",
    action: "Complete leadership program",
  },
  {
    category: "Strength",
    title: "Problem Solving",
    description: "Top-tier problem solving ability. Natural architect mindset.",
    action: "Focus on system design roles",
  },
]

const pieData = [
  { name: "Mastered", value: 35, color: "hsl(var(--color-primary))" },
  { name: "Proficient", value: 40, color: "hsl(var(--color-secondary))" },
  { name: "Learning", value: 20, color: "hsl(var(--color-accent))" },
  { name: "Beginning", value: 5, color: "hsl(var(--color-muted))" },
]

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2">Performance Insights & Analytics</h1>
                <p className="text-muted-foreground font-medium">
                  Deep analysis of your strengths and growth opportunities
                </p>
              </div>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Zap className="w-4 h-4" />
                Generate Report
              </Button>
            </div>

            {/* Overall Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Overall", value: performanceData.overall, color: "text-primary" },
                { label: "Interview Ready", value: performanceData.interview, color: "text-blue-500" },
                { label: "Technical", value: performanceData.technical, color: "text-emerald-500" },
                { label: "Communication", value: performanceData.communication, color: "text-amber-500" },
                { label: "Leadership", value: performanceData.leadership, color: "text-red-500" },
              ].map((metric) => (
                <Card key={metric.label} className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-2 uppercase">{metric.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}%</p>
                  </div>
                  <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metric.color.replace("text-", "bg-")} opacity-70`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Main Analytics Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* Strengths vs Weaknesses */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Performance Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={strengthsWeaknessesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis
                    dataKey="category"
                    stroke="hsl(var(--color-muted-foreground))"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="score" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="benchmark" fill="hsl(var(--color-secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Skills Breakdown */}
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Skills Mastery Distribution
              </h2>
              <div className="flex items-center justify-center h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Key Insights */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm mb-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI-Generated Insights
              </h2>
              <div className="space-y-4">
                {insightsList.map((insight, idx) => {
                  const categoryColor = {
                    Strength: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
                    Opportunity: "bg-amber-500/20 text-amber-600 border-amber-500/30",
                  }[insight.category]

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/30 hover:bg-card/60 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div
                            className={`inline-block px-2.5 py-1 rounded text-xs font-bold border mb-2 ${categoryColor}`}
                          >
                            {insight.category}
                          </div>
                          <h3 className="font-bold text-lg mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                        {insight.action}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-6 border-border/40 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Personalized Action Plan
              </h2>
              <div className="space-y-3">
                {[
                  {
                    priority: "Critical",
                    action: "Complete Communication Skills Course",
                    impact: "Expected improvement: +15%",
                    timeline: "4 weeks",
                  },
                  {
                    priority: "High",
                    action: "Leadership Development Program",
                    impact: "Expected improvement: +18%",
                    timeline: "12 weeks",
                  },
                  {
                    priority: "Medium",
                    action: "Practice Negotiation with Mock Scenarios",
                    impact: "Expected improvement: +22%",
                    timeline: "8 weeks",
                  },
                ].map((rec, idx) => {
                  const priorityColor = {
                    Critical: "bg-red-500/20 text-red-600 border-red-500/30",
                    High: "bg-amber-500/20 text-amber-600 border-amber-500/30",
                    Medium: "bg-blue-500/20 text-blue-600 border-blue-500/30",
                  }[rec.priority]

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/30 hover:bg-card/60 transition-colors flex items-start gap-4"
                    >
                      <div className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-bold border ${priorityColor}`}>
                        {rec.priority}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold mb-1">{rec.action}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{rec.impact}</span>
                          <span>{rec.timeline}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
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
