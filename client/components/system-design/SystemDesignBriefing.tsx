"use client"

import React, { useEffect, useState } from "react"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Cpu,
  HelpCircle,
  Keyboard,
  Layers3,
  Loader2,
  MessageSquareText,
  Mic,
  MousePointer2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"

export type DesignChallenge = {
  id: string
  title: string
  summary: string
  prompt: string
  requirements: string[]
  focus: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555"

const FALLBACK_CHALLENGES: DesignChallenge[] = [
  {
    id: "social-feed",
    title: "Design a social media feed",
    summary: "Build a home feed that stays fast as creators and readers scale.",
    prompt:
      "Design the backend for a social-media home feed. Users follow creators, publish posts, and need a relevant, low-latency feed when they open the app.",
    requirements: [
      "Serve a feed in under 200ms for active users",
      "Support millions of followers for popular creators",
      "Keep new posts visible without overloading the database",
    ],
    focus: ["Read vs. write paths", "Caching and fan-out", "Database scaling"],
  },
  {
    id: "flash-sale",
    title: "Design a flash-sale checkout",
    summary: "Handle a burst of buyers without overselling a limited inventory item.",
    prompt:
      "Design a checkout system for a flash sale with 100,000 units and millions of simultaneous purchase attempts. Prevent overselling while keeping checkout responsive.",
    requirements: [
      "Never oversell inventory",
      "Absorb sudden traffic spikes",
      "Process payment and order work reliably in the background",
    ],
    focus: ["Load shedding", "Queues and idempotency", "Consistency boundaries"],
  },
  {
    id: "photo-sharing",
    title: "Design photo sharing",
    summary: "Upload, transform, and deliver photos worldwide with smooth playback.",
    prompt:
      "Design a photo-sharing service where users upload images, receive resized variants, and view public photos globally with low latency.",
    requirements: [
      "Upload and process large image files",
      "Generate thumbnails asynchronously",
      "Deliver popular media quickly around the world",
    ],
    focus: ["Object/media processing", "Async jobs", "CDN and caching"],
  },
]

// ─── Help Modal ────────────────────────────────────────────────────────────────
type HelpSlide = {
  icon: React.ElementType
  title: string
  body?: string
  shortcuts?: { keys: string[]; action: string }[]
  tips?: string[]
  accent: string
}

const HELP_SLIDES: HelpSlide[] = [
  {
    icon: MousePointer2,
    title: "Drag & drop to build",
    body: "Pick a component from the left panel and drag it onto the canvas. Grab the coloured circle handles on each node and draw a line to connect two components — that's a request-flow arrow.",
    accent: "#ef4a18",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    shortcuts: [
      { keys: ["Ctrl", "C"], action: "Copy selected nodes" },
      { keys: ["Ctrl", "X"], action: "Cut selected nodes" },
      { keys: ["Ctrl", "V"], action: "Paste nodes" },
      { keys: ["Ctrl", "A"], action: "Select all nodes" },
      { keys: ["Del", "⌫"], action: "Delete selected" },
      { keys: ["Esc"], action: "Deselect all" },
    ],
    accent: "#a371f7",
  },
  {
    icon: Mic,
    title: "Explain as you design",
    body: "Hit \"Begin your answer\" in the Interview Room and talk through your choices. A 1.7-second silence ends your turn and sends your explanation to the Sarvam AI tech-lead for review.",
    accent: "#3fb950",
  },
  {
    icon: Cpu,
    title: "AI will challenge you",
    body: "After every canvas update or voice pause the AI evaluates your architecture. Expect questions about single points of failure, bottlenecks, and trade-offs — the same you'd face in a real senior interview.",
    accent: "#d29922",
  },
  {
    icon: Copy,
    title: "Tips for a strong design",
    tips: [
      "Always start with a load balancer — it's a single point of control.",
      "Add a cache layer before your database for read-heavy paths.",
      "Use a queue to decouple write-heavy or async work.",
      "Think about read replicas when the interviewer mentions scale.",
      "CDN = fast static / media delivery. Always mention it.",
    ],
    accent: "#58a6ff",
  },
]

function HelpModal({ onClose }: { onClose: () => void }) {
  const [slide, setSlide] = useState(0)
  const current = HELP_SLIDES[slide]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#e8e1da] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e8e1da] px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#ef4a18]" />
            <span className="text-sm font-semibold text-gray-900">How to use Wire It Up</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#f4f1ed] hover:text-gray-700"
          >
            <X size={15} />
          </button>
        </div>

        <div className="min-h-[260px] px-6 py-6">
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${current.accent}18`, color: current.accent }}
          >
            <Icon size={24} />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900">{current.title}</h3>

          {current.body && (
            <p className="text-sm leading-7 text-gray-600">{current.body}</p>
          )}

          {current.shortcuts && (
            <div className="mt-1 space-y-2">
              {current.shortcuts.map(({ keys, action }) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{action}</span>
                  <div className="flex gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border border-[#e8e1da] bg-[#f4f1ed] px-2 py-0.5 text-[11px] font-mono font-semibold text-gray-700"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {current.tips && (
            <ul className="mt-1 space-y-2.5">
              {current.tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm leading-5 text-gray-600">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#287443]" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#e8e1da] px-6 py-4">
          <div className="flex gap-1.5">
            {HELP_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === slide ? "w-6 bg-[#ef4a18]" : "w-1.5 bg-[#e8e1da] hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              disabled={slide === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e1da] text-gray-500 transition hover:bg-[#f4f1ed] disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            {slide < HELP_SLIDES.length - 1 ? (
              <button
                onClick={() => setSlide((s) => s + 1)}
                className="flex items-center gap-1.5 rounded-lg bg-[#ef4a18] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#d93d10]"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-lg bg-[#ef4a18] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#d93d10]"
              >
                Got it <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Briefing ─────────────────────────────────────────────────────────────
export function SystemDesignBriefing({ onStart }: { onStart: (challenge: DesignChallenge) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [challenges, setChallenges] = useState<DesignChallenge[]>(FALLBACK_CHALLENGES)
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [aiError, setAiError] = useState<string | null>(null)

  const selected = challenges.find((c) => c.id === selectedId) || null

  const doFetch = async (refresh = false) => {
    setLoadingChallenges(true)
    setAiError(null)
    if (refresh) setSelectedId(null)
    try {
      const res = await fetch(`${API_URL}/api/system-design/challenges`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 3, refresh }),
      })
      if (!res.ok) throw new Error("AI challenges unavailable")
      const data = await res.json()
      if (Array.isArray(data.challenges) && data.challenges.length > 0) {
        setChallenges(data.challenges)
      }
    } catch {
      setAiError(
        refresh
          ? "Could not refresh — showing previous challenges."
          : "Using curated challenges — AI generation is temporarily unavailable."
      )
      if (!refresh) setChallenges(FALLBACK_CHALLENGES)
    } finally {
      setLoadingChallenges(false)
    }
  }

  useEffect(() => {
    doFetch(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="w-full max-w-5xl">
        <div className="mx-auto max-w-5xl">
          {/* Page header */}
          <div className="mb-10 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ef4a18]/25 bg-[#fff0eb] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ef4a18]">
                <Layers3 size={14} /> Wire It Up interview
              </span>
              <button
                onClick={() => setShowHelp(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e1da] bg-white px-3 py-1 text-xs font-medium text-gray-500 transition hover:border-[#ef4a18]/40 hover:text-[#ef4a18]"
              >
                <HelpCircle size={13} /> How to use
              </button>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Choose your system-design brief.
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Pick one scenario. You'll get the full interview context and constraints before opening the canvas.
            </p>
          </div>

          {!selected ? (
            <div>
              {/* Toolbar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {loadingChallenges ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-[#ef4a18]" />
                      Generating fresh challenges with Sarvam AI…
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-[#ef4a18]" />
                      {aiError ? "Curated challenges" : "AI-generated challenges"}
                    </>
                  )}
                </div>
                <button
                  onClick={() => doFetch(true)}
                  disabled={loadingChallenges}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e1da] px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#ef4a18]/40 hover:text-[#ef4a18] disabled:opacity-40"
                >
                  <Sparkles size={12} /> Generate new set
                </button>
              </div>

              {aiError && (
                <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {aiError}
                </p>
              )}

              {/* Challenge cards */}
              <div className="grid gap-4 md:grid-cols-3">
                {loadingChallenges
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-52 animate-pulse rounded-2xl border border-[#e8e1da] bg-white" />
                    ))
                  : challenges.map((challenge) => (
                      <button
                        key={challenge.id}
                        onClick={() => setSelectedId(challenge.id)}
                        className="group rounded-2xl border border-[#e8e1da] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#ef4a18]/40 hover:shadow-lg"
                      >
                        <MessageSquareText className="mb-8 text-[#ef4a18]" size={24} />
                        <h2 className="text-lg font-semibold text-gray-900">{challenge.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{challenge.summary}</p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#ef4a18]">
                          View brief <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                        </span>
                      </button>
                    ))}
              </div>

              {/* Quick-start hint */}
              <div className="mt-8 rounded-xl border border-[#e8e1da] bg-[#fdfaf7] px-5 py-4">
                <div className="flex items-start gap-3">
                  <HelpCircle size={16} className="mt-0.5 shrink-0 text-[#ef4a18]" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New here? Here's what happens next</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Pick a challenge → read the brief → open the canvas → drag infrastructure components and connect
                      them → explain your choices to the AI tech lead via voice. Use{" "}
                      <button
                        onClick={() => setShowHelp(true)}
                        className="font-medium text-[#ef4a18] underline underline-offset-2"
                      >
                        How to use
                      </button>{" "}
                      for keyboard shortcuts and pro tips.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <section className="rounded-2xl border border-[#e8e1da] bg-white p-6 shadow-xl sm:p-9">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-sm text-gray-400 transition hover:text-gray-900"
                >
                  ← Choose another scenario
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e1da] px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-[#ef4a18]/40 hover:text-[#ef4a18]"
                >
                  <HelpCircle size={13} /> How to use
                </button>
              </div>

              <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
                <div>
                  <p className="text-sm font-medium text-[#ef4a18]">Your main question</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{selected.title}</h2>
                  <p className="mt-5 text-base leading-7 text-gray-700">{selected.prompt}</p>
                  <div className="mt-7 flex items-center gap-2 text-xs text-gray-500">
                    <Clock3 size={14} />
                    Talk through your choices as you draw. The tech lead will challenge specific anti-patterns after you
                    pause.
                  </div>

                  {/* Keyboard quick-ref */}
                  <div className="mt-6 rounded-xl border border-[#e8e1da] bg-[#fdfaf7] px-4 py-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <Keyboard size={12} /> Canvas shortcuts
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        { keys: "Ctrl+C", action: "Copy" },
                        { keys: "Ctrl+X", action: "Cut" },
                        { keys: "Ctrl+V", action: "Paste" },
                        { keys: "Ctrl+A", action: "Select all" },
                        { keys: "Del / ⌫", action: "Delete" },
                        { keys: "Esc", action: "Deselect" },
                      ].map(({ keys, action }) => (
                        <div key={keys} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500">{action}</span>
                          <kbd className="rounded border border-[#e8e1da] bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-600">
                            {keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 rounded-xl border border-[#e8e1da] bg-[#fdfaf7] p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Constraints</p>
                    <ul className="mt-3 space-y-3">
                      {selected.requirements.map((item) => (
                        <li className="flex gap-2 text-sm leading-5 text-gray-700" key={item}>
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#287443]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Discuss as you design
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.focus.map((item) => (
                        <span
                          className="rounded-full border border-[#e8e1da] bg-white px-2.5 py-1 text-xs text-gray-600"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">What to focus on</p>
                    <ul className="mt-3 space-y-2">
                      {[
                        "Start with a load balancer",
                        "Add cache for read-heavy paths",
                        "Use queues for async work",
                        "Consider read replicas at scale",
                        "Mention CDN for static/media",
                      ].map((tip) => (
                        <li key={tip} className="flex gap-2 text-xs leading-5 text-gray-600">
                          <Sparkles size={11} className="mt-0.5 shrink-0 text-[#ef4a18]" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStart(selected)}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ef4a18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93d10] hover:-translate-y-0.5"
              >
                Start designing <ArrowRight size={16} />
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
