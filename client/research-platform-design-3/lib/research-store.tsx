"use client"

import * as React from "react"

export type ResearchPaper = {
  id: string
  title: string
  abstract: string
  authors: string[]
  uploadDate: string
  status: "published" | "draft"
}

type ResearchStoreType = {
  papers: ResearchPaper[]
  addPaper: (paper: Omit<ResearchPaper, "id" | "uploadDate">) => void
}

const ResearchStoreContext = React.createContext<ResearchStoreType | undefined>(undefined)

export function ResearchStoreProvider({ children }: { children: React.ReactNode }) {
  const [papers, setPapers] = React.useState<ResearchPaper[]>([
    {
      id: "1",
      title: "Distributed Consensus in High-Latency Networks",
      abstract: "An analysis of Paxos variants in satellite communication networks.",
      authors: ["Dr. Vance", "Prof. Miller"],
      uploadDate: new Date().toISOString(),
      status: "published",
    },
  ])

  const addPaper = React.useCallback((paperData: Omit<ResearchPaper, "id" | "uploadDate">) => {
    const newPaper: ResearchPaper = {
      ...paperData,
      id: Math.random().toString(36).substring(7),
      uploadDate: new Date().toISOString(),
    }
    setPapers((prev) => [newPaper, ...prev])
  }, [])

  return <ResearchStoreContext.Provider value={{ papers, addPaper }}>{children}</ResearchStoreContext.Provider>
}

export const useResearchStore = () => {
  const context = React.useContext(ResearchStoreContext)
  if (context === undefined) {
    throw new Error("useResearchStore must be used within a ResearchStoreProvider")
  }
  return context
}
