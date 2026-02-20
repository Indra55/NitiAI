"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Shield, Sparkles } from "lucide-react"
import "@/app/dashboard/dashboard.css"

export default function InterviewPage() {
  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            {/* Header */}
            <section className="space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Shield className="w-4 h-4" />
                Safe Practice Space
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-pretty leading-[1.1] text-foreground">
                Interview Preparation
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl font-medium">
                This is a practice space. Nothing is being judged. Reduce anxiety by practicing with honest feedback.
              </p>
            </section>

            {/* Reassurance Card */}
            <Card className="p-8 mb-16 border-border/40 bg-linear-to-br from-secondary/10 to-transparent backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-secondary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2 text-foreground">You've Got This</h2>
                  <p className="text-foreground leading-relaxed">
                    Interview anxiety is normal. This space is built specifically to help you practice, get constructive
                    feedback, and build confidence. No pressure, no judgment.
                  </p>
                </div>
              </div>
            </Card>

            {/* Interview Modes */}
            <div className="gap-8 mb-16">
              {/* Mock Interview AI */}
              <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Mock Interview AI</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Prepare for real interviews with an AI interviewer that simulates realistic scenarios, follow-up questions,
                  and time pressure. Youʼll speak your answers out loud and get instant, structured feedback on clarity,
                  confidence, and depth of your responses.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  The AI coach highlights what you did well, where you can improve, and gives examples of stronger phrasing
                  so every practice round directly levels up your performance.
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => window.location.href = "https://vega-mock-interviews.vercel.app/"}
                >
                  <Mic className="w-4 h-4" />
                  Practice Interview
                </Button>
              </Card>

              {/* Mentor Interview */}
              {/* <Card className="p-8 border-border/40 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Mentor Interview</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Practice with a mentor-style interviewer who focuses on coaching rather than evaluation. Youʼll walk
                  through answers together, get perspective on how a hiring manager thinks, and learn how to frame your
                  experience for the roles you care about.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  This mode is ideal when you want slower-paced guidance, narrative feedback, and space to ask questions
                  about what “good” looks like before real interviews.
                </p>
                <Button variant="outline" className="gap-2">
                  Start Interview
                </Button>
              </Card> */}
            </div>

            {/* Start Interview */}
           

            {/* Feedback Structure */}
            <section className="mt-20 border-t border-border/40 pt-16">
              <h2 className="text-3xl font-bold mb-8 text-foreground">How Feedback Works</h2>
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
                    <h3 className="font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
