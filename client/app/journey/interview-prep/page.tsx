"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface FeedbackCategory {
  name: string
  score: number
  color: string
}

export default function InterviewPrep() {
  const [isAnswering, setIsAnswering] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [userAnswer, setUserAnswer] = useState("")

  const currentQuestion = "Tell me about a project you're really proud of and what challenges you faced."

  const feedbackCategories: FeedbackCategory[] = [
    { name: "Confidence", score: 78, color: "text-blue-500" },
    { name: "Clarity", score: 85, color: "text-green-500" },
    { name: "Technical Depth", score: 72, color: "text-purple-500" },
  ]

  const handleSubmitAnswer = () => {
    setShowFeedback(true)
  }

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">AI Interview Coach</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Interview practice zone</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            Practice answering real interview questions. Get immediate AI feedback on your responses.
          </p>
        </div>

        {/* Interview Space */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Question & Response */}
          <div className="md:col-span-2">
            <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 backdrop-blur-sm h-full">
              <div className="mb-8">
                <p className="text-sm text-foreground/60 mb-4 font-mono">Interview Question</p>
                <h3 className="text-2xl font-light leading-relaxed text-foreground mb-6">{currentQuestion}</h3>
              </div>

              <div className="mb-8">
                <label className="text-sm text-foreground/60 font-mono mb-4 block">Your Response</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Click here and share your answer... Speak naturally, as you would in a real interview."
                  className="w-full h-40 bg-foreground/5 border border-foreground/20 rounded-lg p-4 text-foreground placeholder-foreground/40 resize-none focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>

              {!showFeedback && (
                <button
                  onClick={() => {
                    setIsAnswering(true)
                    handleSubmitAnswer()
                  }}
                  className="w-full"
                >
                  <MagneticButton variant="primary" size="lg" className="w-full">
                    Get AI Feedback
                  </MagneticButton>
                </button>
              )}
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-2xl p-6 backdrop-blur-sm">
              <h4 className="font-semibold text-accent mb-4">💡 Interview Tips</h4>
              <ul className="space-y-3 text-sm text-foreground/70">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>Use the STAR method (Situation, Task, Action, Result)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>Highlight specific metrics and results</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>Show passion and learning from challenges</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 mt-1">•</span>
                  <span>Keep responses concise (60-90 seconds)</span>
                </li>
              </ul>
            </div>

            <div className="bg-foreground/5 border border-foreground/20 rounded-2xl p-6 backdrop-blur-sm">
              <h4 className="font-semibold text-foreground mb-4">📊 Your Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Interviews Completed</span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Total Practice Hours</span>
                  <span className="font-semibold text-foreground">2.5 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
            <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 backdrop-blur-sm">
              <h4 className="text-2xl font-semibold text-foreground mb-8">Your Feedback</h4>

              {/* Category Scores */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {feedbackCategories.map((category) => (
                  <div key={category.name} className="bg-foreground/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-foreground">{category.name}</h5>
                      <span className={`text-lg font-light ${category.color}`}>{category.score}</span>
                    </div>
                    <div className="w-full bg-foreground/20 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${category.color.replace("text-", "bg-")}`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-semibold text-green-600 mb-1">What Went Well</p>
                  <p className="text-foreground/80">
                    You structured your answer with clear context and used specific metrics. Great use of the STAR
                    method!
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold text-blue-600 mb-1">Areas to Improve</p>
                  <p className="text-foreground/80">
                    Try to be more concise—your answer was a bit long. Aim for 60-90 seconds and emphasize the impact
                    more.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="font-semibold text-purple-600 mb-1">Next Practice Tip</p>
                  <p className="text-foreground/80">
                    Practice more behavioral questions related to teamwork and conflict resolution for this role.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-foreground/20">
                <div className="flex gap-4">
                  <MagneticButton variant="primary">Next Question</MagneticButton>
                  <MagneticButton variant="secondary">View All Questions</MagneticButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/career-persona">
            <MagneticButton size="lg" variant="primary">
              Next: Career Persona
            </MagneticButton>
          </Link>
          <Link href="/journey/learning-guide">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
