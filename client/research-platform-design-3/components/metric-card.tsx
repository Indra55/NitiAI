"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  onClick?: () => void
}

export function MetricCard({ label, value, change, icon: Icon, trend = "neutral", onClick }: MetricCardProps) {
  const trendColor = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  }[trend]

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {change && <p className={`text-xs ${trendColor}`}>{change}</p>}
        </div>
        {Icon && <Icon className={`w-6 h-6 ${trendColor} opacity-70`} />}
      </div>
    </Card>
  )
}
