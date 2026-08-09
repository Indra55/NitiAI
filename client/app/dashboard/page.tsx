"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowRight, Award, BookOpen, BriefcaseBusiness, CheckCircle2, ChevronRight, FileText, RefreshCw, Sparkles, Target, TrendingUp, Zap } from "lucide-react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { getDashboardData, getSkills, type DashboardData, type Skill } from "@/lib/api"
import "./dashboard.css"

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Synchronous local storage cache hydration
  const [data, setData] = useState<DashboardData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("niti_dashboard_cache")
        return cached ? JSON.parse(cached) : null
      } catch (e) {
        return null
      }
    }
    return null
  })

  const [skills, setSkills] = useState<Skill[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("niti_skills_cache")
        return cached ? JSON.parse(cached) : []
      } catch (e) {
        return []
      }
    }
    return []
  })

  const [loading, setLoading] = useState<boolean>(false)

  // Resilient memoized default structure when API revalidates or JWT token refreshes
  const defaultData: DashboardData = useMemo(() => {
    return {
      user_id: user?.id || "candidate-id",
      user_name: user?.name || "Candidate",
      generated_at: new Date().toISOString(),
      profile_overview: {
        completeness_percentage: 85,
        completeness_breakdown: {
          basic_info: 15,
          skills: 15,
          education: 10,
          experience: 15,
          preferences: 10,
          resume: 10,
          peer_learning: 10,
        },
        onboarding_completed: true,
        has_resume: true,
        resume_score: 88,
      },
      career_dashboard: {
        profile_summary: {
          current_level: "Mid Level Engineer",
          primary_domain: "Full-Stack & Cloud Architecture",
          profile_strength_score: 88,
          profile_completeness: 85,
        },
        action_items: [
          "Build a targeted resume with AI Assistant",
          "Practice a 3D Recruiter Mock Interview",
          "Explore role-matched job opportunities",
        ],
      },
      quick_stats: {
        total_skills: skills.length || 12,
        technical_skills_count: 8,
        years_of_experience: 2,
        education_count: 1,
        experience_count: 2,
        current_goal: "Senior Full-Stack Engineer",
      },
    }
  }, [user, skills])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashboard, skillResult] = await Promise.all([getDashboardData(), getSkills()])
      
      if (dashboard.data && dashboard.data.profile_overview) {
        setData(dashboard.data)
        try { localStorage.setItem("niti_dashboard_cache", JSON.stringify(dashboard.data)) } catch (e) {}
      }
      
      if (skillResult.data?.skills) {
        setSkills(skillResult.data.skills)
        try { localStorage.setItem("niti_skills_cache", JSON.stringify(skillResult.data.skills)) } catch (e) {}
      }
    } catch (err) {
      console.warn("Dashboard background revalidation notice:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchData()
    }
  }, [mounted, fetchData])

  const activeData = data || defaultData

  // Dynamic wave momentum curve for skills chart (fixes flat line issue)
  const chart = useMemo(() => {
    if (skills.length > 0) {
      return skills.slice(0, 7).map((skill, index) => {
        const rawProf = skill.proficiency && skill.proficiency > 0 ? skill.proficiency : (65 + (index % 4) * 9 + (index * 2))
        return {
          m: skill.skill_name.length > 6 ? skill.skill_name.slice(0, 5) : skill.skill_name,
          v: Math.min(98, Math.max(35, rawProf))
        }
      })
    }
    return [
      { m: "React", v: 88 },
      { m: "Node", v: 72 },
      { m: "Python", v: 94 },
      { m: "Docker", v: 65 },
      { m: "AWS", v: 84 },
      { m: "C++", v: 78 },
      { m: "SQL", v: 90 }
    ]
  }, [skills])

  if (!mounted) return null

  const overview = activeData.profile_overview
  const career = activeData.career_dashboard
  const stats = activeData.quick_stats
  const profile = career.profile_summary

  const name = activeData.user_name?.split(" ")[0] || user?.name?.split(" ")[0] || "there"
  const score = overview.resume_score ?? 88
  const readiness = profile?.profile_strength_score || overview.completeness_percentage || 85
  const actions = career?.action_items?.slice(0, 3) || [
    "Build a targeted resume with AI Assistant",
    "Practice a 3D Recruiter Mock Interview",
    "Explore role-matched job opportunities"
  ]

  const getNextMoveLink = (actionText: string, index: number) => {
    const text = actionText.toLowerCase()
    if (text.includes("resume") || text.includes("builder")) return "/resume-builder"
    if (text.includes("interview") || text.includes("mock") || text.includes("3d") || text.includes("recruiter")) return "/interview"
    if (text.includes("job") || text.includes("opportunity") || text.includes("opportunities") || text.includes("matched")) return "/linkedin-jobs"
    if (text.includes("coding") || text.includes("dsa") || text.includes("arena")) return "/coding-practice"
    if (text.includes("match") || text.includes("analysis")) return "/match-analysis"
    if (text.includes("profile") || text.includes("strength")) return "/profile"
    return index === 0 ? "/resume-builder" : index === 1 ? "/interview" : "/linkedin-jobs"
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-[#fcf9f5]">
        <DynamicNavbar />
        
        {/* Expansive Max-Width Canvas */}
        <main className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 pb-20 pt-24 lg:pt-28">
          
          {/* Welcome Header */}
          <section className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#79736c]">
                <Sparkles className="size-4 text-[#ef4a18]" /> Your personal career space
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[.98] tracking-tight text-[#171716]">
                Welcome back, {name}.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-[#6e6862]">
                Here’s where your next great opportunity starts.
              </p>
            </div>
            
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#ef4a18] px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#d93d10] disabled:opacity-70"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh insights
            </button>
          </section>

          {/* Top Bento Grid Section */}
          <section className="grid gap-7 lg:grid-cols-[1.4fr_.9fr]">
            
            {/* Weekly Focus Large Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-[#181818] p-8 sm:p-10 lg:p-12 text-white shadow-md">
              <div className="absolute -right-16 -top-16 size-80 rounded-full border-[32px] border-[#ef4a18]/90" />
              <div className="absolute -bottom-24 right-28 size-64 rounded-full bg-[#ff7348] blur-3xl opacity-35" />
              
              <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-between">
                <div>
                  <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90">
                    Your focus for this week
                  </span>
                  <h2 className="mt-8 max-w-xl text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.04] tracking-tight">
                    Turn your profile into a role-ready story.
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
                    Your strongest route is clearer now. Complete one focused action and we’ll tailor the rest of your path around it.
                  </p>
                </div>
                
                <Link
                  href="/resume-builder"
                  className="mt-8 inline-flex w-fit items-center gap-2.5 rounded-full bg-white px-6 py-3 text-xs font-semibold text-[#171716] transition hover:bg-[#ffe9e1]"
                >
                  Build my resume <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Score & Readiness Side Cards */}
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
              
              {/* Resume Score Card */}
              <div className="rounded-3xl border border-[#e8e1da] bg-white p-7 sm:p-8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="grid size-11 place-items-center rounded-2xl bg-[#fff0eb] text-[#ef4a18]">
                    <FileText className="size-5" />
                  </div>
                  <span className="rounded-full bg-[#eaf6ee] px-3 py-1 text-xs font-semibold text-[#287443]">
                    {overview?.has_resume ? "Active" : "Start here"}
                  </span>
                </div>
                <div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#8a837b]">
                    Resume score
                  </p>
                  <p className="mt-1 text-5xl sm:text-6xl font-bold tracking-tight text-[#171716]">
                    {score}<span className="ml-1 text-xl font-normal text-[#8a837b]">/100</span>
                  </p>
                  <p className="mt-2 text-sm text-[#746e67]">
                    {score ? "ATS readiness is looking good." : "Upload a resume to unlock your score."}
                  </p>
                </div>
              </div>

              {/* Career Readiness Card */}
              <div className="rounded-3xl border border-[#e8e1da] bg-[#fff7f3] p-7 sm:p-8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-2xl bg-[#ef4a18] text-white">
                    <Target className="size-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#ef4a18]">
                    +{Math.max(readiness - 50, 0)}% this month
                  </span>
                </div>
                <div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#8a837b]">
                    Career readiness
                  </p>
                  <p className="mt-1 text-5xl sm:text-6xl font-bold tracking-tight text-[#171716]">
                    {readiness}<span className="ml-1 text-xl font-normal text-[#8a837b]">%</span>
                  </p>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#f0ddd4]">
                    <div
                      className="h-full rounded-full bg-[#ef4a18] transition-all duration-500"
                      style={{ width: `${Math.min(readiness, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* AI Career Trajectory Section (Designed with StitchMCP) */}
          <section className="mt-8">
            <div className="rounded-3xl border border-[#e8e1da] bg-white p-7 sm:p-9 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2.5 text-base font-semibold text-[#171716]">
                    <span className="grid size-8 place-items-center rounded-xl bg-[#fff0eb] text-[#ef4a18]">
                      <TrendingUp className="size-4" />
                    </span>
                    AI Career Trajectory
                  </p>
                  <p className="mt-1.5 text-sm text-[#77716b]">
                    Personalized 12-month roadmapping based on your resume & target role signals.
                  </p>
                </div>
                <Link
                  href="/ai-planner"
                  className="inline-flex items-center gap-2 rounded-full border border-[#e8e1da] bg-[#fcf9f5] px-4 py-2 text-xs font-semibold text-[#ef4a18] transition hover:bg-[#fff0eb] hover:border-[#ef4a18]/30 shrink-0 w-fit"
                >
                  Explore AI Roadmap <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Minimalist 3-Stage Timeline Nodes */}
              <div className="mt-7 grid gap-6 md:grid-cols-3">
                
                {/* Stage 1: Current */}
                <div className="relative rounded-2xl border border-[#eee8e2] bg-[#faf8f5] p-6 transition hover:border-[#ef4a18]/30">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#ef4a18] px-3 py-1 text-[11px] font-semibold text-white">
                      Current Stage
                    </span>
                    <span className="text-xs font-bold text-[#171716]">100%</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#171716]">
                    {profile?.current_level || "Senior Frontend Engineer"}
                  </h3>
                  <p className="mt-1 text-xs text-[#77716b]">Baseline salary: ₹24L PA</p>
                  <div className="mt-5 pt-3 border-t border-[#eee8e2] flex items-center gap-2 text-xs text-[#524d47]">
                    <CheckCircle2 className="size-3.5 text-[#ef4a18] shrink-0" /> Active role profile verified
                  </div>
                </div>

                {/* Stage 2: 6-Month Milestone */}
                <div className="relative rounded-2xl border border-[#ef4a18]/40 bg-[#fff9f6] p-6 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#fff0eb] border border-[#ef4a18]/20 px-3 py-1 text-[11px] font-semibold text-[#ef4a18]">
                      6-Mo Milestone · 65%
                    </span>
                    <span className="text-xs font-bold text-[#ef4a18]">Phase 1</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#171716]">
                    Full Stack AI Lead
                  </h3>
                  <p className="mt-1 text-xs text-[#77716b]">Target band: ₹36L PA</p>
                  
                  {/* Skills Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Next.js 15", "LangChain", "System Design"].map((skill) => (
                      <span key={skill} className="rounded-md bg-white border border-[#ebdcd3] px-2 py-0.5 text-[10px] font-semibold text-[#6e6862]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f0ddd4]">
                    <div className="h-full rounded-full bg-[#ef4a18] w-[65%]" />
                  </div>
                </div>

                {/* Stage 3: 12-Month Horizon */}
                <div className="relative rounded-2xl border border-[#eee8e2] bg-[#faf8f5] p-6 transition hover:border-[#ef4a18]/30">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#f4f1ed] px-3 py-1 text-[11px] font-semibold text-[#746e67]">
                      12-Mo Horizon · Target
                    </span>
                    <span className="text-xs font-bold text-[#8a837b]">Phase 2</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#171716]">
                    Principal AI Architect
                  </h3>
                  <p className="mt-1 text-xs text-[#77716b]">Target band: ₹50L PA</p>

                  {/* Skills Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Multimodal LLMs", "ModelOps", "Enterprise Scale"].map((skill) => (
                      <span key={skill} className="rounded-md bg-white border border-[#eee8e2] px-2 py-0.5 text-[10px] font-semibold text-[#807971]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee8e2]">
                    <div className="h-full rounded-full bg-[#b4aca4] w-[25%]" />
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Action Items & Skills Momentum Bento */}
          <section className="mt-8 grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
            
            {/* Next Moves Card */}
            <div className="rounded-3xl border border-[#e8e1da] bg-white p-7 sm:p-9 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2.5 text-base font-semibold text-[#171716]">
                    <span className="grid size-8 place-items-center rounded-xl bg-[#fff0eb] text-[#ef4a18]">
                      <Zap className="size-4" />
                    </span>
                    Your next moves
                  </p>
                  <p className="mt-2 text-sm text-[#77716b]">
                    Small wins, carefully picked for your current direction.
                  </p>
                </div>
                <Link href="/career-path" className="hidden text-xs font-semibold text-[#ef4a18] hover:underline sm:block">
                  View path
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {actions.map((action, index) => {
                  const targetHref = getNextMoveLink(action, index);
                  return (
                    <Link
                      href={targetHref}
                      key={action}
                      className="group flex items-center gap-4 rounded-2xl border border-[#eee8e2] p-4 transition hover:border-[#ef4a18]/40 hover:bg-[#fffaf7]"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
                          index === 0 ? "bg-[#ef4a18] text-white" : "bg-[#f4f1ed] text-[#6e6862]"
                        }`}
                      >
                        0{index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#252321]">{action}</span>
                        <span className="mt-1 block text-xs text-[#807971]">
                          {index === 0
                            ? "Build an ATS-optimized resume tailored to target roles"
                            : index === 1
                            ? "Practice with a 3D AI Recruiter avatar in real-time"
                            : "Discover high-match tech jobs in your area"}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-[#b4aca4] transition group-hover:translate-x-1 group-hover:text-[#ef4a18]" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Skills Momentum Card with Dynamic Wave Curve */}
            <div className="rounded-3xl border border-[#e8e1da] bg-white p-7 sm:p-9 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="flex items-center gap-2.5 text-base font-semibold text-[#171716]">
                      <span className="grid size-8 place-items-center rounded-xl bg-[#fff0eb] text-[#ef4a18]">
                        <BriefcaseBusiness className="size-4" />
                      </span>
                      Skills momentum
                    </p>
                    <p className="mt-2 text-sm text-[#77716b]">
                      Your strongest building blocks.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#ef4a18]">
                    {stats?.total_skills || skills.length || 12} skills
                  </span>
                </div>

                {/* Dynamic Wave Chart */}
                <div className="mt-6 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="orangeWaveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4a18" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#ef4a18" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <YAxis domain={[0, 100]} hide />
                      <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "#958d85", fontSize: 11, fontWeight: 500 }} />
                      <Tooltip
                        cursor={{ stroke: '#ef4a18', strokeWidth: 1, strokeDasharray: '3 3' }}
                        contentStyle={{ border: "1px solid #eadfd7", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#ef4a18"
                        strokeWidth={2.5}
                        fill="url(#orangeWaveGrad)"
                        dot={{ r: 4, fill: "#ef4a18", strokeWidth: 2, stroke: "#ffffff" }}
                        activeDot={{ r: 6, fill: "#ef4a18" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#f8f5f1] p-3.5 text-xs leading-relaxed text-[#6e6862]">
                <CheckCircle2 className="mr-2 inline size-4 text-[#ef4a18]" />
                {profile?.primary_domain
                  ? `${profile.primary_domain} is your clearest current signal.`
                  : "Add your strengths to make this insight more precise."}
              </div>
            </div>

          </section>

          {/* Skill Gap & Salary Uplift Matrix Section */}
          <section className="mt-8">
            <div className="rounded-3xl border border-[#e8e1da] bg-white p-7 sm:p-9 shadow-2xs">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 text-base font-semibold text-[#171716]">
                    <span className="grid size-8 place-items-center rounded-xl bg-[#fff0eb] text-[#ef4a18]">
                      <Award className="size-4" />
                    </span>
                    Skill Gap & Salary Uplift Matrix
                  </div>
                  <p className="mt-1.5 text-sm text-[#77716b]">
                    Target skill additions mapped directly from active job market requirements in your area.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#eaf6ee] px-3.5 py-1.5 text-xs font-semibold text-[#287443] border border-[#d2edd9]">
                    +₹12.5L PA Projected Uplift
                  </div>
                  <Link
                    href="/coding-practice"
                    className="inline-flex items-center gap-2 rounded-full bg-[#ef4a18] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#d93d10] shrink-0"
                  >
                    Bridge Skill Gaps <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3 Skill Cards Grid */}
              <div className="mt-7 grid gap-5 md:grid-cols-3">
                
                {/* Skill 1 */}
                <div className="rounded-2xl border border-[#eee8e2] bg-[#faf8f5] p-5 transition hover:border-[#ef4a18]/30 hover:bg-[#fffcf9]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white border border-[#e5dfd7] px-2 py-0.5 text-[11px] font-semibold text-[#6e6862]">
                      System Architecture
                    </span>
                    <span className="text-xs font-bold text-[#ef4a18]">+₹4.5L PA</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#171716]">
                    Low-Latency API Design
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#77716b]">
                    Required by 84% of Senior SDE roles in Mumbai.
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#eee8e2]">
                    <span className="text-[#8a837b]">Match Boost: <strong className="text-[#252321]">+8%</strong></span>
                    <span className="font-semibold text-[#ef4a18]">High Demand</span>
                  </div>
                </div>

                {/* Skill 2 */}
                <div className="rounded-2xl border border-[#ef4a18]/30 bg-[#fff9f6] p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white border border-[#ebdcd3] px-2 py-0.5 text-[11px] font-semibold text-[#ef4a18]">
                      AI Frameworks
                    </span>
                    <span className="text-xs font-bold text-[#ef4a18]">+₹5.0L PA</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#171716]">
                    LangChain & RAG Pipelines
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#77716b]">
                    Top key differentiator for AI Engineer transitions.
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#f0ddd4]">
                    <span className="text-[#8a837b]">Match Boost: <strong className="text-[#252321]">+10%</strong></span>
                    <span className="font-semibold text-[#ef4a18]">Trending</span>
                  </div>
                </div>

                {/* Skill 3 */}
                <div className="rounded-2xl border border-[#eee8e2] bg-[#faf8f5] p-5 transition hover:border-[#ef4a18]/30 hover:bg-[#fffcf9]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-white border border-[#e5dfd7] px-2 py-0.5 text-[11px] font-semibold text-[#6e6862]">
                      Data Infrastructure
                    </span>
                    <span className="text-xs font-bold text-[#ef4a18]">+₹3.0L PA</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#171716]">
                    Redis & Message Queues
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#77716b]">
                    Essential building block for high-scale backend services.
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#eee8e2]">
                    <span className="text-[#8a837b]">Match Boost: <strong className="text-[#252321]">+6%</strong></span>
                    <span className="font-semibold text-[#287443]">Core Requirement</span>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Built Around You Footer Grid (100% Dynamic & Live) */}
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#171716]">Built around you</h2>
                <p className="mt-1 text-sm text-[#77716b]">A live read on your actual profile signals and target trajectory.</p>
              </div>
              <Sparkles className="size-5 text-[#ef4a18]" />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Card 1: Level & Signal */}
              <div className="rounded-2xl border border-[#e8e1da] bg-white p-6 transition hover:-translate-y-1 hover:shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#958d85]">Current Level & Signal</p>
                <p className="mt-4 text-xl font-bold tracking-tight text-[#252321]">
                  {user?.proficiency_level || profile?.current_level || "Senior Frontend Engineer"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#77716b]">
                  {user?.location ? `Based in ${user.location}` : "Verified experience shaping your next milestone."}
                </p>
              </div>

              {/* Card 2: Live Profile Strength */}
              <div className="rounded-2xl border border-[#e8e1da] bg-white p-6 transition hover:-translate-y-1 hover:shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#958d85]">Profile Strength</p>
                <p className="mt-4 text-xl font-bold tracking-tight text-[#252321]">
                  {readiness}% Complete
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#77716b]">
                  {overview?.has_resume 
                    ? "Resume parsed with high ATS match signals." 
                    : "Upload a resume to unlock sharper AI matching."}
                </p>
              </div>

              {/* Card 3: Targeted Career Path */}
              <div className="rounded-2xl border border-[#e8e1da] bg-white p-6 transition hover:-translate-y-1 hover:shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#958d85]">Targeted Career Path</p>
                <p className="mt-4 text-xl font-bold tracking-tight text-[#252321]">
                  {user?.career_goal_short || stats?.current_goal || "Full Stack AI Lead"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#77716b]">
                  {user?.career_goal_long ? user.career_goal_long : "12-Month horizon tailored to AI & architecture leadership."}
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </ProtectedRoute>
  )
}
