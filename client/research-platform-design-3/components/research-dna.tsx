"use client"

import { BrainCircuit, Fingerprint } from "lucide-react"

const dnaSectors = [
  { label: "Semantic AI", value: 85, color: "var(--primary)" },
  { label: "Graph Theory", value: 62, color: "oklch(0.60 0.18 200)" },
  { label: "Distributed Systems", value: 45, color: "oklch(0.65 0.16 140)" },
  { label: "Quantum Logic", value: 28, color: "oklch(0.70 0.18 350)" },
]

export function ResearchDNA() {
  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group border-none shadow-2xl h-full flex flex-col">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Fingerprint className="size-32 text-primary" />
      </div>

      <div className="space-y-1 mb-8 relative">
        <h3 className="font-serif text-2xl font-bold">Research DNA</h3>
        <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
          Domain Specialization Map
        </p>
      </div>

      <div className="flex-1 space-y-6 relative">
        {dnaSectors.map((sector) => (
          <div key={sector.label} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium tracking-tight">
              <span className="text-foreground/80">{sector.label}</span>
              <span className="text-primary font-serif italic">{sector.value}% match</span>
            </div>
            <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${sector.value}%`,
                  backgroundColor: sector.color,
                  boxShadow: `0 0 10px ${sector.color}40`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-border/40 relative">
        <div className="flex items-center gap-3 text-xs text-muted-foreground italic font-medium">
          <BrainCircuit className="size-4 text-primary" />
          AI Insight: "Your work is converging towards Neural-Symbolic computing."
        </div>
      </div>
    </div>
  )
}
