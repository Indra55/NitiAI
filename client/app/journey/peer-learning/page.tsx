"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface LearningRoom {
  id: string
  name: string
  description: string
  focus: string
  members: number
  nextSession: string
  frequency: string
  icon: string
}

export default function PeerLearning() {
  const [rooms] = useState<LearningRoom[]>([
    {
      id: "mock-int",
      name: "Mock Interview Room",
      description: "30-minute focused mock interview sessions with real feedback",
      focus: "Behavioral & Technical Interview Practice",
      members: 45,
      nextSession: "Today at 6:00 PM",
      frequency: "Daily",
      icon: "🤝",
    },
    {
      id: "skill-share",
      name: "Skill Share Circle",
      description: "Learn new technical skills from peers working in your target roles",
      focus: "Hands-on Skill Development",
      members: 62,
      nextSession: "Tomorrow at 5:00 PM",
      frequency: "Tuesdays & Thursdays",
      icon: "🎓",
    },
    {
      id: "career-talk",
      name: "Career Conversations",
      description: "Discuss career transitions, industry insights, and growth strategies",
      focus: "Career Development & Mentorship",
      members: 38,
      nextSession: "Sunday at 2:00 PM",
      frequency: "Weekly",
      icon: "💼",
    },
    {
      id: "project-collab",
      name: "Project Collaboration",
      description: "Build real projects with peers to strengthen your portfolio",
      focus: "Team Projects & Portfolio Building",
      members: 28,
      nextSession: "Saturday at 3:00 PM",
      frequency: "Weekends",
      icon: "🚀",
    },
  ])

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Community Learning</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Learn together, grow faster</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Join focused learning groups with people on similar journeys. Quality &gt; Quantity. Real connections,
            meaningful growth.
          </p>
        </div>

        {/* Learning Rooms */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:border-accent/50 hover:bg-gradient-to-br hover:from-foreground/15 hover:to-foreground/8 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{room.icon}</span>
                <div className="text-right">
                  <p className="text-xs text-accent font-semibold">{room.members} members</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-2">{room.name}</h3>
              <p className="text-foreground/70 text-sm mb-4">{room.description}</p>

              <div className="space-y-3 mb-6 pb-6 border-b border-foreground/20">
                <div>
                  <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mb-1">Focus Area</p>
                  <p className="text-sm text-foreground/80">{room.focus}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mb-1">
                      Next Session
                    </p>
                    <p className="text-sm text-accent font-semibold">{room.nextSession}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide mb-1">Frequency</p>
                    <p className="text-sm text-foreground/80">{room.frequency}</p>
                  </div>
                </div>
              </div>

              <MagneticButton variant="primary" size="sm" className="w-full">
                Join Room
              </MagneticButton>
            </div>
          ))}
        </div>

        {/* Community Impact */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-foreground/5 border border-foreground/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-light text-foreground mb-2">1,200+</p>
            <p className="text-sm text-foreground/60">Active Members</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-light text-foreground mb-2">400+</p>
            <p className="text-sm text-foreground/60">Job Offers Landed</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/20 rounded-2xl p-6 text-center">
            <p className="text-3xl font-light text-foreground mb-2">89%</p>
            <p className="text-sm text-foreground/60">Recommend to Friends</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/job-trends">
            <MagneticButton size="lg" variant="primary">
              Next: Job Trends
            </MagneticButton>
          </Link>
          <Link href="/journey/portfolio">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
