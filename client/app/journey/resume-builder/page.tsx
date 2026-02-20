"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface ResumeFeedback {
  category: string
  score: number
  feedback: string
  suggestion: string
}

export default function ResumeBuilder() {
  const [resumeScore] = useState(72)
  const [activeTab, setActiveTab] = useState<"improvements" | "strengths">("improvements")

  const improvements: ResumeFeedback[] = [
    {
      category: "Technical Skills Section",
      score: 65,
      feedback: "Your technical skills are listed but lack quantifiable results",
      suggestion:
        "Add specific projects or metrics next to each skill (e.g., 'Python - Built ML model with 94% accuracy')",
    },
    {
      category: "Achievement Metrics",
      score: 58,
      feedback: "Most bullet points describe tasks, not impact",
      suggestion: "Transform 'Managed project deadline' to 'Delivered project 2 weeks early, saving $50K in costs'",
    },
    {
      category: "Keywords for ATS",
      score: 70,
      feedback: "Missing industry-specific keywords that recruiters search for",
      suggestion: "Add keywords from job descriptions you're targeting (e.g., 'Agile', 'CI/CD', 'Cloud Architecture')",
    },
  ]

  const strengths: ResumeFeedback[] = [
    {
      category: "Career Narrative",
      score: 88,
      feedback: "Your career progression is clear and compelling",
      suggestion: "Keep showcasing your growth trajectory—it tells a strong story",
    },
    {
      category: "Formatting & Design",
      score: 85,
      feedback: "Clean, professional layout that's ATS-friendly",
      suggestion: "Continue using this template as a proven format",
    },
    {
      category: "Experience Relevance",
      score: 82,
      feedback: "Your background aligns well with modern tech roles",
      suggestion: "Highlight the bridge between your past and target roles",
    },
  ]

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Resume Evaluator</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Your resume readiness</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            We've analyzed your resume with AI-powered insights. Here's what recruiters are seeing and what you can
            improve.
          </p>
        </div>

        {/* Score Card */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-12 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Circular Score */}
              <div className="flex justify-center md:justify-start">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-foreground/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-accent transition-all duration-700"
                      strokeDasharray={`${(resumeScore / 100) * 282.7} 282.7`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-light text-foreground">{resumeScore}</span>
                    <span className="text-xs text-foreground/60 mt-1">out of 100</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2">
                <h3 className="text-3xl font-light text-foreground mb-6">You're doing great!</h3>
                <div className="space-y-4">
                  <p className="text-lg text-foreground/70">
                    Your resume shows strong potential. With a few targeted improvements, you'll rank in the top 10% of
                    candidates.
                  </p>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-accent flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/80">Clear career progression visible</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-accent flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/80">Professional formatting passes ATS systems</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-accent flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/80">Relevant skills for modern roles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex gap-4 border-b border-foreground/20 mb-8">
            <button
              onClick={() => setActiveTab("improvements")}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === "improvements"
                  ? "text-accent border-b-2 border-accent"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              What to Improve ({improvements.length})
            </button>
            <button
              onClick={() => setActiveTab("strengths")}
              className={`pb-4 font-semibold transition-colors ${
                activeTab === "strengths"
                  ? "text-accent border-b-2 border-accent"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Your Strengths ({strengths.length})
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {(activeTab === "improvements" ? improvements : strengths).map((item, idx) => (
              <div
                key={idx}
                className="group bg-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:bg-foreground/10 hover:border-foreground/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-semibold text-foreground">{item.category}</h4>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
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
                          className={activeTab === "improvements" ? "text-orange-500" : "text-accent"}
                          strokeDasharray={`${(item.score / 100) * 282.7} 282.7`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-foreground">{item.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-foreground/80 mb-4">{item.feedback}</p>
                <div className={`p-4 rounded-lg ${activeTab === "improvements" ? "bg-orange-500/20" : "bg-accent/20"}`}>
                  <p
                    className={`text-sm font-semibold ${activeTab === "improvements" ? "text-orange-600" : "text-accent"} mb-2`}
                  >
                    {activeTab === "improvements" ? "💡 Suggestion" : "✨ Keep doing this"}
                  </p>
                  <p className="text-foreground/90">{item.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/learning-guide">
            <MagneticButton size="lg" variant="primary">
              Next: Learning Guide
            </MagneticButton>
          </Link>
          <Link href="/journey/career-path">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
