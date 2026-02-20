"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function PersonaPage() {
  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              Know Yourself
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Your Career Persona
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Understand your strengths, work style, and ideal environments.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 border-border/40 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <h2 className="text-2xl font-display font-bold mb-4">Your Profile</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Work Style</p>
                  <p className="text-lg font-semibold">Collaborative Problem-Solver</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Strength</p>
                  <p className="text-lg font-semibold">Systems Thinking</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Growth Area</p>
                  <p className="text-lg font-semibold">Strategic Communication</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h2 className="text-2xl font-display font-bold mb-4">Ideal Environment</h2>
              <ul className="space-y-3">
                {[
                  "Fast-paced, innovative teams",
                  "Clear documentation and processes",
                  "Continuous learning opportunities",
                  "Impact on product decisions",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Generate Your Full Persona <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </ProtectedRoute>
  )
}
