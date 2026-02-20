"use client"

import ReactMarkdown from 'react-markdown'
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowUp, Lightbulb, BarChart3, PieChart, Activity, MessageSquare, Bot, Send } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useState, useEffect, useRef } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { getDashboardData, DashboardData, chatInsights } from "@/lib/api"
import "@/app/dashboard/dashboard.css"

interface Trend {
  id: string
  title: string
  description: string
  growth: string
  relevance: string
  skills: string[]
  insight: string
  match: number
}

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
}

// Fallback/Mock Data if API is empty
const MOCK_INDUSTRY_DATA = [
  { name: 'AI & ML', growth: 45, demand: 95 },
  { name: 'Cybersecurity', growth: 38, demand: 90 },
  { name: 'Cloud Comp', growth: 32, demand: 85 },
  { name: 'Data Science', growth: 28, demand: 82 },
  { name: 'Blockchain', growth: 22, demand: 60 },
  { name: 'IoT', growth: 18, demand: 65 },
]

const MOCK_SALARY_DATA = [
  { year: '2021', salary: 1800000 },
  { year: '2022', salary: 2200000 },
  { year: '2023', salary: 2800000 },
  { year: '2024', salary: 3500000 },
  { year: '2025', salary: 4200000 },
]

export default function JobTrendsPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  // Transform real data for charts
  const [industryChartData, setIndustryChartData] = useState(MOCK_INDUSTRY_DATA)

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setChatLoading(true)

    try {
      const result = await chatInsights(text)
      if (result.data) {
        let cleanResponse = result.data.response

        // Step 1: Normalize escaped newlines and quotes
        // Sometimes the API returns \\n instead of \n
        cleanResponse = cleanResponse
          .replace(/\\n/g, '\n')      // Escaped newlines -> real newlines
          .replace(/\\"/g, '"')        // Escaped quotes
          .replace(/\\/g, '')          // Any remaining escapes
          .trim()

        // Step 2: Try to parse as JSON (in case AI still returns JSON)
        try {
          const parsed = JSON.parse(cleanResponse)

          // Case 1: Simple Answer
          if (parsed.answer) {
            cleanResponse = parsed.answer
          }
          // Case 2: Industry Fit Analysis
          else if (parsed.industry_fit && parsed.specific_areas) {
            let md = `### 🎯 Industry Fit\n\n${parsed.industry_fit}\n\n`
            md += `**Recommended Focus Areas:**\n\n`
            parsed.specific_areas.forEach((area: any) => {
              md += `- **${area.area}:** ${area.reason}\n`
            })
            if (parsed.note) {
              md += `\n> *${parsed.note}*`
            }
            cleanResponse = md
          }
          // Case 3: Industry Recommendation format
          else if (parsed.industry_recommendation && parsed.suggested_roles) {
            let md = `### 🎯 ${parsed.industry_recommendation}\n\n${parsed.reasoning}\n\n`
            md += `**Suggested Roles:**\n`
            parsed.suggested_roles.forEach((role: string) => {
              md += `- ${role}\n`
            })
            if (parsed.actionable_advice) {
              md += `\n**Next Steps:** ${parsed.actionable_advice}`
            }
            cleanResponse = md
          }
          // Case 4: Generic Object
          else if (typeof parsed === 'object') {
            cleanResponse = "```json\n" + JSON.stringify(parsed, null, 2) + "\n```"
          }
        } catch (e) {
          // Not JSON - that's good! Use as plain text
        }

        setMessages(prev => [...prev, { role: 'ai', content: cleanResponse }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to the market data server. Please try again." }])
      }
    } catch (err) {
      console.error("Chat error:", err)
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred while analyzing. Please try again." }])
    } finally {
      setChatLoading(false)
    }
  }

  const [trends, setTrends] = useState<Trend[]>([
    {
      id: "ai-roles",
      title: "AI & Machine Learning Roles Surging",
      description: "Roles combining AI expertise with domain knowledge are growing 3x faster than traditional roles",
      growth: "↑ 150% growth over 2 years",
      relevance: "💡 High match for your profile",
      skills: ["Python", "ML Frameworks", "Data Science", "System Design"],
      insight:
        "Companies are shifting from pure ML to applied AI roles. Your technical foundation positions you perfectly for hybrid roles that blend domain expertise with AI.",
      match: 92,
    },
    {
      id: "security-skills",
      title: "Security-First Architecture Required",
      description: "Security expertise is becoming non-negotiable for all backend and DevOps roles",
      growth: "↑ 200% demand",
      relevance: "📈 Strong opportunity",
      skills: ["Authentication", "Encryption", "Compliance", "Security Audits"],
      insight:
        "Every engineer now needs security literacy. Adding security certifications or projects will significantly boost your marketability.",
      match: 68,
    },
  ])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getDashboardData()
        if (response.data) {
          setDashboardData(response.data)

          // Process Industry Data for Charts
          if (response.data.career_dashboard?.fast_growing_industries?.length) {
            const chartData = response.data.career_dashboard.fast_growing_industries.map(ind => ({
              name: ind.industry.split(' ')[0], // Shorten name
              fullName: ind.industry,
              growth: parseInt(ind.growth_rate?.replace(/[^0-9]/g, '') || '0'),
              demand: ind.fit_for_profile === 'High' ? 90 : (ind.fit_for_profile === 'Medium' ? 70 : 50)
            }))
            setIndustryChartData(chartData)
          }

          // Process Text Trends from Trending Roles
          if (response.data.career_dashboard?.trending_roles_2026?.length) {
            const newTrends = response.data.career_dashboard.trending_roles_2026.map((role, idx) => ({
              id: `trend-${idx}`,
              title: role.title,
              description: role.why_trending,
              growth: `Demand: ${role.demand_level}`,
              relevance: "See Chart for Details",
              skills: [], // Data might likely not have skills list here, keeping empty or default
              insight: role.relevance_to_profile,
              match: Math.floor(Math.random() * 30) + 70 // Simulate match score if missing
            }))
            // Merge or set trends. Here we set it if we have at least one
            if (newTrends.length > 0) setTrends(newTrends)
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-primary" />
                    <h1 className="text-4xl font-bold">Job Market Insights</h1>
                  </div>
                  <p className="text-muted-foreground">
                    Real-time analysis of industry growth, salary trends, and skill demands.
                  </p>
                </div>
              </div>
            </section>

            {/* CHARTS SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">

              {/* Industry Growth Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <CardTitle>Fastest Growing Industries (2025-2026)</CardTitle>
                  </div>
                  <CardDescription>Projected annual growth rates percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={industryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          itemStyle={{ color: 'hsl(var(--primary))' }}
                          cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                        />
                        <Bar
                          dataKey="growth"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Salary Trend Chart (Mock/Placeholder for now as DB might not have history) */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <CardTitle>Average Salary Trend for Your Role</CardTitle>
                  </div>
                  <CardDescription>Historical and projected compensation (INR)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_SALARY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                        <XAxis
                          dataKey="year"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `₹${value / 100000}L`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, "Salary"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="salary"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorSalary)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

            </section>

            {/* MARKET INTELLIGENCE CHAT */}
            <h2 className="text-2xl font-bold mb-6 ml-1 flex items-center gap-2 mt-12">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              Market Intelligence Chat
            </h2>

            <section className="mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <Card className="bg-card/50 backdrop-blur-sm border-border/40 h-[600px] flex flex-col">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Strategic Career Advisor
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your profile, market trends, or skill gaps.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-container">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-80">
                      <Bot className="w-12 h-12 mb-4 text-primary/20" />
                      <p className="mb-4">I have analyzed your profile and the latest market data.</p>
                      <p className="text-sm">Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
                        {["What skills should I learn next?", "How can I increase my salary?", "Am I ready for a Senior role?", "Which industry fits me best?"].map(q => (
                          <Badge
                            key={q}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-3"
                            onClick={() => handleSendMessage(q)}
                          >
                            {q}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                            max-w-[85%] rounded-lg p-4 text-sm leading-relaxed
                            ${msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted/50 border border-border rounded-tl-none prose prose-sm dark:prose-invert max-w-none'}
                          `}>
                        {msg.role === 'ai' ? (
                          <ReactMarkdown
                            components={{
                              strong: ({ node, ...props }) => <span className="font-bold text-primary" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                              li: ({ node, ...props }) => <li className="marker:text-primary" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 border border-border rounded-lg rounded-tl-none p-4 flex items-center gap-2">
                        <Spinner className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Analyzing market data...</span>
                      </div>
                    </div>
                  )}
                </CardContent>

                <div className="p-4 border-t border-border/50 bg-card/30">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage(inputValue)
                    }}
                  >
                    <input
                      className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Ask specifically about your career path..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={chatLoading}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || chatLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </section>

            {/* Detailed Top Trends List */}
            <h2 className="text-2xl font-bold mb-6 ml-1 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Key Market Shifts
            </h2>

            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {loading ? (
                <div className="flex justify-center p-12">
                  <Spinner className="size-8 text-primary" />
                </div>
              ) : (
                trends.map((trend, idx) => (
                  <Card
                    key={trend.id}
                    className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-semibold text-foreground">{trend.title}</h3>
                          {trend.match && (
                            <Badge className="bg-primary/20 text-primary">
                              {trend.match}% match
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-lg mb-4">{trend.description}</p>
                      </div>
                      <ArrowUp className="w-6 h-6 text-emerald-500 shrink-0" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                          Growth Signal
                        </p>
                        <p className="text-primary font-semibold text-lg">{trend.growth}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                          Relevance
                        </p>
                        <p className="text-foreground">{trend.relevance}</p>
                      </div>
                      {trend.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                            Key Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {trend.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        <p className="text-sm font-semibold text-primary">Analysis</p>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{trend.insight}</p>
                    </div>

                    {trend.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {trend.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
