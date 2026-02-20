"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, XAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { year: "2019", citations: 120, publications: 45 },
  { year: "2020", citations: 180, publications: 52 },
  { year: "2021", citations: 320, publications: 61 },
  { year: "2022", citations: 290, publications: 75 },
  { year: "2023", citations: 450, publications: 82 },
  { year: "2024", citations: 680, publications: 95 },
  { year: "2025", citations: 820, publications: 110 },
]

const chartConfig = {
  citations: {
    label: "Citations",
    color: "var(--primary)",
  },
  publications: {
    label: "Publications",
    color: "oklch(0.60 0.18 200)",
  },
} satisfies ChartConfig

export function ResearchPulse() {
  return (
    <Card className="glass overflow-hidden border-none shadow-2xl">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="font-serif text-2xl">Research Pulse</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              Citation Velocity & Output
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <TrendingUp className="size-3.5" />
            +24% Momentum
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={chartData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 10 }}
              dy={10}
            />
            <Tooltip
              content={<ChartTooltipContent indicator="dot" className="glass-strong border-primary/20 font-sans" />}
            />
            <Area
              type="monotone"
              dataKey="citations"
              stroke="var(--primary)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCitations)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
