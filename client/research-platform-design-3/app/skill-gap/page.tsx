"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/progress-ring"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, TrendingUp, Target, Zap, BookOpen, Award } from "lucide-react"
import { useState } from "react"

const skillGapData = [
  {
    skill: "System Design",
    current: 78,
    target: 95,
    gap: 17,
    priority: "critical",
    resources: 8,
    timeframe: "8 weeks",
  },
  {
    skill: "Communication",
    current: 65,
    target: 85,
    gap: 20,
    priority: "high",
    resources: 5,
    timeframe: "6 weeks",
  },
  {
    skill: "Leadership",
    current: 52,
    target: 80,
    gap: 28,
    priority: "high",
    resources: 12,
    timeframe: "12 weeks",
  },
  {
    skill: "Technical Depth",
    current: 88,
    target: 95,
    gap: 7,
    priority: "medium",
    resources: 3,
    timeframe: "4 weeks",
  },
  {
    skill: "Product Thinking",
    current: 45,
    target: 75,
    gap: 30,
    priority: "medium",
    resources: 10,
    timeframe: "10 weeks",
  },
  {
    skill: "Negotiation",
    current: 38,
    target: 70,
    gap: 32,
    priority: "low",
    resources: 8,
    timeframe: "8 weeks",
  },
]

const chartData = skillGapData.map((s) => ({
  name: s.skill.substring(0, 10),
  current: s.current,
  target: s.target,
}))

const priorityConfig = {
  critical: { label: "Critical", color: "bg-red-500/20 text-red-600 border-red-500/30" },
  high: { label: "High", color: "bg-amber-500/20 text-amber-600 border-amber-500/30" },
  medium: { label: "Medium", color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  low: { label: "Low", color: "bg-slate-500/20 text-slate-600 border-slate-500/30" },
}

export default function SkillGapPage() {
  const [selectedSkill, setSelectedSkill] = useState(skillGapData[0])

  const overallGapScore = Math.round(100 - skillGapData.reduce((acc, s) => acc + s.current, 0) / skillGapData.length)
  const criticalSkills = skillGapData.filter((s) => s.priority === "critical").length

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2">Intelligent Skill Gap Analyzer</h1>
                <p className="text-muted-foreground font-medium">
                  Identify gaps and accelerate your growth strategically
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Critical Gaps</p>
                    <p className="text-2xl font-bold">{criticalSkills}</p>
                    <p className="text-xs text-red-600 mt-1">Need immediate attention</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Overall Gap Score</p>
                    <p className="text-2xl font-bold">{overallGapScore}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Distance from mastery</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Mastered Skills</p>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-xs text-emerald-600 mt-1">85%+ proficiency</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Skill Comparison Chart */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-primary" />
                  Current vs Target Skills
                </h2>
                <p className="text-sm text-muted-foreground">Your proficiency levels and growth targets</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--color-secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </section>

          {/* Detailed Skill Analysis */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* Skills List */}
            <div className="lg:col-span-1 space-y-2">
              {skillGapData.map((skill) => (
                <Card
                  key={skill.skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-4 border-border/40 backdrop-blur-sm cursor-pointer transition-all ${
                    selectedSkill.skill === skill.skill
                      ? "bg-primary/20 border-primary/50 shadow-lg"
                      : "bg-card/50 hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{skill.skill}</h3>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium border ${priorityConfig[skill.priority].color}`}
                    >
                      {priorityConfig[skill.priority].label}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{skill.current}%</span>
                    <div className="flex-1 mx-2 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${skill.current}%` }} />
                    </div>
                    <span>{skill.target}%</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Detailed Analysis */}
            <Card className="lg:col-span-2 p-6 border-border/40 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedSkill.skill}</h2>
                  <p className="text-muted-foreground">Comprehensive growth plan</p>
                </div>
                <ProgressRing percentage={selectedSkill.current} size={100} label="Current" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Current Level</p>
                  <p className="text-2xl font-bold">{selectedSkill.current}%</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs text-primary font-medium mb-1">Target Level</p>
                  <p className="text-2xl font-bold">{selectedSkill.target}%</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-xs text-amber-600 font-medium mb-1">Gap to Fill</p>
                  <p className="text-2xl font-bold">{selectedSkill.gap}%</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Timeframe</p>
                  <p className="text-lg font-bold">{selectedSkill.timeframe}</p>
                </div>
              </div>

              <div className="border-t border-border/30 pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Recommended Learning Path
                </h3>
                <div className="space-y-3">
                  {[
                    { step: 1, title: "Foundation Concepts", duration: "2 weeks", resources: 3 },
                    { step: 2, title: "Deep Dive Theory", duration: "3 weeks", resources: 5 },
                    { step: 3, title: "Hands-on Projects", duration: "2 weeks", resources: 4 },
                    { step: 4, title: "Real-world Application", duration: "1 week", resources: 2 },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-4 p-3 rounded-lg border border-border/30 hover:bg-card/60 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.duration} • {item.resources} resources
                        </p>
                      </div>
                      <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full mt-6 gap-2 bg-primary hover:bg-primary/90">
                <Zap className="w-4 h-4" />
                Start Learning Path
              </Button>
            </Card>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
