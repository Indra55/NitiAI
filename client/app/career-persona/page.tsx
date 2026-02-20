"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import "@/app/dashboard/dashboard.css"

export default function CareerPersonaPage() {
  const persona = {
    archetype: "The Innovator",
    tagline: "You're curious, driven by impact, and love solving complex problems",
    strengths: [
      "Technical Problem Solving",
      "Cross-functional Collaboration",
      "Continuous Learning",
      "Leadership Potential",
    ],
    idealRoles: ["AI/ML Engineer", "Tech Lead", "Product Manager", "Innovation Strategist"],
    nextSteps: [
      {
        step: 1,
        title: "Complete Your Learning Path",
        description: "Finish 2 of the 3 phases to master your target skills",
      },
      {
        step: 2,
        title: "Build Your Portfolio",
        description: "Create 2-3 projects showcasing your best work",
      },
      {
        step: 3,
        title: "Land Interviews",
        description: "Practice 10 mock interviews before real ones",
      },
      {
        step: 4,
        title: "Negotiate Offer",
        description: "Use our salary guides and negotiation tips",
      },
    ],
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">Career Persona</h1>
              </div>
              <p className="text-muted-foreground">
                Discover your professional identity and ideal career environments
              </p>
            </section>

            {/* Persona Card */}
            <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{persona.archetype}</h2>
                <p className="text-xl text-muted-foreground">{persona.tagline}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Your Strengths
                  </h3>
                  <div className="space-y-3">
                    {persona.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-foreground">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Ideal Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.idealRoles.map((role, idx) => (
                      <Badge key={idx} className="bg-primary/20 text-primary text-sm py-2 px-4">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Your Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {persona.nextSteps.map((step, idx) => (
                  <Card
                    key={idx}
                    className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                <Users className="w-5 h-5" />
                Explore Career Paths
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
