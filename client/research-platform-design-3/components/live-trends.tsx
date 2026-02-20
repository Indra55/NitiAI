"use client"

import { Zap, ArrowUpRight, Flame } from "lucide-react"

const trends = [
  { topic: "LLM Hallucination Mitigation", momentum: "+142%", papers: 12 },
  { topic: "Retrieval Augmented Generation", momentum: "+89%", papers: 24 },
  { topic: "Privacy-Preserving ML", momentum: "+56%", papers: 8 },
]

export function LiveTrends() {
  return (
    <div className="glass p-6 rounded-2xl border-none shadow-2xl h-full flex flex-col bg-gradient-to-br from-card to-card/50">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="font-serif text-2xl font-bold">Live Trends</h3>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Rising Momentum in IT</p>
        </div>
        <Flame className="size-5 text-primary animate-pulse" />
      </div>

      <div className="space-y-4 flex-1">
        {trends.map((trend) => (
          <div
            key={trend.topic}
            className="group flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all duration-300 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="font-medium text-sm group-hover:text-primary transition-colors">{trend.topic}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {trend.papers} Recent Publications
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-serif italic text-primary font-bold">{trend.momentum}</span>
              <ArrowUpRight className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <button className="mt-8 w-full py-3 rounded-xl border border-primary/20 text-xs font-serif italic font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 group">
        Explore Trend Matrix
        <Zap className="size-3 group-hover:scale-125 transition-transform" />
      </button>
    </div>
  )
}
