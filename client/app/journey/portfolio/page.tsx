"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface Project {
  id: string
  title: string
  description: string
  problem: string
  approach: string
  outcome: string
  skills: string[]
  link?: string
}

export default function PortfolioBuilder() {
  const [projects] = useState<Project[]>([
    {
      id: "proj1",
      title: "AI Career Recommendation Engine",
      description: "Built a machine learning system to match careers with user profiles",
      problem: "Users struggled to find career paths aligned with their skills and interests",
      approach: "Trained ML model on 10,000+ career profiles using Python and TensorFlow",
      outcome: "Achieved 87% accuracy, helped 500+ users identify ideal career paths",
      skills: ["Python", "TensorFlow", "Data Analysis", "System Design"],
      link: "#",
    },
    {
      id: "proj2",
      title: "Resume Optimization Platform",
      description: "Created AI-powered platform analyzing resumes for recruiters",
      problem: "Recruiters spent hours screening similar resumes with poor signals",
      approach: "Built NLP pipeline to extract and score key competencies and achievements",
      outcome: "Reduced screening time by 60%, improved hiring quality by 40%",
      skills: ["NLP", "React", "Node.js", "PostgreSQL"],
      link: "#",
    },
    {
      id: "proj3",
      title: "Interactive Learning Dashboard",
      description: "Designed and built personalized learning progress tracking system",
      problem: "Learners lost motivation without clear progress visualization",
      approach: "Created real-time dashboard with gamification and milestone tracking",
      outcome: "Increased course completion rates from 35% to 72%",
      skills: ["React", "D3.js", "UX Design", "Analytics"],
      link: "#",
    },
  ])

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Portfolio Builder</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Your best work, showcased</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Recruiters want to see what you've built. Here are your standout projects told in a way that resonates.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6 mb-16">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="group bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:border-accent/50 hover:bg-gradient-to-br hover:from-foreground/15 hover:to-foreground/8 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">{project.title}</h3>
                  </div>
                  <p className="text-foreground/70">{project.description}</p>
                </div>
              </div>

              {/* Problem, Approach, Outcome */}
              <div className="grid md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-foreground/20">
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">The Problem</p>
                  <p className="text-foreground/80 text-sm leading-relaxed">{project.problem}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">My Approach</p>
                  <p className="text-foreground/80 text-sm leading-relaxed">{project.approach}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-semibold uppercase tracking-wide mb-2">The Outcome</p>
                  <p className="text-accent text-sm font-semibold leading-relaxed">{project.outcome}</p>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full text-xs bg-accent/20 text-accent font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              {project.link && (
                <div className="mt-4">
                  <Link href={project.link}>
                    <MagneticButton variant="secondary" size="sm">
                      View Live Project
                    </MagneticButton>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Project CTA */}
        <div className="bg-gradient-to-r from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 text-center mb-16 backdrop-blur-sm">
          <h3 className="text-2xl font-light text-foreground mb-3">Want to add more projects?</h3>
          <p className="text-foreground/70 mb-6">Share your GitHub, portfolio site, or describe past work.</p>
          <MagneticButton variant="primary">Add New Project</MagneticButton>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/peer-learning">
            <MagneticButton size="lg" variant="primary">
              Next: Peer Learning
            </MagneticButton>
          </Link>
          <Link href="/journey/career-persona">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
