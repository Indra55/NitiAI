"use client"

import {
  Sparkles,
  Share2,
  Bookmark,
  Download,
  BrainCircuit,
  MessageSquare,
  Network,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PaperDetailView() {
  return (
    <div className="grid lg:grid-cols-3 gap-10">
      {/* Left Column: Content */}
      <div className="lg:col-span-2 space-y-10">
        <section className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary">
              2024 High Impact
            </Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1 border-border bg-card text-muted-foreground">
              Distributed Systems
            </Badge>
          </div>

          <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-tight">
            Adaptive Neural Consensus in <span className="text-primary italic">Byzantine Environments</span>
          </h1>

          <div className="flex items-center gap-6 pt-4 border-b border-border/40 pb-8">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full glass border border-primary/20 flex items-center justify-center font-serif italic text-primary">
                EV
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Dr. Elias Vance</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Lead Author</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full glass border border-border flex items-center justify-center font-serif italic">
                SC
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Dr. Sarah Chen</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Co-Author</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-serif text-2xl font-bold flex items-center gap-3">
            Abstract
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary">
              <MessageSquare className="size-4" />
            </Button>
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed font-medium first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-primary">
            We present a novel approach to distributed consensus that leverages neuro-symbolic logic to adaptively
            mitigate Byzantine failures. By integrating deep learning priors into classical consensus protocols, our
            system achieves 40% higher throughput in adversarial networks while maintaining safety guarantees.
          </p>
        </section>

        <section className="glass p-8 rounded-[2rem] border-none shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
            <Sparkles className="size-48" />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary relative">
            <Sparkles className="size-4" />
            AI Intelligence Synthesis
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative">
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg italic text-foreground/80">Key Contributions</h4>
              <ul className="space-y-3">
                {["Neuro-Symbolic BFT Framework", "Dynamic Adversary Modeling", "Verified Consensus Convergence"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground group">
                      <ChevronRight className="size-4 text-primary mt-0.5 group-hover:translate-x-1 transition-transform" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-lg italic text-foreground/80">Potential Impact</h4>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "This methodology could redefine how institutional repositories handle large-scale data integrity
                challenges in high-latency environments."
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Intelligence Sidebar */}
      <div className="space-y-8">
        <div className="glass p-8 rounded-[2rem] border-none shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">
              Impact Analytics
            </div>
            <Share2 className="size-4 text-primary" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold text-primary">42</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Citations</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-serif font-bold">Q1</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Journal Rank</div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-border/40">
            <Button className="w-full rounded-xl bg-primary text-primary-foreground font-serif italic text-lg h-12 hover:opacity-90 shadow-lg shadow-primary/20">
              Explore Network
              <Network className="ml-2 size-4" />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl h-12 border-primary/20 hover:bg-primary/5 bg-transparent">
                <Download className="mr-2 size-4" />
                PDF
              </Button>
              <Button variant="outline" className="rounded-xl h-12 border-border hover:bg-primary/5 bg-transparent">
                <Bookmark className="mr-2 size-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2rem] border-none shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <BrainCircuit className="size-4" />
            Domain Relevance
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="size-4 text-primary" />
                <span className="text-xs font-serif font-bold italic">IT Dept Core Roadmap</span>
              </div>
              <span className="text-xs font-bold text-primary">98%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              "This paper aligns perfectly with the department's 2025 goal of implementing decentralized
              infrastructure."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
