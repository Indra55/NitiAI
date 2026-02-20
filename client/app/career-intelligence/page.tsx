"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InsightCard } from "@/components/insight-card"
import { Brain, Zap } from "lucide-react"
import "@/app/dashboard/dashboard.css"

const careerIntelligence = [
  {
    title: "Your Optimal Career Path",
    description: "Based on your skills and market trends",
    insight:
      "Senior SDE roles show 34% growth in next 12 months. Your system design skills match 85% of requirements. Next milestone: Master distributed systems.",
    actionLabel: "View Path",
  },
  {
    title: "Market Opportunity Alert",
    description: "Emerging roles that match your profile",
    insight:
      "AI/ML Infrastructure roles are hiring 3.2x faster. You're 72% ready. Complete 2 specific projects to hit 92% readiness.",
    actionLabel: "Explore Opportunity",
  },
  {
    title: "Skill Gap Analysis",
    description: "What's keeping you from next level",
    insight:
      "Leadership communication is your gap (58% vs 78% target). Completing 3 specific modules brings you to 85%. Expected impact: +15% salary range.",
    actionLabel: "Start Learning",
  },
  {
    title: "Competitive Benchmark",
    description: "How you stack up in the market",
    insight:
      "You're in top 18% for technical skills. Your interview readiness (72%) is slightly below market (78%). Mock interviews boost this by 8%.",
    actionLabel: "Practice Interviews",
  },
  {
    title: "Salary Intelligence",
    description: "What you could earn with current progress",
    insight:
      "Your profile matches $180-220K range. Next promotion potential adds $25-35K. Filling skill gaps unlocks additional $15-20K premium.",
    actionLabel: "View Details",
  },
  {
    title: "Networking Strategy",
    description: "High-leverage connections for your goals",
    insight:
      "3 key influencers in your target companies. 5 peers with complementary skills for collaboration. 12 mentors matching your career stage.",
    actionLabel: "Find Connections",
  },
]

export default function CareerIntelligencePage() {
  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2 text-foreground">Career Intelligence Center</h1>
                  <p className="text-muted-foreground font-medium">
                    AI-powered insights to accelerate your career growth
                  </p>
                </div>
              </div>
            </section>

            {/* Intelligence Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {careerIntelligence.map((item, idx) => (
                <div
                  key={idx}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${100 * idx}ms` }}
                >
                  <InsightCard {...item} />
                </div>
              ))}
            </section>

            {/* Advanced Recommendations */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <Card className="p-8 border-border/40 bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1 text-foreground">AI-Powered Recommendations</h2>
                    <p className="text-muted-foreground">
                      Personalized actions based on your unique profile and market data
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      priority: "Critical",
                      action: "Complete System Design Deep Dive",
                      impact: "Unlocks $25K+ salary range",
                      timeframe: "8 weeks",
                      color: "bg-red-500/20 text-red-600 border-red-500/30",
                    },
                    {
                      priority: "High",
                      action: "Record 5 Mock Interviews",
                      impact: "Increases readiness score 15%",
                      timeframe: "4 weeks",
                      color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
                    },
                    {
                      priority: "Medium",
                      action: "Build Distributed Systems Project",
                      impact: "Adds portfolio strength",
                      timeframe: "12 weeks",
                      color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
                    },
                    {
                      priority: "Medium",
                      action: "Connect with 3 Target Mentors",
                      impact: "Accelerates growth by 25%",
                      timeframe: "2 weeks",
                      color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
                    },
                  ].map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/30 hover:bg-card/60 transition-colors cursor-pointer group"
                    >
                      <div className={`inline-block mb-3 px-2.5 py-1 rounded text-xs font-bold border ${rec.color}`}>
                        {rec.priority}
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors text-foreground">{rec.action}</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Impact:</span> {rec.impact}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Timeline:</span> {rec.timeframe}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Updates every week with new market data and your progress
                  </p>
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    <Zap className="w-4 h-4" />
                    Generate Full Report
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
