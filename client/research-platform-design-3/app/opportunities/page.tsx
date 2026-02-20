"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, Briefcase, DollarSign, Star } from "lucide-react"
import { useState } from "react"

const opportunities = [
  {
    id: 1,
    role: "Senior SDE - System Design",
    company: "TechCorp",
    location: "SF/Remote",
    salary: "$200-250K",
    match: 92,
    benefits: ["4 weeks PTO", "Stock Options", "Learning Budget"],
    why: "85% skills match. Growth potential 18% YoY. Strong mentor access.",
    urgency: "Hiring Now",
    tags: ["Systems", "Distributed", "Backend"],
  },
  {
    id: 2,
    role: "Tech Lead - Infrastructure",
    company: "CloudScale",
    location: "NYC/Hybrid",
    salary: "$180-220K",
    match: 78,
    benefits: ["3 weeks PTO", "Relocation", "Flexible Hours"],
    why: "Perfect for leadership growth. 65% current skills. Bridges gap perfectly.",
    urgency: "Closing Soon",
    tags: ["Infrastructure", "Leadership", "Scale"],
  },
  {
    id: 3,
    role: "Staff Engineer",
    company: "FinTech Inc",
    location: "Remote",
    salary: "$250-300K",
    match: 65,
    benefits: ["5 weeks PTO", "Signing Bonus", "Equity"],
    why: "Stretch opportunity. Build the gap. High impact. Executive visibility.",
    urgency: "Open Position",
    tags: ["Architecture", "Advanced", "Strategy"],
  },
  {
    id: 4,
    role: "Engineering Manager",
    company: "DataFlow",
    location: "Boston/Remote",
    salary: "$190-230K",
    match: 72,
    benefits: ["Flexible PTO", "Professional Dev", "Conference Budget"],
    why: "Leadership track starter. Your communication skills shine here.",
    urgency: "Hiring Now",
    tags: ["Management", "Leadership", "Growth"],
  },
  {
    id: 5,
    role: "Principal Engineer",
    company: "AI Labs",
    location: "Remote",
    salary: "$280-350K",
    match: 58,
    benefits: ["Unlimited PTO", "Equity Package", "Research Time"],
    why: "Moonshot opportunity. Requires skill acceleration. High reward.",
    urgency: "Accepting Apps",
    tags: ["AI/ML", "Research", "Leadership"],
  },
  {
    id: 6,
    role: "SDE III",
    company: "StartupX",
    location: "SF",
    salary: "$170-210K",
    match: 88,
    benefits: ["Stock Heavy", "Fast Growth", "Equity Upside"],
    why: "Early-stage high impact. Skills perfect fit. 3 year unicorn potential.",
    urgency: "Hiring Now",
    tags: ["Growth", "Startup", "Impact"],
  },
]

const urgencyConfig = {
  "Hiring Now": { color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30" },
  "Closing Soon": { color: "bg-red-500/20 text-red-600 border-red-500/30" },
  "Open Position": { color: "bg-blue-500/20 text-blue-600 border-blue-500/30" },
  "Accepting Apps": { color: "bg-amber-500/20 text-amber-600 border-amber-500/30" },
}

export default function OpportunitiesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [savedOpportunities, setSavedOpportunities] = useState<number[]>([])

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedFilter === "high") return opp.match >= 80
    if (selectedFilter === "saved") return savedOpportunities.includes(opp.id)
    return true
  })

  const toggleSave = (id: number) => {
    setSavedOpportunities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <ProtectedRoute>
      <DynamicNavbar />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-pretty mb-2">Personalized Opportunities Feed</h1>
                <p className="text-muted-foreground font-medium">
                  Role matches curated just for your profile and timeline
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "All Opportunities", count: opportunities.length },
                {
                  id: "high",
                  label: "High Match (80%+)",
                  count: opportunities.filter((o) => o.match >= 80).length,
                },
                { id: "saved", label: "Saved", count: savedOpportunities.length },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  className="gap-2"
                >
                  {filter.label}
                  <Badge variant="secondary">{filter.count}</Badge>
                </Button>
              ))}
            </div>
          </section>

          {/* Opportunities Grid */}
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {filteredOpportunities.map((opp, idx) => (
              <Card
                key={opp.id}
                className="p-6 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-lg cursor-pointer group animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${50 * idx}ms` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                  {/* Job Header */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{opp.role}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{opp.company}</span>
                          <MapPin className="w-4 h-4 ml-2" />
                          <span>{opp.location}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSave(opp.id)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            savedOpportunities.includes(opp.id) ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="lg:col-span-1 p-4 rounded-lg bg-primary/10 border border-primary/30 flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">SKILL MATCH</p>
                    <p className="text-3xl font-bold text-primary">{opp.match}%</p>
                  </div>

                  {/* Salary & Status */}
                  <div className="lg:col-span-1 space-y-2">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs text-emerald-600 font-medium">SALARY</p>
                      </div>
                      <p className="font-bold text-sm text-emerald-600">{opp.salary}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${urgencyConfig[opp.urgency].color}`}>
                      <p className="text-xs font-bold">{opp.urgency}</p>
                    </div>
                  </div>
                </div>

                {/* Why This Role */}
                <div className="mb-4 p-4 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-sm text-foreground">
                    <span className="font-bold text-primary">Why matched:</span> {opp.why}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Benefits & Perks</p>
                  <div className="flex flex-wrap gap-2">
                    {opp.benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {opp.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* CTA */}
                <Button className="w-full gap-2 group/btn">
                  Explore Opportunity
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  )
}
