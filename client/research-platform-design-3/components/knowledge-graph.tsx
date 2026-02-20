"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Share2, Info, BookOpen, Users, BrainCircuit, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

type Node = {
  id: string
  label: string
  type: "domain" | "paper" | "author"
  x: number
  y: number
  details: {
    description: string
    stats?: string
    tags: string[]
  }
}

type Edge = {
  from: string
  to: string
}

const nodes: Node[] = [
  {
    id: "center",
    label: "Distributed Consensus",
    type: "domain",
    x: 400,
    y: 300,
    details: {
      description: "The primary focus of current IT department research initiatives, exploring fault tolerance.",
      stats: "128 Papers • 14 Faculty",
      tags: ["Core Domain", "IT-2025"],
    },
  },
  {
    id: "n1",
    label: "Byzantine Fault Tolerance",
    type: "domain",
    x: 250,
    y: 150,
    details: {
      description: "Sub-domain focusing on systems that can reach consensus despite arbitrary failures.",
      stats: "42 Papers",
      tags: ["Active", "High Impact"],
    },
  },
  {
    id: "n2",
    label: "Paxos Variants",
    type: "domain",
    x: 550,
    y: 150,
    details: {
      description: "Evolution of classical consensus protocols in modern cloud environments.",
      stats: "31 Papers",
      tags: ["Legacy", "Reference"],
    },
  },
  {
    id: "p1",
    label: "Vance et al. 2024",
    type: "paper",
    x: 150,
    y: 100,
    details: {
      description: "Adaptive Neural Consensus in Byzantine Environments.",
      stats: "Cited by 12",
      tags: ["Recent", "Neural-Symbolic"],
    },
  },
  {
    id: "p2",
    label: "Chen et al. 2023",
    type: "paper",
    x: 350,
    y: 80,
    details: {
      description: "Scaling BFT for Global Networks.",
      stats: "Cited by 45",
      tags: ["Infrastructure", "Scalability"],
    },
  },
  {
    id: "a1",
    label: "Dr. Elias Vance",
    type: "author",
    x: 650,
    y: 250,
    details: {
      description: "Principal Researcher in Distributed Systems.",
      stats: "h-index: 24",
      tags: ["Faculty", "Principal"],
    },
  },
]

const edges: Edge[] = [
  { from: "center", to: "n1" },
  { from: "center", to: "n2" },
  { from: "n1", to: "p1" },
  { from: "n1", to: "p2" },
  { from: "center", to: "a1" },
]

export function ResearchKnowledgeGraph() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  return (
    <div className="relative h-full w-full glass rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card/30 to-background">
      {/* Search & Filters Overlay */}
      <div className="absolute top-8 left-8 z-10 flex gap-4">
        <div className="glass-strong h-12 flex items-center px-4 rounded-2xl gap-3 border-primary/20 min-w-[300px]">
          <Search className="size-4 text-primary" />
          <input
            placeholder="Search the knowledge matrix..."
            className="bg-transparent border-none outline-none text-sm font-serif italic w-full"
          />
        </div>
        <Button variant="outline" className="h-12 rounded-2xl glass-strong border-primary/20 gap-2 px-6 bg-transparent">
          <Filter className="size-4 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Filter Lens</span>
        </Button>
      </div>

      {/* Graph Area */}
      <div className="h-full w-full cursor-grab active:cursor-grabbing p-12">
        <svg viewBox="0 0 800 600" className="h-full w-full">
          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find((n) => n.id === edge.from)!
            const toNode = nodes.find((n) => n.id === edge.to)!
            const isHighlighted =
              hoveredNode === edge.from ||
              hoveredNode === edge.to ||
              selectedNode?.id === edge.from ||
              selectedNode?.id === edge.to

            return (
              <motion.line
                key={`${edge.from}-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isHighlighted ? "oklch(var(--primary))" : "oklch(var(--primary) / 0.1)"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={edge.from === "center" ? "0" : "4 2"}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id
            const isHovered = hoveredNode === node.id
            const isRelated =
              hoveredNode &&
              edges.some(
                (e) => (e.from === node.id && e.to === hoveredNode) || (e.to === node.id && e.from === hoveredNode),
              )

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node)}
              >
                {/* Glow Effect */}
                <AnimatePresence>
                  {(isHovered || isSelected) && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === "domain" ? 45 : 35}
                      fill="oklch(var(--primary) / 0.1)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.type === "domain" ? 28 : 22}
                  className={
                    isSelected
                      ? "fill-primary stroke-primary/50"
                      : isHovered || isRelated
                        ? "fill-primary/40 stroke-primary"
                        : "fill-card stroke-primary/20"
                  }
                  strokeWidth={2}
                  whileHover={{ scale: 1.1 }}
                />

                <motion.text
                  x={node.x}
                  y={node.y + (node.type === "domain" ? 45 : 40)}
                  textAnchor="middle"
                  className={`font-serif text-[10px] tracking-tight ${
                    isSelected ? "fill-primary font-bold" : "fill-muted-foreground"
                  }`}
                  animate={{ opacity: hoveredNode && !isHovered && !isRelated ? 0.3 : 1 }}
                >
                  {node.label}
                </motion.text>

                {/* Node Icons (Visual distinction) */}
                <foreignObject x={node.x - 8} y={node.y - 8} width="16" height="16" className="pointer-events-none">
                  <div className="flex items-center justify-center">
                    {node.type === "domain" && (
                      <Share2 className={`size-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    )}
                    {node.type === "paper" && (
                      <BookOpen className={`size-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    )}
                    {node.type === "author" && (
                      <Users className={`size-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    )}
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Side Panel (AI Insight) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-[400px] glass-strong border-l border-primary/20 z-20 p-10 flex flex-col gap-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <BrainCircuit className="size-4" />
                Intelligence Panel
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNode(null)}
                className="rounded-full hover:bg-primary/10 text-muted-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold leading-tight">{selectedNode?.label}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNode?.details.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-serif italic">Contextual Summary</div>
                <p className="text-foreground leading-relaxed font-medium">{selectedNode?.details.description}</p>
              </div>

              {selectedNode?.details.stats && (
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                      Impact Metric
                    </div>
                    <div className="font-serif text-xl font-bold text-primary">{selectedNode?.details.stats}</div>
                  </div>
                  <Info className="size-5 text-primary opacity-50" />
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-border/40 space-y-4">
              <Button className="w-full rounded-2xl bg-primary text-primary-foreground font-serif italic text-lg h-14 hover:opacity-90 transition-all">
                Synthesize Connection
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-2xl border-primary/20 font-serif italic h-14 bg-transparent"
              >
                Open in Graph View
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend / Stats overlay */}
      <div className="absolute bottom-8 left-8 flex gap-8 glass-strong p-4 rounded-2xl border-primary/10">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">Network Density</span>
          <span className="font-serif text-lg font-bold">High (0.84)</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] uppercase tracking-widest font-bold text-muted-foreground">
            Cluster Coefficient
          </span>
          <span className="font-serif text-lg font-bold">0.72</span>
        </div>
      </div>
    </div>
  )
}
