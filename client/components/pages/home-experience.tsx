"use client"
import Image from "next/image"
import { GrainOverlay } from "@/components/grain-overlay"
import { CustomCursor } from "@/components/custom-cursor"

interface HomeExperienceProps {
  onNavigate: (section: string) => void
  userData?: {
    problemSolvingStyle?: string
    learningBackground?: string
    careerClarity?: string
  }
}

export function HomeExperience({ onNavigate, userData }: HomeExperienceProps) {
  const getStatusMessage = () => {
    if (userData?.learningBackground === "Still in school") {
      return "You're exploring your path while building a strong foundation."
    }
    if (userData?.learningBackground === "Early in my career") {
      return "You're early in your journey, exploring technical and analytical paths."
    }
    if (userData?.learningBackground === "Transitioning careers") {
      return "You're navigating a meaningful transition with existing skills to leverage."
    }
    return "You're on a growth path with clear direction ahead."
  }

  const getNextActions = () => {
    if (userData?.careerClarity === "Which career paths fit me") {
      return [
        { title: "Explore Career Paths", icon: "🎯", section: "career-paths" },
        { title: "Discover Your Persona", icon: "🧬", section: "persona" },
      ]
    }
    if (userData?.careerClarity === "How to stand out professionally") {
      return [
        { title: "Build Your Resume", icon: "📄", section: "resume-builder" },
        { title: "Create Portfolio", icon: "📁", section: "portfolio" },
      ]
    }
    if (userData?.careerClarity === "What skills matter most") {
      return [
        { title: "Get Learning Guide", icon: "🎓", section: "learning-guide" },
        { title: "Explore Skill Trends", icon: "📈", section: "job-trends" },
      ]
    }
    return [
      { title: "Interview Practice", icon: "🤝", section: "interview-prep" },
      { title: "Explore Career Paths", icon: "🎯", section: "career-paths" },
    ]
  }

  const nextActions = getNextActions()

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-card/40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 border-none shadow-none">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image src="/nitiai.png" alt="Niti AI" width={72} height={72} className="rounded-full" />
        </button>

        <button
          className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
          onClick={() => onNavigate("home")}
        >
          Dashboard
        </button>
      </nav>

      <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 max-w-6xl mx-auto">
        {/* Where You Are */}
        <section className="mb-20 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Where You Are</h2>
          <div className="p-6 rounded-2xl bg-foreground/5 border-none shadow-none backdrop-blur-sm">
            <p className="text-2xl md:text-3xl leading-relaxed text-balance">{getStatusMessage()}</p>
          </div>
        </section>

        {/* What Matters Next */}
        <section className="mb-20 space-y-6">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">What Matters Next</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {nextActions.map((action) => (
              <button
                key={action.section}
                onClick={() => onNavigate(action.section)}
                className="group p-6 rounded-xl border-none bg-foreground/5 hover:bg-foreground/8 transition-all text-left shadow-none"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">{action.title}</p>
                    <p className="text-sm text-foreground/60">Get personalized guidance tailored to your goals</p>
                  </div>
                  <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Longer-Term Path */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">When You're Ready</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Interview Practice", description: "Safe space to practice and build confidence" },
              { title: "Peer Learning", description: "Connect with others on similar journeys" },
              { title: "Job Trends", description: "Stay informed about market opportunities" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-lg bg-foreground/5 border-none shadow-none">
                <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/60">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
