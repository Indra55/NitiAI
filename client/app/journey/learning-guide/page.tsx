"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { useState } from "react"

interface Phase {
  id: number
  title: string
  duration: string
  description: string
  courses: Course[]
}

interface Course {
  id: string
  name: string
  platform: string
  level: "Beginner" | "Intermediate" | "Advanced"
  hours: number
}

export default function LearningGuide() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  const [completedCourses, setCompletedCourses] = useState<string[]>([])

  const phases: Phase[] = [
    {
      id: 1,
      title: "Foundation Building",
      duration: "4-6 weeks",
      description: "Master the fundamentals you'll need for any technical role",
      courses: [
        {
          id: "cs101",
          name: "Computer Science Fundamentals",
          platform: "Coursera",
          level: "Beginner",
          hours: 20,
        },
        {
          id: "py101",
          name: "Python for Everyone",
          platform: "Codecademy",
          level: "Beginner",
          hours: 15,
        },
      ],
    },
    {
      id: 2,
      title: "Skill Development",
      duration: "8-10 weeks",
      description: "Deepen your knowledge in your chosen specialization",
      courses: [
        {
          id: "ml101",
          name: "Introduction to Machine Learning",
          platform: "Udacity",
          level: "Intermediate",
          hours: 25,
        },
        {
          id: "sql101",
          name: "SQL Mastery",
          platform: "DataCamp",
          level: "Intermediate",
          hours: 18,
        },
      ],
    },
    {
      id: 3,
      title: "Advanced Specialization",
      duration: "6-8 weeks",
      description: "Focus on advanced topics to stand out from competition",
      courses: [
        {
          id: "adv101",
          name: "Advanced ML & Deep Learning",
          platform: "Coursera",
          level: "Advanced",
          hours: 30,
        },
        {
          id: "proj101",
          name: "Industry Project Simulation",
          platform: "Real-world Project",
          level: "Advanced",
          hours: 40,
        },
      ],
    },
  ]

  const toggleCourseComplete = (courseId: string) => {
    setCompletedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
  }

  const totalHours = phases.reduce((sum, phase) => {
    return sum + phase.courses.reduce((courseSum, course) => courseSum + course.hours, 0)
  }, 0)

  const completedHours = phases.reduce((sum, phase) => {
    return (
      sum +
      phase.courses
        .filter((c) => completedCourses.includes(c.id))
        .reduce((courseSum, course) => courseSum + course.hours, 0)
    )
  }, 0)

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Personalized Learning Roadmap</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-light leading-tight text-foreground mb-4">
            <span className="text-balance">Your learning journey</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl">
            A structured path designed specifically for you. Complete these courses to master your target role.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-12 bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-foreground/60 mb-2">Total Learning Time</p>
              <p className="text-3xl font-light text-foreground">{totalHours} hours</p>
              <p className="text-xs text-foreground/60 mt-1">~12-16 weeks of consistent study</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-2">Your Progress</p>
              <div className="mb-3">
                <div className="w-full bg-foreground/20 rounded-full h-3">
                  <div
                    className="bg-accent h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(completedHours / totalHours) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-foreground/80">
                {completedHours} / {totalHours} hours completed
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-2">Courses Completed</p>
              <p className="text-3xl font-light text-foreground">{completedCourses.length}</p>
              <p className="text-xs text-foreground/60 mt-1">
                of {phases.reduce((sum, p) => sum + p.courses.length, 0)} courses
              </p>
            </div>
          </div>
        </div>

        {/* Learning Phases */}
        <div className="space-y-6 mb-16">
          {phases.map((phase) => (
            <div key={phase.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                className="w-full text-left bg-gradient-to-r from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 hover:border-accent/50 hover:bg-gradient-to-r hover:from-foreground/15 hover:to-foreground/8 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold">
                        {phase.id}
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">{phase.title}</h3>
                    </div>
                    <p className="text-foreground/70 mb-2">{phase.description}</p>
                    <p className="text-sm text-foreground/60 font-mono">Duration: {phase.duration}</p>
                  </div>
                  <svg
                    className={`w-6 h-6 text-accent transition-transform duration-300 ${
                      expandedPhase === phase.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {/* Expanded Courses */}
              {expandedPhase === phase.id && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-foreground/5 border border-t-0 border-foreground/20 rounded-b-2xl p-8">
                  <div className="space-y-4">
                    {phase.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={completedCourses.includes(course.id)}
                          onChange={() => toggleCourseComplete(course.id)}
                          className="w-5 h-5 mt-1 rounded accent-color"
                        />
                        <div className="flex-1">
                          <h4
                            className={`font-semibold transition-colors ${completedCourses.includes(course.id) ? "text-foreground/60 line-through" : "text-foreground"}`}
                          >
                            {course.name}
                          </h4>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="text-xs px-2 py-1 rounded bg-foreground/10 text-foreground/70">
                              {course.platform}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                course.level === "Beginner"
                                  ? "bg-green-500/20 text-green-600"
                                  : course.level === "Intermediate"
                                    ? "bg-blue-500/20 text-blue-600"
                                    : "bg-purple-500/20 text-purple-600"
                              }`}
                            >
                              {course.level}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                              {course.hours} hrs
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap">
          <Link href="/journey/interview-prep">
            <MagneticButton size="lg" variant="primary">
              Next: Interview Prep
            </MagneticButton>
          </Link>
          <Link href="/journey/resume-builder">
            <MagneticButton size="lg" variant="secondary">
              Back
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
