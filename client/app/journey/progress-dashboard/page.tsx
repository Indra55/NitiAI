"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"

interface JournalEntry {
  id: string
  date: string
  milestone: string
  reflection: string
  emoji: string
}

export default function ProgressDashboard() {
  const journalEntries: JournalEntry[] = [
    {
      id: "1",
      date: "Today",
      milestone: "Started Python Fundamentals",
      reflection: "Excited to begin this journey! The material is challenging but rewarding.",
      emoji: "🚀",
    },
    {
      id: "2",
      date: "Day 3",
      milestone: "Completed 3 coding challenges",
      reflection: "Feeling confident with basic syntax. Ready to move deeper.",
      emoji: "⚡",
    },
  ]

  const stats = [
    { label: "Total Hours", value: "12.5", unit: "hrs" },
    { label: "Courses", value: "2", unit: "completed" },
    { label: "Streak", value: "6", unit: "days" },
    { label: "Rank", value: "Top 15%", unit: "percentile" },
  ]

  const upcomingMilestones = [
    "Complete SQL Mastery course",
    "Build first portfolio project",
    "Mock interview practice",
    "Apply to target companies",
  ]

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Personal Growth Journal</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Your progress</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Track your growth, celebrate milestones, and stay motivated on your career transformation.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <p className="text-sm text-foreground/60 mb-3 font-mono">{stat.label}</p>
              <p className="text-3xl font-light text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-foreground/50">{stat.unit}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Growth Journal */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-light text-foreground mb-8">Growth Journal</h3>
            <div className="space-y-6">
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 backdrop-blur-sm hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{entry.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/60 font-mono mb-2">{entry.date}</p>
                      <h4 className="text-xl font-semibold text-foreground">{entry.milestone}</h4>
                    </div>
                  </div>
                  <p className="text-foreground/70 pl-16">{entry.reflection}</p>
                </div>
              ))}
            </div>

            {/* Add Entry CTA */}
            <div className="mt-8 bg-accent/20 border border-accent/40 rounded-2xl p-8 text-center">
              <p className="text-foreground/80 mb-4">How are you feeling about your progress?</p>
              <MagneticButton variant="secondary" size="sm">
                Add Journal Entry
              </MagneticButton>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Milestones */}
            <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 backdrop-blur-sm">
              <h4 className="font-semibold text-foreground mb-6">Upcoming Milestones</h4>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/40 rounded-2xl p-8 backdrop-blur-sm text-center">
              <p className="text-accent font-semibold mb-4">Current Achievement</p>
              <div className="text-5xl mb-3">🌟</div>
              <p className="font-semibold text-foreground mb-2">6-Day Streak</p>
              <p className="text-sm text-foreground/70">Keep it up! You're in the top 15% of learners.</p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link href="/journey/learning-guide">
                <MagneticButton variant="secondary" size="sm" className="w-full">
                  Continue Learning
                </MagneticButton>
              </Link>
              <Link href="/">
                <MagneticButton variant="secondary" size="sm" className="w-full">
                  Back to Home
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
