import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Share2 } from "lucide-react"
import { ResearchKnowledgeGraph } from "@/components/knowledge-graph"

export default function GraphPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="gradient-overlay h-svh overflow-hidden flex flex-col">
        <header className="flex h-16 shrink-0 items-center px-6 border-b border-border/40 bg-background/50 backdrop-blur-md z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-70">
            <Share2 className="size-3.5 text-primary" />
            Research Knowledge Graph
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 min-h-0">
          <ResearchKnowledgeGraph />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
