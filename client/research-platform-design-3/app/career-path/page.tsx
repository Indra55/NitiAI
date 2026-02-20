"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

const careerPaths = [
  {
    title: "Software Engineer",
    description:
      "People with similar skills often grow into product engineering, infrastructure roles, or technical leadership.",
    fit: "This path values curiosity over experience",
    skills: ["System Design", "Problem Solving", "Technical Communication"],
    growth: "In 3-5 years, you could lead architecture decisions or mentor teams",
  },
  {
    title: "Product Manager",
    description: "Your analytical thinking translates well to product strategy and user-focused decision making.",
    fit: "This path values leadership and strategic thinking",
    skills: ["Strategic Planning", "User Research", "Data Analysis"],
    growth: "Progress to senior PM or Director of Product within 5 years",
  },
  {
    title: "Solutions Architect",
    description: "Bridge technical expertise with business needs. Guide clients through complex implementations.",
    fit: "This path values communication and domain expertise",
    skills: ["Technical Communication", "Architecture Design", "Client Management"],
    growth: "Advance to Principal Architect or consulting leadership",
  },
  {
    title: "Research Scientist",
    description: "Dive deep into cutting-edge problems in AI, distributed systems, or computational theory.",
    fit: "This path values deep expertise and innovation",
    skills: ["Research Methodology", "Advanced Mathematics", "Publication"],
    growth: "Lead research initiatives or start your own venture",
  },
]

export default function CareerPathPage() {
  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header */}
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Zap className="w-4 h-4" />
              Exploration, Not Suggestion
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Career Directions Worth Exploring
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Based on how you think and what you know, here are directions that align with your strengths and
              interests.
            </p>
          </section>

          {/* Career Paths */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {careerPaths.map((path, index) => (
              <Card
                key={index}
                className={`p-8 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-105 cursor-pointer group animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <div className="space-y-4">
                  <h2 className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
                    {path.title}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed">{path.description}</p>

                  <div className="pt-2">
                    <p className="text-sm font-medium text-primary italic">{path.fit}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/40">
                    <h4 className="text-sm font-semibold text-foreground">Your Growth Path</h4>
                    <p className="text-sm text-muted-foreground">{path.growth}</p>
                  </div>

                  <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 group-hover:shadow-lg transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <section className="mt-20 border-t border-border/40 pt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-3xl font-display font-bold mb-6">Not sure where to start?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take our career discovery assessment to get personalized recommendations.
            </p>
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Start Assessment <ArrowRight className="w-5 h-5" />
            </Button>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
