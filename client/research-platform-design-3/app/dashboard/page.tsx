"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis } from "recharts"
import { ArrowDownRight, ArrowRight, Check, ChevronRight } from "lucide-react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

const chartData = [{ m: "FEB", v: 31 }, { m: "MAR", v: 39 }, { m: "APR", v: 44 }, { m: "MAY", v: 52 }, { m: "JUN", v: 58 }, { m: "JUL", v: 67 }, { m: "AUG", v: 78 }]
const actions = [
  ["01", "System design foundations", "3 lessons remaining", "/learning"],
  ["02", "Practice a product interview", "35 minutes · tailored set", "/interview"],
  ["03", "Apply resume feedback", "4 high-impact edits", "/resume"],
]
const signalRows = [["PROFILE", "Product strategy", "82% aligned"], ["SKILLS", "Technical communication", "Top 12%"], ["MARKET", "New matching roles", "12 this week"]]

export default function DashboardPage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  const firstName = user?.name?.split(" ")[0] || "there"

  return <ProtectedRoute><div className="min-h-screen bg-[#f5f4ef] text-[#171716]"><DynamicNavbar /><main className="mx-auto max-w-[1600px] px-5 md:px-8">
    <section className="grid border-x border-[#c8c7c0] lg:grid-cols-12">
      <div className="border-b border-[#c8c7c0] px-5 py-5 lg:col-span-12 lg:px-8"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#77766f]">Dashboard / 08 August 2026 / Your career operating system</p></div>
      <div className="border-b border-[#c8c7c0] px-5 pb-14 pt-10 lg:col-span-8 lg:border-b-0 lg:px-8 lg:py-16">
        <p className="mb-7 text-xs font-medium">Good morning, {firstName}.</p>
        <h1 className="max-w-3xl font-serif text-[clamp(3.8rem,8vw,8.25rem)] leading-[.8] tracking-[-.075em]">Make the next<br/><i className="font-normal">move</i> count.</h1>
        <p className="mt-10 max-w-md text-[15px] leading-7 text-[#5f5e59]">Your momentum is strong. One focused interview session is the highest-leverage thing you can do this week.</p>
      </div>
      <div className="flex flex-col border-b border-[#c8c7c0] bg-[#171716] p-6 text-[#f5f4ef] lg:col-span-4 lg:border-b-0 lg:border-l lg:border-[#c8c7c0] lg:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b8b7af]">Readiness index</p><div className="mt-auto pt-16"><p className="font-serif text-8xl leading-none tracking-[-.09em]">78<span className="text-2xl text-[#a09f99]">/100</span></p><div className="mt-7 h-px bg-[#595954]"><div className="h-px w-[78%] bg-[#f5f4ef]" /></div><p className="mt-4 text-sm text-[#c1c0ba]">Up 7 points since last month</p></div>
      </div>
    </section>

    <section className="grid border-x border-b border-[#c8c7c0] lg:grid-cols-12">
      <div className="p-5 lg:col-span-8 lg:p-8"><div className="mb-9 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#77766f]">Priority queue</p><h2 className="mt-3 font-serif text-4xl tracking-[-.06em]">What to do next.</h2></div><p className="hidden text-xs text-[#77766f] sm:block">03 selected actions</p></div>
      <div className="border-t border-[#c8c7c0]">{actions.map(([number, title, note, href]) => <Link href={href} key={number} className="group grid grid-cols-[44px_1fr_20px] items-center gap-4 border-b border-[#c8c7c0] py-5 last:border-0"><span className="text-[11px] font-semibold text-[#77766f]">{number}</span><span><span className="block text-base font-semibold tracking-[-.03em]">{title}</span><span className="mt-1 block text-sm text-[#77766f]">{note}</span></span><ChevronRight className="size-5 text-[#77766f] transition-transform group-hover:translate-x-1 group-hover:text-black" /></Link>)}</div>
      </div>
      <div className="border-t border-[#c8c7c0] p-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-8"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#77766f]">Momentum</p><p className="mt-3 font-serif text-4xl tracking-[-.06em]">The curve is up.</p><div className="mt-7 h-40"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id="blackGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#171716" stopOpacity=".24"/><stop offset="1" stopColor="#171716" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#77766f",fontSize:9,fontWeight:600}}/><Area type="monotone" dataKey="v" stroke="#171716" strokeWidth={2} fill="url(#blackGradient)" /></AreaChart></ResponsiveContainer></div><p className="border-t border-[#c8c7c0] pt-4 text-sm leading-6 text-[#5f5e59]">+40 points over six months. You’re moving faster than your historic baseline.</p></div>
    </section>

    <section className="grid border-x border-b border-[#c8c7c0] lg:grid-cols-12"><div className="p-5 lg:col-span-4 lg:p-8"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#77766f]">A directional read</p><h2 className="mt-3 max-w-xs font-serif text-4xl leading-[.95] tracking-[-.06em]">You’re building range, not just a resume.</h2><Link href="/career-intelligence" className="mt-9 inline-flex items-center gap-3 border-b border-black pb-1 text-[11px] font-semibold uppercase tracking-[.12em]">See full intelligence <ArrowRight className="size-4" /></Link></div><div className="lg:col-span-8 lg:border-l lg:border-[#c8c7c0]">{signalRows.map(([label, name, detail]) => <div key={label} className="grid grid-cols-[78px_1fr_auto] items-center gap-3 border-b border-[#c8c7c0] px-5 py-6 last:border-0 lg:px-8"><span className="text-[10px] font-semibold tracking-[.12em] text-[#77766f]">{label}</span><span className="text-sm font-semibold">{name}</span><span className="flex items-center gap-2 text-right text-xs text-[#5f5e59]"><Check className="size-3.5" />{detail}</span></div>)}</div></section>
    <footer className="flex items-center justify-between border-x border-[#c8c7c0] px-5 py-5 text-[10px] font-semibold uppercase tracking-[.14em] text-[#77766f] lg:px-8"><span>Skillsphere / Personal Intelligence</span><span className="flex items-center gap-1">Updated now <ArrowDownRight className="size-3" /></span></footer>
  </main></div></ProtectedRoute>
}
