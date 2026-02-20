"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Shield, Sparkles } from "lucide-react"
import { useState } from "react"

const interviewTypes = [
  {
    title: "Behavioral Interview",
    description: "Practice telling your story and demonstrating key skills",
    difficulty: "All levels",
    duration: "30 minutes",
  },
  {
    title: "Technical Interview",
    description: "System design, coding, and problem-solving questions",
    difficulty: "Intermediate to Advanced",
    duration: "45 minutes",
  },
  {
    title: "Product Management Interview",
    description: "Product strategy, user research, and decision-making",
    difficulty: "All levels",
    duration: "40 minutes",
  },
]

const roles = ["Software Engineer", "Senior Engineer", "Tech Lead", "Product Manager", "Solutions Architect"]

export default function InterviewPage() {
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [selectedType, setSelectedType] = useState(interviewTypes[0].title)

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header */}
          <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Shield className="w-4 h-4" />
              Safe Practice Space
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-pretty leading-[1.1]">
              Interview Preparation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              This is a practice space. Nothing is being judged. Reduce anxiety by practicing with honest feedback.
            </p>
          </section>

          {/* Reassurance Card */}
          <Card className="p-8 mb-16 border-border/40 bg-gradient-to-br from-secondary/10 to-transparent backdrop-blur-sm border-secondary/30 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-display text-xl font-bold mb-2">You've Got This</h2>
                <p className="text-foreground leading-relaxed">
                  Interview anxiety is normal. This space is built specifically to help you practice, get constructive
                  feedback, and build confidence. No pressure, no judgment.
                </p>
              </div>
            </div>
          </Card>

          {/* Interview Setup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Role Selection */}
            <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h2 className="text-2xl font-display font-bold mb-6">Step 1: Choose Your Role</h2>
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedRole === role
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border/40 hover:border-primary/40"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </Card>

            {/* Interview Type */}
            <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <h2 className="text-2xl font-display font-bold mb-6">Step 2: Choose Interview Type</h2>
              <div className="space-y-3">
                {interviewTypes.map((type) => (
                  <button
                    key={type.title}
                    onClick={() => setSelectedType(type.title)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedType === type.title
                        ? "border-primary bg-primary/10"
                        : "border-border/40 hover:border-primary/40"
                    }`}
                  >
                    <p className="font-semibold">{type.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{type.difficulty}</span>
                      <span>{type.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Difficulty Selection */}
          <Card className="p-8 mb-16 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <h2 className="text-2xl font-display font-bold mb-6">Step 3: Select Difficulty</h2>
            <div className="flex gap-4">
              {["Easy", "Medium", "Hard"].map((level) => (
                <Button
                  key={level}
                  variant="outline"
                  className={`flex-1 border-2 transition-all hover:scale-105 ${
                    level === "Medium" ? "border-primary bg-primary/10 text-primary" : "border-border/40"
                  }`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </Card>

          {/* Start Interview */}
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 mb-8">
              <Mic className="w-5 h-5" />
              Start Practice Interview
            </Button>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You'll answer questions, and receive structured feedback on what went well and what to improve next time.
            </p>
          </div>

          {/* Feedback Structure */}
          <section className="mt-20 border-t border-border/40 pt-16">
            <h2 className="text-3xl font-display font-bold mb-8">How Feedback Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: "✓",
                  title: "What Went Well",
                  description: "We highlight your strengths and what you did right in this question",
                },
                {
                  icon: "→",
                  title: "One Improvement",
                  description: "A specific, actionable suggestion to strengthen your response",
                },
                {
                  icon: "💡",
                  title: "Next Time Tip",
                  description: "A strategy to apply to similar questions in future interviews",
                },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="p-6 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-primary mb-4">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
