"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Target } from "lucide-react"

export default function LearningPage() {
  const primarySkill = {
    name: "System Design & Distributed Systems",
    why: "This will unlock roles at senior engineer levels and set you up for architecture positions.",
    duration: "8-12 weeks of focused study",
    outcome: "You'll be able to design scalable systems, interview confidently, and architect solutions at scale.",
  }

  const secondarySkill = {
    name: "Advanced Data Structures",
    why: "Complements your system design knowledge and strengthens algorithm interview performance.",
    duration: "4-6 weeks",
    outcome: "Master complex data structures used in real-world systems.",
  }

  const resources = [
    { title: "Designing Data-Intensive Applications", time: "12 weeks", type: "Book" },
    { title: "System Design Interview Course", time: "10 weeks", type: "Course" },
    { title: "AlgoExpert - Advanced Structures", time: "6 weeks", type: "Practice" },
  ]

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header */}
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Target className="w-4 h-4" />
              Clear Next Steps
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              What Should You Learn Next?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Not everything. Just what makes the biggest difference for you right now.
            </p>
          </section>

          {/* Primary Skill */}
          <Card className="p-8 mb-8 border-border/40 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-sm border-primary/30 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary mb-2">PRIMARY FOCUS</p>
                  <h2 className="text-3xl font-display font-bold">{primarySkill.name}</h2>
                </div>
              </div>

              <p className="text-lg text-foreground leading-relaxed">{primarySkill.why}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Time Commitment</p>
                    <p className="text-muted-foreground text-sm">{primarySkill.duration}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">After You Learn It</p>
                    <p className="text-muted-foreground text-sm">{primarySkill.outcome}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Secondary Skill */}
          <Card className="p-6 mb-16 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">OPTIONAL - SECONDARY FOCUS</p>
                  <h3 className="text-xl font-display font-bold">{secondarySkill.name}</h3>
                </div>
              </div>
              <p className="text-foreground">{secondarySkill.why}</p>
              <div className="flex gap-6 text-sm">
                <span className="text-muted-foreground">{secondarySkill.duration}</span>
              </div>
            </div>
          </Card>

          {/* Recommended Resources */}
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold">Recommended Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <Card
                  key={index}
                  className={`p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all hover:shadow-lg hover:scale-105 animate-in fade-in slide-in-from-bottom-4`}
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-bold flex-1">{resource.title}</h3>
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
                        {resource.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {resource.time}
                    </p>
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent hover:bg-primary/10">
                      Explore <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Create Your Learning Plan <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
