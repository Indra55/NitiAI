"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, AlertCircle, FileText } from "lucide-react"

export default function ResumePage() {
  const feedback = [
    {
      title: "This works well because...",
      items: [
        "Your technical skills are clearly listed and relevant",
        "Project descriptions show impact and outcomes",
        "Format is clean and recruiter-friendly",
      ],
      icon: CheckCircle,
    },
    {
      title: "You might consider...",
      items: [
        "Adding quantifiable impact metrics (e.g., '5x performance improvement')",
        "Expanding your leadership examples",
        "Including specific technologies and frameworks",
      ],
      icon: AlertCircle,
    },
  ]

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header */}
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <FileText className="w-4 h-4" />
              Mentor Review, Not Grading
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Resume Review & Readiness
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Get feedback written like mentorship from a senior professional who's seen thousands of resumes.
            </p>
          </section>

          {/* Readiness Overview */}
          <Card className="p-8 mb-16 border-border/40 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold">Your Readiness</h2>
              <p className="text-lg text-foreground leading-relaxed">
                Your resume communicates skills clearly, but your impact can be stronger. Focus on quantifying results
                and emphasizing leadership moments.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <span className="text-3xl font-bold">75%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Ready for roles at</p>
                  <p className="text-xl font-bold">Senior Engineer, Tech Lead</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feedback Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {feedback.map((section, index) => {
              const Icon = section.icon
              return (
                <Card
                  key={index}
                  className={`p-8 border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4`}
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h3 className="text-xl font-display font-bold">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>

          {/* Action Section */}
          <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Next Steps</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {num}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">
                        {num === 1
                          ? "Add quantifiable metrics"
                          : num === 2
                            ? "Highlight leadership"
                            : "Update technologies"}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {num === 1
                          ? 'Transform "improved performance" into "reduced load time by 40%"'
                          : num === 2
                            ? "Add a section showcasing mentorship or team leadership moments"
                            : "Include recent frameworks and tools relevant to your target roles"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Edit Your Resume <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
