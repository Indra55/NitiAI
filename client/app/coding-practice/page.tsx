"use client"

import { useState } from "react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import CodingArena from "@/components/interview/CodingArena"
import { generateCodingQuestions, FALLBACK_QUESTIONS, DSAQuestion } from "@/lib/dsa-service"
import { Spinner } from "@/components/ui/spinner"
import "@/app/dashboard/dashboard.css"
import { Code2, ArrowRight, Sparkles, Cpu, Layers, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PracticeTrack {
  id: string
  title: string
  domain: string
  description: string
  tag: string
  icon: any
  topics: string[]
}

const PRACTICE_TRACKS: PracticeTrack[] = [
  {
    id: "system-arch",
    title: "System Architecture & API Design",
    domain: "System Architecture",
    description: "Design low-latency rate limiters, distributed caching layers, and high-throughput microservices.",
    tag: "High Demand · SDE-2",
    icon: Cpu,
    topics: ["Rate Limiters", "LRU Cache", "Token Buckets", "Message Queues"]
  },
  {
    id: "lingua-coach",
    title: "Sarvam LinguaCoach Agent",
    domain: "Language Articulation",
    description: "Master technical English articulation across DSA, System Design, and Behavioral interviews with Sarvam AI native mentorship.",
    tag: "Powered by Sarvam AI",
    icon: Sparkles,
    topics: ["Indic Mentorship", "English Evaluation", "No Time Limits", "Voice & Text"]
  },
  {
    id: "dsa-core",
    title: "Data Structures & Algorithms",
    domain: "DSA",
    description: "Master classic algorithmic problem solving, array manipulations, dynamic programming, and trees.",
    tag: "Core Technical Prep",
    icon: Code2,
    topics: ["Arrays & Strings", "Dynamic Programming", "Trees & Graphs", "Two Pointers"]
  },
  {
    id: "fullstack-sys",
    title: "Full-Stack & Frontend Systems",
    domain: "Full-Stack",
    description: "Build reactive state hooks, WebSocket event streaming engines, and client-side performance utilities.",
    tag: "Full-Stack Track",
    icon: Layers,
    topics: ["Custom React Hooks", "WebSockets Sync", "Debounce & Throttle", "Event Emitters"]
  }
]

export default function CodingPracticePage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<PracticeTrack | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  const startSession = async (track: PracticeTrack) => {
    if (track.id === "system-arch") {
      router.push("/system-design");
      return;
    }
    if (track.id === "lingua-coach") {
      router.push("/lingua-coach");
      return;
    }
    setLoadingTrackId(track.id);
    setSelectedTrack(track);
    try {
        const newQuestions = await generateCodingQuestions(track.domain, "Medium", track.topics[0]);
        if (newQuestions && newQuestions.length > 0) {
            setQuestions(newQuestions);
        } else {
            setQuestions(FALLBACK_QUESTIONS);
        }
    } catch (error) {
        console.warn("Falling back to curated questions:", error);
        setQuestions(FALLBACK_QUESTIONS);
    } finally {
        setSessionStarted(true);
        setLoadingTrackId(null);
    }
  };

  const resetTrackSelection = () => {
    setSessionStarted(false);
    setSelectedTrack(null);
  };

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-[#fcf9f5] flex flex-col">
        <DynamicNavbar />
        
        <main className="flex-1 pt-24 lg:pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full min-h-[calc(100vh-90px)]">
           {!sessionStarted ? (
             <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ef4a18]/20 bg-[#fff0eb] px-3.5 py-1 text-xs font-semibold text-[#ef4a18]">
                      <Sparkles className="size-3.5" /> Sarvam AI Coding Engine
                    </span>
                    <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-[#171716]">
                      Coding Practice Arena
                    </h1>
                    <p className="mt-2 text-base text-[#77716b]">
                      Select a practice track below to generate AI-tailored problems with clean starter templates.
                    </p>
                  </div>
                </div>

                {/* Practice Tracks Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {PRACTICE_TRACKS.map((track) => {
                    const IconComponent = track.icon;
                    const isLoading = loadingTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className="rounded-3xl border border-[#e8e1da] bg-white p-7 shadow-2xs transition hover:border-[#ef4a18]/40 hover:shadow-md flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="size-12 rounded-2xl bg-[#fff0eb] text-[#ef4a18] grid place-items-center">
                              <IconComponent className="size-6" />
                            </div>
                            <span className="rounded-full bg-[#f4f1ed] px-3 py-1 text-xs font-semibold text-[#6e6862]">
                              {track.tag}
                            </span>
                          </div>

                          <h3 className="mt-5 text-xl font-bold text-[#171716]">
                            {track.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#77716b] leading-relaxed">
                            {track.description}
                          </p>

                          {/* Topic Badges */}
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {track.topics.map((t) => (
                              <span key={t} className="rounded-md bg-[#faf8f5] border border-[#eee8e2] px-2.5 py-1 text-xs font-semibold text-[#5c564f]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => startSession(track)}
                          disabled={loadingTrackId !== null}
                          className="mt-6 w-full rounded-full bg-[#ef4a18] py-3 text-xs font-semibold text-white transition hover:bg-[#d93d10] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Spinner className="h-4 w-4" /> Generating {track.domain} Session...
                            </>
                          ) : (
                            <>
                              Launch {track.domain} Arena <ArrowRight className="size-4" />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
             </div>
           ) : (
               /* Coding Arena Container with Top Control Bar */
               <div className="flex flex-col gap-4 h-[calc(100vh-130px)]">
                   <div className="flex items-center justify-between px-2">
                     <button
                       onClick={resetTrackSelection}
                       className="inline-flex items-center gap-2 rounded-full border border-[#e8e1da] bg-white px-4 py-1.5 text-xs font-semibold text-[#5c564f] hover:bg-[#fff0eb] hover:text-[#ef4a18] transition"
                     >
                       <ArrowLeft className="size-3.5" /> Back to Tracks
                     </button>
                     <span className="text-xs font-semibold text-[#6e6862] flex items-center gap-1.5">
                       <Sparkles className="size-3.5 text-[#ef4a18]" /> Active Track: <strong className="text-[#171716]">{selectedTrack?.title}</strong>
                     </span>
                   </div>

                   <div className="flex-1 rounded-3xl overflow-hidden border border-[#e8e1da] shadow-sm bg-white">
                       <CodingArena 
                         problems={questions} 
                         initialIsDarkMode={false}
                         onFinishCoding={(code) => {
                            console.log("Finished coding session:", code);
                         }}
                       />
                   </div>
               </div>
           )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

