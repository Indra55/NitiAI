"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface CareerPath {
  id: string
  title: string
  description: string
  growth: "🔥 Fast Growing" | "🌱 Emerging" | "📈 Stable"
  matchPercentage: number
  salary: string
  outlook: string
  skills: string[]
  icon: string
}

export default function CareerPathRecommender() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const careerPaths: CareerPath[] = [
    {
      id: "ai-ml-engineer",
      title: "AI/ML Engineer",
      description: "Build intelligent systems that learn and adapt",
      growth: "🔥 Fast Growing",
      matchPercentage: 92,
      salary: "$120K - $180K",
      outlook: "Growing 35% faster than average roles",
      skills: ["Python", "Machine Learning", "Data Analysis"],
      icon: "🤖",
    },
    {
      id: "product-manager",
      title: "Product Manager",
      description: "Lead product strategy and team execution",
      growth: "📈 Stable",
      matchPercentage: 85,
      salary: "$110K - $160K",
      outlook: "Consistent demand across all industries",
      skills: ["Strategy", "Leadership", "Analytics"],
      icon: "📱",
    },
    {
      id: "data-analyst",
      title: "Data Analyst",
      description: "Transform data into actionable insights",
      growth: "🔥 Fast Growing",
      matchPercentage: 88,
      salary: "$90K - $140K",
      outlook: "Growing 25% faster than average roles",
      skills: ["SQL", "Python", "Tableau/Power BI"],
      icon: "📊",
    },
    {
      id: "ux-designer",
      title: "UX/UI Designer",
      description: "Create delightful user experiences",
      growth: "🌱 Emerging",
      matchPercentage: 80,
      salary: "$85K - $135K",
      outlook: "Increasing focus on design-driven products",
      skills: ["Figma", "User Research", "Prototyping"],
      icon: "🎨",
    },
    {
      id: "cloud-architect",
      title: "Cloud Architect",
      description: "Design scalable infrastructure solutions",
      growth: "🔥 Fast Growing",
      matchPercentage: 86,
      salary: "$130K - $190K",
      outlook: "High demand as cloud adoption accelerates",
      skills: ["AWS/Azure", "System Design", "DevOps"],
      icon: "☁️",
    },
  ]

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">AI Career Recommender</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Career paths aligned with you</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            We've analyzed market trends and your profile to recommend these high-potential career paths. Click on any
            role to explore deeper.
          </p>
        </div>

        {/* Career Cards Grid */}
        <div className="grid gap-6 mb-16">
          {careerPaths.map((path) => (
            <div
              key={path.id}
              onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 p-8 transition-all duration-500 hover:border-accent/50 hover:bg-gradient-to-br hover:from-foreground/15 hover:to-foreground/8">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10 group-hover:bg-accent/20 transition-all duration-500" />

                {/* Main Content */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">{path.icon}</span>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">{path.title}</h3>
                      <p className="text-foreground/70">{path.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-accent mb-2">{path.growth}</div>
                  </div>
                </div>

                {/* Match Ring */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-foreground/20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-accent transition-all duration-700"
                        strokeDasharray={`${(path.matchPercentage / 100) * 282.7} 282.7`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">{path.matchPercentage}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Your Match</p>
                    <p className="text-accent font-semibold">{path.salary}</p>
                  </div>
                </div>

                {/* Expandable Section */}
                {selectedPath === path.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-foreground/20 pt-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wide">
                          Market Outlook
                        </h4>
                        <p className="text-foreground/70">{path.outlook}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground/80 mb-2 uppercase tracking-wide">
                          Key Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {path.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 rounded-full text-xs bg-accent/20 text-accent font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link href={`/journey/career-path/${path.id}`}>
                        <MagneticButton variant="primary" size="sm">
                          Explore {path.title}
                        </MagneticButton>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/resume-builder">
            <MagneticButton size="lg" variant="primary">
              Next: Resume Builder
            </MagneticButton>
          </Link>
          <Link href="/journey">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
