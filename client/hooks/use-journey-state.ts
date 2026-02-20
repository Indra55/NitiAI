"use client"

import { useState, useCallback } from "react"

export type JourneyStep =
  | "home"
  | "onboarding-q1"
  | "onboarding-q2"
  | "onboarding-q3"
  | "dashboard"
  | "career-paths"
  | "resume-builder"
  | "learning-guide"
  | "interview-prep"
  | "persona"
  | "portfolio"
  | "peer-learning"
  | "job-trends"

export interface OnboardingData {
  problemSolvingStyle?: string
  learningBackground?: string
  careerClarity?: string
}

export function useJourneyState() {
  const [currentStep, setCurrentStep] = useState<JourneyStep>("home")
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [completedOnboarding, setCompletedOnboarding] = useState(false)

  const goToStep = useCallback((step: JourneyStep) => {
    setCurrentStep(step)
  }, [])

  const updateOnboarding = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setCompletedOnboarding(true)
    setCurrentStep("dashboard")
  }, [])

  return {
    currentStep,
    onboardingData,
    completedOnboarding,
    goToStep,
    updateOnboarding,
    completeOnboarding,
  }
}
