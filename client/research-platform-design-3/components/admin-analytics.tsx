"use client"

import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const publicationTimelineData = [
  { year: "2019", publications: 10 },
  { year: "2020", publications: 18 },
  { year: "2021", publications: 25 },
  { year: "2022", publications: 32 },
  { year: "2023", publications: 38 },
  { year: "2024", publications: 40 },
]

const researchDomainsData = [
  { name: "Machine Learning", value: 45, color: "#D4A574" },
  { name: "Distributed Systems", value: 28, color: "#A78BFA" },
  { name: "Security", value: 22, color: "#60A5FA" },
  { name: "NLP", value: 18, color: "#34D399" },
  { name: "IoT", value: 15, color: "#F97316" },
]

const topCollaboratorsData = [
  { name: "Dr. Chen", papers: 12 },
  { name: "Prof. Roberts", papers: 9 },
  { name: "Dr. Wilson", papers: 6 },
  { name: "Dr. Park", papers: 5 },
  { name: "Prof. Martinez", papers: 4 },
]

const monthlyActivityData = [
  { month: "Jan", submissions: 3, reviews: 5, publications: 1 },
  { month: "Feb", submissions: 4, reviews: 3, publications: 2 },
  { month: "Mar", submissions: 2, reviews: 6, publications: 1 },
  { month: "Apr", submissions: 5, reviews: 4, publications: 3 },
  { month: "May", submissions: 3, reviews: 7, publications: 2 },
  { month: "Jun", submissions: 6, reviews: 5, publications: 4 },
]

const chartConfig = {
  publications: {
    label: "Publications",
    color: "#D4A574",
  },
  submissions: {
    label: "Submissions",
    color: "#A78BFA",
  },
  reviews: {
    label: "Reviews",
    color: "#60A5FA",
  },
} satisfies ChartConfig

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Publication Timeline - Top Left */}
        <Card className="glass border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Publication Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={publicationTimelineData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="publicationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A574" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#D4A574" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<ChartTooltipContent className="glass-strong border-primary/20" />} />
                <Area
                  type="monotone"
                  dataKey="publications"
                  stroke="#D4A574"
                  strokeWidth={3}
                  fill="url(#publicationGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Research Domains - Top Right */}
        <Card className="glass border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Research Domains</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-8">
            <div className="flex-1">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie
                    data={researchDomainsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {researchDomainsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent className="glass-strong border-primary/20" />} />
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-3">
              {researchDomainsData.map((domain, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
                    <span className="text-sm text-foreground">{domain.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{domain.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Collaborators - Bottom Left */}
        <Card className="glass border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Top Collaborators</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={topCollaboratorsData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  width={100}
                />
                <Tooltip content={<ChartTooltipContent className="glass-strong border-primary/20" />} />
                <Bar dataKey="papers" fill="#D4A574" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity - Bottom Right */}
        <Card className="glass border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Monthly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <BarChart data={monthlyActivityData} margin={{ left: -20, right: 10 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<ChartTooltipContent className="glass-strong border-primary/20" />} />
                <Bar dataKey="submissions" fill="#A78BFA" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="reviews" fill="#60A5FA" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="publications" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#A78BFA]" />
                <span className="text-xs text-muted-foreground">submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#60A5FA]" />
                <span className="text-xs text-muted-foreground">reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
                <span className="text-xs text-muted-foreground">publications</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
