"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight } from "lucide-react"

export default function PeerLearningPage() {
  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Users className="w-4 h-4" />
              Community
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Peer Learning Circles
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Practice interviews with peers, join study groups, and grow together.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <Card className="p-8 border-border/40 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <h2 className="text-2xl font-display font-bold mb-6">Mock Interview Partners</h2>
              <p className="text-muted-foreground mb-6">Find peers at your level to practice interviews together.</p>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Find Partners <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h2 className="text-2xl font-display font-bold mb-6">Study Groups</h2>
              <p className="text-muted-foreground mb-6">
                Join focused groups working on system design, algorithms, and more.
              </p>
              <Button variant="outline" className="gap-2 border-border/40 hover:bg-primary/10 bg-transparent">
                Browse Groups <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>

          <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <h2 className="text-2xl font-display font-bold mb-6">Community Mentors</h2>
            <p className="text-muted-foreground mb-8">Get guidance from experienced professionals in your field.</p>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Meet Mentors <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
