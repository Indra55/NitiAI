"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface Trend {
  id: string
  title: string
  description: string
  growth: string
  relevance: string
  skills: string[]
  insight: string
}

export default function JobTrends() {
  const [trends] = useState<Trend[]>([
    {
      id: "ai-roles",
      title: "AI & Machine Learning Roles Surging",
      description: "Roles combining AI expertise with domain knowledge are growing 3x faster than traditional roles",
      growth: "↑ 150% growth over 2 years",
      relevance: "💡 High match for your profile",
      skills: ["Python", "ML Frameworks", "Data Science", "System Design"],
      insight:
        "Companies are shifting from pure ML to applied AI roles. Your technical foundation positions you perfectly for hybrid roles that blend domain expertise with AI.",
    },
    {
      id: "remote-first",
      title: "Remote-First Engineering Becomes Standard",
      description: "90% of tech companies now offer remote or flexible work arrangements",
      growth: "↑ Permanent shift",
      relevance: "✓ Relevant to all roles",
      skills: ["Async Communication", "Self-Direction", "Distributed Systems"],
      insight:
        "Geographic boundaries are disappearing. Your location is no longer a limiting factor. Focus on demonstrating strong async communication and self-motivation.",
    },
    {
      id: "fullstack-demand",
      title: "Full-Stack Skills Premium Rising",
      description: "Startups increasingly value engineers who span frontend, backend, and DevOps",
      growth: "↑ 45% salary premium",
      relevance: "🔍 Emerging opportunity",
      skills: ["Frontend", "Backend", "DevOps", "Database Design"],
      insight:
        "Full-stack capabilities command higher salaries and faster promotion. Consider building end-to-end project examples in your portfolio.",
    },
    {
      id: "security-skills",
      title: "Security-First Architecture Required",
      description: "Security expertise is becoming non-negotiable for all backend and DevOps roles",
      growth: "↑ 200% demand",
      relevance: "📈 Strong opportunity",
      skills: ["Authentication", "Encryption", "Compliance", "Security Audits"],
      insight:
        "Every engineer now needs security literacy. Adding security certifications or projects will significantly boost your marketability.",
    },
  ])

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Market Intelligence</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Where the job market is heading</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Stay informed about emerging opportunities and evolving market demands. Context beats noise.
          </p>
        </div>

        {/* Trends */}
        <div className="space-y-6 mb-16">
          {trends.map((trend) => (
            <div
              key={trend.id}
              className="group bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:border-accent/50 hover:bg-gradient-to-br hover:from-foreground/15 hover:to-foreground/8 transition-all duration-300"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-foreground mb-2">{trend.title}</h3>
                <p className="text-foreground/70 text-lg">{trend.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-foreground/20">
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">Market Growth</p>
                  <p className="text-accent font-semibold">{trend.growth}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">For You</p>
                  <p className="text-foreground/80">{trend.relevance}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">Key Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {trend.skills.slice(0, 2).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded text-xs bg-accent/20 text-accent font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-accent mb-2">💡 My Take</p>
                <p className="text-foreground/80 text-sm leading-relaxed">{trend.insight}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {trend.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs bg-foreground/10 text-foreground/80 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/40 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm mb-16">
          <h3 className="text-3xl font-light text-foreground mb-4">You've completed your journey</h3>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            You now have a clear roadmap. Your next steps are set. Check your progress dashboard anytime to stay on
            track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/journey/progress-dashboard">
              <MagneticButton size="lg" variant="primary">
                View Progress Dashboard
              </MagneticButton>
            </Link>
            <Link href="/">
              <MagneticButton size="lg" variant="secondary">
                Back Home
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
