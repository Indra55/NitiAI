"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowRight } from "lucide-react"

export default function TrendsPage() {
  const trends = [
    {
      role: "AI/ML Engineer",
      demand: "↑ 87%",
      salary: "$180K - $250K",
      insight: "Highest demand growth in 2024",
    },
    {
      role: "Cloud Architect",
      demand: "↑ 64%",
      salary: "$160K - $220K",
      insight: "Multi-cloud expertise highly valued",
    },
    {
      role: "DevOps Engineer",
      demand: "↑ 52%",
      salary: "$140K - $190K",
      insight: "Stable demand, strong growth",
    },
    {
      role: "Product Manager",
      demand: "↑ 41%",
      salary: "$150K - $230K",
      insight: "Tech experience increasingly required",
    },
  ]

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <TrendingUp className="w-4 h-4" />
              Market Insights
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Job Market Trends
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Real-time insights on role demand, salaries, and industry shifts.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.map((trend, i) => (
              <Card
                key={i}
                className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${100 + i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display text-lg font-bold">{trend.role}</h3>
                  <span className="text-primary font-bold text-lg">{trend.demand}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                  <p className="font-semibold mb-4">{trend.salary}</p>
                  <p className="text-sm text-muted-foreground italic">{trend.insight}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Explore All Trends <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
