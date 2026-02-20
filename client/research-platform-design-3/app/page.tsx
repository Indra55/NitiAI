"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles, TrendingUp, Zap, Brain, Target } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Hero Section */}
          <section className="space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary hover:bg-primary/15 transition-all cursor-default">
              <TrendingUp className="w-4 h-4" />
              <span>Your Career Space</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-sans font-bold tracking-tight text-pretty leading-[1.1]">
                What should you focus on{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  right now?
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
                {user?.name
                  ? `You're early in your journey, ${user.name.split(" ")[0]}. Let's explore directions that match how you think and what you know.`
                  : "Let's explore directions that match how you think and what you know."}
              </p>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Where You Are Card */}
            <Card className="lg:col-span-1 p-8 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 w-fit text-sm font-medium text-primary">
                  <TrendingUp className="w-4 h-4" />
                  Current Position
                </div>
                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">Where You Are</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You're exploring technical and analytical paths. Your interests span distributed systems, algorithm
                  design, and problem-solving methodologies.
                </p>
                <div className="pt-4 flex gap-2 flex-wrap">
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-sm font-medium border border-primary/20">
                    Technical focus
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 text-secondary text-sm font-medium border border-secondary/20">
                    Early career
                  </div>
                </div>
              </div>
            </Card>

            {/* What Matters Next Card */}
            <Card className="lg:col-span-1 p-8 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 w-fit text-sm font-medium text-secondary">
                  <Sparkles className="w-4 h-4" />
                  Next Actions
                </div>
                <h2 className="text-2xl font-bold">What Matters Next</h2>
                <div className="space-y-3">
                  <Link href="/career-path">
                    <Button className="w-full justify-start gap-3 h-auto py-3.5 px-4 group hover:gap-4 transition-all bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white font-medium">
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      <span className="text-left flex-1">Explore suitable career directions</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href="/resume">
                    <Button className="w-full justify-start gap-3 h-auto py-3.5 px-4 group hover:gap-4 transition-all bg-gradient-to-r from-secondary to-primary hover:shadow-lg text-white font-medium">
                      <Sparkles className="w-5 h-5 flex-shrink-0" />
                      <span className="text-left flex-1">Improve resume clarity</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Longer-term path section */}
          <section className="border-t border-border/40 pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-3">When you're ready</h2>
              <p className="text-muted-foreground text-lg">
                Explore advanced features to accelerate your career growth
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Dashboard",
                  description: "See your complete career analytics in real-time.",
                  href: "/dashboard",
                  icon: TrendingUp,
                  gradient: "from-primary/20 to-accent/20",
                },
                {
                  title: "Skill Gap Analyzer",
                  description: "Identify gaps and accelerate your growth strategically.",
                  href: "/skill-gap",
                  icon: Brain,
                  gradient: "from-secondary/20 to-primary/20",
                },
                {
                  title: "Growth Trajectory",
                  description: "Your personalized career growth forecast.",
                  href: "/growth-trajectory",
                  icon: Target,
                  gradient: "from-accent/20 to-secondary/20",
                },
                {
                  title: "Opportunities Feed",
                  description: "Role matches curated just for your profile.",
                  href: "/opportunities",
                  icon: Zap,
                  gradient: "from-primary/20 to-secondary/20",
                },
                {
                  title: "Performance Insights",
                  description: "Deep analysis of strengths and growth opportunities.",
                  href: "/insights",
                  icon: TrendingUp,
                  gradient: "from-secondary/20 to-accent/20",
                },
                {
                  title: "Career Intelligence",
                  description: "AI-powered insights to accelerate growth.",
                  href: "/career-intelligence",
                  icon: Brain,
                  gradient: "from-accent/20 to-primary/20",
                },
                {
                  title: "Career Persona",
                  description: "See yourself clearly and your ideal environments.",
                  href: "/persona",
                  icon: Sparkles,
                  gradient: "from-primary/20 to-accent/20",
                },
                {
                  title: "Portfolio Builder",
                  description: "Showcase your best work with impact metrics.",
                  href: "/portfolio",
                  icon: Zap,
                  gradient: "from-secondary/20 to-primary/20",
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.title}
                    className={`p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:scale-[1.05] animate-in fade-in slide-in-from-bottom-4`}
                    style={{ animationDelay: `${300 + idx * 50}ms` }}
                  >
                    <Link href={item.href} className="block h-full">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary font-medium gap-2 group-hover:gap-3 transition-all"
                      >
                        Learn more <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
