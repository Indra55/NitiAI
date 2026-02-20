"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { GrainOverlay } from "@/components/grain-overlay"
import { CustomCursor } from "@/components/custom-cursor"

interface OnboardingQuestionProps {
  questionNumber: number
  totalQuestions: number
  title: string
  subtitle: string
  description: string
  options: {
    label: string
    hint: string
  }[]
  onSelect: (option: string) => void
  onNext: () => void
  selectedOption?: string
  isLoading?: boolean
}

export function OnboardingQuestion({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  description,
  options,
  onSelect,
  onNext,
  selectedOption,
  isLoading = false,
}: OnboardingQuestionProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-16">
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <div className="mb-12 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground/60">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="text-sm text-foreground/40">{Math.round((questionNumber / totalQuestions) * 100)}%</span>
            </div>
            <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question content */}
          <div className="space-y-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-light leading-tight text-balance">{title}</h2>
              <p className="text-lg text-foreground/70 text-balance">{subtitle}</p>
            </div>
            <p className="text-base text-foreground/60 leading-relaxed">{description}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-10">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(option.label)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300
                  text-left group
                  ${
                    selectedOption === option.label
                      ? "border-primary bg-primary/10"
                      : "border-foreground/10 bg-foreground/5 hover:border-foreground/20 hover:bg-foreground/8"
                  }
                `}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{option.label}</span>
                  <span className="text-sm text-foreground/60">{option.hint}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <MagneticButton
              size="lg"
              variant="primary"
              onClick={onNext}
              className={selectedOption ? "" : "opacity-50 cursor-not-allowed"}
            >
              {questionNumber === totalQuestions ? "Complete Onboarding" : "Next Question"}
            </MagneticButton>
          </div>
        </div>
      </div>
    </main>
  )
}
