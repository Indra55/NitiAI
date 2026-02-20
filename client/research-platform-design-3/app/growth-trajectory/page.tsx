"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Zap, Target, Calendar, CheckCircle2, Clock } from "lucide-react"

const trajectoryData = [
  { month: "Now", salary: 140, level: 3, marketDemand: 75 },
  { month: "3mo", salary: 148, level: 3.2, marketDemand: 78 },
  { month: "6mo", salary: 158, level: 3.5, marketDemand: 82 },
  { month: "9mo", salary: 172, level: 4, marketDemand: 85 },
  { month: "12mo", salary: 195, level: 4.3, marketDemand: 88 },
  { month: "18mo", salary: 220, level: 4.8, marketDemand: 90 },
  { month: "24mo", salary: 250, level: 5, marketDemand: 92 },
]

const milestones = [
  { date: "Jan 2025", event: "System Design Mastery", status: "current", impact: "Salary +$8K" },
  { date: "Mar 2025", event: "Leadership Certification", status: "upcoming", impact: "Level +0.3" },
  { date: "Jun 2025", event: "Promotion Ready", status: "upcoming", impact: "Salary +$28K" },
  { date: "Sep 2025", event: "Staff Engineer Track", status: "upcoming", impact: "Level +0.8" },
  { date: "Dec 2025", event: "Senior Leadership Role", status: "upcoming", impact: "Salary +$55K" },
]

export default function GrowthTrajectoryPage() {
  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2">Growth Trajectory Predictor</h1>
                <p className="text-muted-foreground font-medium">Your personalized career growth forecast</p>
              </div>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Zap className="w-4 h-4" />
                Update Forecast
              </Button>
            </div>

            {/* Key Projections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Projected Salary (24mo)",
                  value: "$250K",
                  change: "+$110K",
                  icon: TrendingUp,
                  color: "text-emerald-500",
                },
                {
                  label: "Career Level",
                  value: "5.0",
                  change: "+1.7 levels",
                  icon: Target,
                  color: "text-primary",
                },
                {
                  label: "Market Demand",
                  value: "92%",
                  change: "+17%",
                  icon: TrendingUp,
                  color: "text-blue-500",
                },
                {
                  label: "Promotion Timeline",
                  value: "9 months",
                  change: "-3 months optimized",
                  icon: Calendar,
                  color: "text-amber-500",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <Card key={idx} className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mb-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                      </div>
                      <Icon className={`w-6 h-6 ${stat.color} opacity-60`} />
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Salary & Level Trajectory */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Salary Trajectory
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
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
                    formatter={(value) => `$${value}K`}
                  />
                  <Area type="monotone" dataKey="salary" stroke="hsl(var(--color-primary))" fill="url(#colorSalary)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Career Level Growth
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trajectoryData}>
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
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="hsl(var(--color-secondary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--color-secondary))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </section>

          {/* Milestone Timeline */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Projected Milestones
              </h2>
              <div className="space-y-3">
                {milestones.map((milestone, idx) => {
                  const Icon = milestone.status === "current" ? CheckCircle2 : Clock
                  const statusColor =
                    milestone.status === "current"
                      ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-600 border-blue-500/30"

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border/30 hover:bg-card/60 transition-colors group"
                    >
                      <div className={`flex-shrink-0 p-2 rounded-lg border ${statusColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold group-hover:text-primary transition-colors">{milestone.event}</p>
                            <p className="text-sm text-muted-foreground">{milestone.date}</p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${statusColor}`}
                          >
                            {milestone.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </section>

          {/* Optimization Strategies */}
          <section className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Card className="p-6 border-border/40 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6">Acceleration Strategies</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    strategy: "Focus on Critical Skills",
                    impact: "Can accelerate promotion by 3 months",
                    effort: "High",
                  },
                  {
                    strategy: "Build Portfolio Projects",
                    impact: "Increases market value by 12%",
                    effort: "High",
                  },
                  {
                    strategy: "Secure Strategic Mentor",
                    impact: "Unlocks networking worth $15K",
                    effort: "Medium",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border/30 hover:bg-card/60 transition-colors">
                    <h3 className="font-bold mb-2">{item.strategy}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.impact}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">Effort: {item.effort}</span>
                      <Button size="sm" variant="outline" className="text-xs bg-transparent">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
