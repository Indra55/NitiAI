"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface InsightCardProps {
  title: string
  description: string
  insight: string
  actionLabel?: string
  onAction?: () => void
}

export function InsightCard({ title, description, insight, actionLabel = "Explore", onAction }: InsightCardProps) {
  return (
    <Card className="p-6 border-border/40 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="bg-primary/10 rounded-lg p-4 mb-4 border border-primary/20">
        <p className="text-sm font-medium text-foreground">{insight}</p>
      </div>
      <Button onClick={onAction} variant="outline" className="w-full gap-2 hover:bg-primary/10 bg-transparent">
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </Card>
  )
}
