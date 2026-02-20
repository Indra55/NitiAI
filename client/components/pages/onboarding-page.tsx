"use client"

import { useState } from "react"
import { OnboardingQuestion } from "@/components/onboarding-question"

interface OnboardingPageProps {
  onComplete: (data: {
    problemSolvingStyle: string
    learningBackground: string
    careerClarity: string
  }) => void
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState({
    problemSolvingStyle: "",
    learningBackground: "",
    careerClarity: "",
  })

  const handleSelect = (answer: string) => {
    if (step === 1) {
      setAnswers((prev) => ({ ...prev, problemSolvingStyle: answer }))
    } else if (step === 2) {
      setAnswers((prev) => ({ ...prev, learningBackground: answer }))
    } else if (step === 3) {
      setAnswers((prev) => ({ ...prev, careerClarity: answer }))
    }
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete(answers)
    }
  }

  const getQuestionProps = () => {
    switch (step) {
      case 1:
        return {
          questionNumber: 1,
          totalQuestions: 3,
          title: "What kind of problems do you enjoy solving?",
          subtitle: "This helps us understand how you think.",
          description:
            "Different people are drawn to different challenges. Your answer helps us identify career paths that align with your natural problem-solving style.",
          options: [
            {
              label: "Technical & Analytical",
              hint: "Breaking down complex systems and writing code",
            },
            {
              label: "Creative & Visual",
              hint: "Designing experiences and bringing ideas to life",
            },
            {
              label: "People & Communication",
              hint: "Helping others succeed and building relationships",
            },
            {
              label: "Business & Strategy",
              hint: "Solving organizational challenges and growth",
            },
          ],
          selectedOption: answers.problemSolvingStyle,
        }
      case 2:
        return {
          questionNumber: 2,
          totalQuestions: 3,
          title: "What are you currently studying or learning?",
          subtitle: "Where are you in your learning journey?",
          description:
            "Understanding your current knowledge helps us recommend skill development paths that build on what you already know.",
          options: [
            {
              label: "Still in school",
              hint: "High school, college, or university student",
            },
            {
              label: "Early in my career",
              hint: "Less than 2 years of professional experience",
            },
            {
              label: "Transitioning careers",
              hint: "Moving to a new industry or role",
            },
            {
              label: "Developing new skills",
              hint: "Already established, building on existing experience",
            },
          ],
          selectedOption: answers.learningBackground,
        }
      case 3:
        return {
          questionNumber: 3,
          totalQuestions: 3,
          title: "What feels unclear about your future?",
          subtitle: "Where do you need the most guidance?",
          description:
            "This helps us prioritize what matters most to you. There's no wrong answer—just honesty about where you need support.",
          options: [
            {
              label: "Which career paths fit me",
              hint: "Unsure what directions make sense",
            },
            {
              label: "How to stand out professionally",
              hint: "Need help with resume, portfolio, or brand",
            },
            {
              label: "What skills matter most",
              hint: "Confused about which skills to develop first",
            },
            {
              label: "How to prepare for interviews",
              hint: "Anxious or unprepared for conversations",
            },
          ],
          selectedOption: answers.careerClarity,
        }
      default:
        return null
    }
  }

  const props = getQuestionProps()
  if (!props) return null

  return <OnboardingQuestion {...props} onSelect={handleSelect} onNext={handleNext} />
}
