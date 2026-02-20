"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"

export default function CareerPersona() {
  const persona = {
    archetype: "The Innovator",
    tagline: "You're curious, driven by impact, and love solving complex problems",
    strengths: [
      "Technical Problem Solving",
      "Cross-functional Collaboration",
      "Continuous Learning",
      "Leadership Potential",
    ],
    idealRoles: ["AI/ML Engineer", "Tech Lead", "Product Manager", "Innovation Strategist"],
    nextSteps: [
      {
        step: 1,
        title: "Complete Your Learning Path",
        description: "Finish 2 of the 3 phases to master your target skills",
      },
      {
        step: 2,
        title: "Build Your Portfolio",
        description: "Create 2-3 projects showcasing your best work",
      },
      {
        step: 3,
        title: "Land Interviews",
        description: "Practice 10 mock interviews before real ones",
      },
      {
        step: 4,
        title: "Negotiate Offer",
        description: "Use our salary guides and negotiation tips",
      },
    ],
  }

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Career Profile</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Your career persona</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Based on your answers and profile, here's who you are as a professional and where you shine.
          </p>
        </div>

        {/* Main Persona Card */}
        <div className="mb-16 bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/40 rounded-3xl p-12 md:p-16 backdrop-blur-sm overflow-hidden relative">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10" />

          <div className="max-w-2xl">
            <p className="text-accent font-semibold text-lg mb-3">Your Archetype</p>
            <h2 className="text-5xl md:text-6xl font-light text-foreground mb-4">
              <span className="text-balance">{persona.archetype}</span>
            </h2>
            <p className="text-xl text-foreground/80 leading-relaxed">{persona.tagline}</p>
          </div>

          <div className="mt-12 pt-12 border-t border-accent/30 flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <p className="text-sm text-accent/80 font-semibold uppercase tracking-wide mb-4">Your Strengths</p>
              <ul className="space-y-2">
                {persona.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-3 text-foreground/90">
                    <span className="text-accent mt-1">✦</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <p className="text-sm text-accent/80 font-semibold uppercase tracking-wide mb-4">Best Fit Roles</p>
              <ul className="space-y-2">
                {persona.idealRoles.map((role, idx) => (
                  <li key={idx} className="flex gap-3 text-foreground/90">
                    <span className="text-accent mt-1">→</span>
                    <span>{role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Share Button */}
          <div className="mt-12">
            <MagneticButton variant="secondary" size="sm">
              Share Your Persona
            </MagneticButton>
          </div>
        </div>

        {/* Action Plan */}
        <div className="mb-16">
          <h3 className="text-3xl font-light text-foreground mb-8">Your Roadmap to Success</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {persona.nextSteps.map((item) => (
              <div
                key={item.step}
                className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:border-accent/50 hover:bg-gradient-to-br hover:from-foreground/15 hover:to-foreground/8 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-foreground mb-2">{item.title}</h4>
                    <p className="text-foreground/70">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 md:p-12 text-center backdrop-blur-sm">
          <h3 className="text-2xl font-light text-foreground mb-4">Ready to make it happen?</h3>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Your personalized career journey is set up. Check your progress dashboard to stay on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/journey/progress-dashboard">
              <MagneticButton size="lg" variant="primary">
                View Progress Dashboard
              </MagneticButton>
            </Link>
            <Link href="/">
              <MagneticButton size="lg" variant="secondary">
                Back to Home
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
