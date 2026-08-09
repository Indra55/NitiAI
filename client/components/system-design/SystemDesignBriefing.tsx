"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Clock3, Layers3, MessageSquareText } from "lucide-react"

export type DesignChallenge = {
  id: string
  title: string
  summary: string
  prompt: string
  requirements: string[]
  focus: string[]
}

const challenges: DesignChallenge[] = [
  {
    id: "social-feed",
    title: "Design a social media feed",
    summary: "Build a home feed that stays fast as creators and readers scale.",
    prompt: "Design the backend for a social-media home feed. Users follow creators, publish posts, and need a relevant, low-latency feed when they open the app.",
    requirements: ["Serve a feed in under 200ms for active users", "Support millions of followers for popular creators", "Keep new posts visible without overloading the database"],
    focus: ["Read vs. write paths", "Caching and fan-out", "Database scaling"],
  },
  {
    id: "flash-sale",
    title: "Design a flash-sale checkout",
    summary: "Handle a burst of buyers without overselling a limited inventory item.",
    prompt: "Design a checkout system for a flash sale with 100,000 units and millions of simultaneous purchase attempts. Prevent overselling while keeping checkout responsive.",
    requirements: ["Never oversell inventory", "Absorb sudden traffic spikes", "Process payment and order work reliably in the background"],
    focus: ["Load shedding", "Queues and idempotency", "Consistency boundaries"],
  },
  {
    id: "photo-sharing",
    title: "Design photo sharing",
    summary: "Upload, transform, and deliver photos worldwide with smooth playback.",
    prompt: "Design a photo-sharing service where users upload images, receive resized variants, and view public photos globally with low latency.",
    requirements: ["Upload and process large image files", "Generate thumbnails asynchronously", "Deliver popular media quickly around the world"],
    focus: ["Object/media processing", "Async jobs", "CDN and caching"],
  },
]

export function SystemDesignBriefing({ onStart }: { onStart: (challenge: DesignChallenge) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = challenges.find((challenge) => challenge.id === selectedId) || null

  return (
    <div className="w-full max-w-5xl">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-[#ef4a18]/25 bg-[#fff0eb] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ef4a18]"><Layers3 size={14} /> Wire It Up interview</span><h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Choose your system-design brief.</h1><p className="mt-4 text-base leading-7 text-gray-600">Pick one scenario first. You’ll get the interview context and constraints before opening the architecture canvas.</p></div>
        {!selected ? <div className="grid gap-4 md:grid-cols-3">{challenges.map((challenge) => <button key={challenge.id} onClick={() => setSelectedId(challenge.id)} className="group rounded-2xl border border-[#e8e1da] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#ef4a18]/40 hover:shadow-lg"><MessageSquareText className="mb-8 text-[#ef4a18]" size={24} /><h2 className="text-lg font-semibold text-gray-900">{challenge.title}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{challenge.summary}</p><span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#ef4a18]">View brief <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></button>)}</div> : <section className="rounded-2xl border border-[#e8e1da] bg-white p-6 shadow-xl sm:p-9"><button onClick={() => setSelectedId(null)} className="text-sm text-gray-400 transition hover:text-gray-900">← Choose another scenario</button><div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_.75fr]"><div><p className="text-sm font-medium text-[#ef4a18]">Your main question</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{selected.title}</h2><p className="mt-5 text-base leading-7 text-gray-700">{selected.prompt}</p><div className="mt-7 flex items-center gap-2 text-xs text-gray-500"><Clock3 size={14} /> Talk through your choices as you draw. The tech lead will challenge specific anti-patterns after you pause.</div></div><div className="space-y-6 rounded-xl border border-[#e8e1da] bg-[#fdfaf7] p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Constraints</p><ul className="mt-3 space-y-3">{selected.requirements.map((item) => <li className="flex gap-2 text-sm leading-5 text-gray-700" key={item}><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#287443]" />{item}</li>)}</ul></div><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Discuss as you design</p><div className="mt-3 flex flex-wrap gap-2">{selected.focus.map((item) => <span className="rounded-full border border-[#e8e1da] bg-white px-2.5 py-1 text-xs text-gray-600" key={item}>{item}</span>)}</div></div></div></div><button onClick={() => onStart(selected)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#ef4a18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d93d10] hover:-translate-y-0.5">Start designing <ArrowRight size={16} /></button></section>}
      </div>
    </div>
  )
}
