"use client"

import { CheckCircle2, Clock, Send, FileText, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const stages = [
  { id: "idea", label: "Idea", icon: Clock, status: "completed", date: "Jan 12, 2024" },
  { id: "draft", label: "Draft", icon: FileText, status: "completed", date: "Feb 28, 2024" },
  { id: "submitted", label: "Submitted", icon: Send, status: "completed", date: "Mar 15, 2024" },
  { id: "review", label: "Peer Review", icon: Activity, status: "current", date: "In Progress" },
  { id: "accepted", label: "Accepted", icon: CheckCircle2, status: "pending", date: "Est. May 2024" },
  { id: "published", label: "Published", icon: Globe, status: "pending", date: "Est. June 2024" },
]

export function LifecycleTracker() {
  return (
    <div className="glass p-8 rounded-[2rem] border-none shadow-xl">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h3 className="font-serif text-2xl font-bold">Research Lifecycle</h3>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
            Project: Neural-Symbolic Reasoning
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold uppercase tracking-widest">
          Active Submission
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/40 -translate-y-1/2 hidden md:block" />

        {stages.map((stage, idx) => {
          const Icon = stage.icon
          const isCompleted = stage.status === "completed"
          const isCurrent = stage.status === "current"

          return (
            <div key={stage.id} className="relative z-10 flex flex-row md:flex-col items-center gap-4 flex-1">
              <div
                className={cn(
                  "size-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-lg",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border",
                  isCurrent && "bg-primary/20 border-primary text-primary animate-pulse",
                )}
              >
                <Icon className="size-5" />
              </div>

              <div className="flex flex-col md:items-center gap-1">
                <span
                  className={cn(
                    "text-sm font-serif font-bold",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground opacity-60">
                  {stage.date}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { Activity } from "lucide-react"
