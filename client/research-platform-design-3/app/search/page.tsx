"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Search, Sparkles, Command, Users, BrainCircuit, Quote, Activity, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const suggestions = [
  "Find papers similar to my work on anomaly detection",
  "Who publishes the most in distributed systems?",
  "Suggest papers I should cite for graph embeddings",
  "Recent breakthroughs in post-quantum cryptography",
]

const results = [
  {
    id: 1,
    title: "Adaptive Neural Consensus in Byzantine Environments",
    authors: ["E. Vance", "S. Chen", "M. Rossi"],
    relevance: 98,
    reason: "Directly matches your interest in distributed fault tolerance and recent publications in neural networks.",
    year: 2024,
    citations: 42,
  },
  {
    id: 2,
    title: "Graph-based Semantic Similarity for Academic Discovery",
    authors: ["A. Gupta", "J. Doe"],
    relevance: 85,
    reason: "Discusses the exact methodology you're exploring for the IT department intelligence platform.",
    year: 2023,
    citations: 128,
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="gradient-overlay">
        <header className="flex h-16 shrink-0 items-center px-6 border-b border-border/40 sticky top-0 bg-background/50 backdrop-blur-md z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
            <Search className="size-3.5 text-primary" />
            Semantic Discovery
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Command Search Interface */}
            <section className="space-y-8 py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest">
                  <Command className="size-3" />
                  NLP-Powered Engine
                </div>
                <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight">
                  What are you <span className="text-primary italic">seeking</span> today?
                </h1>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-primary/20 rounded-[1.5rem] shadow-2xl p-2 focus-within:ring-2 ring-primary/20 transition-all duration-300">
                  <Search className="ml-4 size-6 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your research query in natural language..."
                    className="flex-1 bg-transparent border-none text-xl h-16 focus-visible:ring-0 placeholder:italic placeholder:text-muted-foreground/50 font-serif"
                  />
                  <div className="flex items-center gap-2 mr-2">
                    <kbd className="hidden sm:inline-flex h-8 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                    <Button
                      className="rounded-xl h-12 px-6 gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-all"
                      onClick={() => setIsSearching(true)}
                    >
                      <Sparkles className="size-4" />
                      Discover
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {suggestions.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="px-4 py-2 rounded-full glass hover:bg-primary/10 border-primary/10 hover:border-primary/30 text-xs text-muted-foreground hover:text-primary transition-all duration-300 font-serif italic"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </section>

            {/* Results Section */}
            {(isSearching || query) && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h2 className="font-serif text-2xl font-bold flex items-center gap-3">
                    Knowledge Synthesis
                    <Badge
                      variant="outline"
                      className="font-sans font-medium text-[10px] uppercase tracking-wider bg-primary/5 border-primary/20 text-primary"
                    >
                      {results.length} Matches found
                    </Badge>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground text-xs uppercase tracking-widest font-bold"
                  >
                    Filter Matrix
                  </Button>
                </div>

                <div className="space-y-6">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="group relative glass p-8 rounded-[2rem] border-none shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Quote className="size-40" />
                      </div>

                      <div className="grid lg:grid-cols-4 gap-8 relative">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                              <span className="flex items-center gap-1 text-primary">
                                <Activity className="size-3" />
                                {result.relevance}% Match
                              </span>
                              <span>•</span>
                              <span>{result.year}</span>
                            </div>
                            <h3 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors leading-tight">
                              {result.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {result.authors.map((author) => (
                                <span
                                  key={author}
                                  className="flex items-center gap-1 text-sm text-muted-foreground font-medium"
                                >
                                  <Users className="size-3 text-primary/60" />
                                  {author}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                              <BrainCircuit className="size-3.5" />
                              AI Rationale
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{result.reason}"</p>
                          </div>
                        </div>

                        <div className="lg:col-span-1 flex flex-col justify-between border-l border-border/40 pl-8 space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <div className="text-2xl font-serif font-bold text-primary">{result.citations}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                Citations
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-lg font-serif font-bold">Q1</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                Journal Rank
                              </div>
                            </div>
                          </div>

                          <Button
                            className="w-full rounded-xl gap-2 group/btn font-serif italic bg-transparent"
                            variant="outline"
                          >
                            Synthesize
                            <ChevronRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
