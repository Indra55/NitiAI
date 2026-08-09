"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Github,
  GitFork,
  Mail,
  MapPin,
  Star,
} from "lucide-react"

export interface TemplateProps {
  data: {
    name: string
    username: string
    avatarUrl: string
    bio: string
    location: string
    email: string
    targetRole: string
    skills: string[]
    repos: Array<{
      name: string
      description: string
      language: string
      stars: number
      forks: number
      url: string
      detectedTools: string[]
    }>
    experiences: Array<{
      role: string
      company: string
      period: string
      desc: string
    }>
  }
}

export default function CustomPortfolioTemplate({ data }: TemplateProps) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const filteredRepos = activeSkill
    ? data.repos.filter(
        (repo) => repo.language === activeSkill || repo.detectedTools.includes(activeSkill),
      )
    : data.repos

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
        <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <img
                src={data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
                }}
                alt={`${data.name} avatar`}
                className="h-28 w-28 rounded-2xl border border-slate-700 object-cover shadow-lg shadow-cyan-950/30"
              />
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    {data.targetRole}
                  </span>
                  <span className="text-sm text-slate-500">@{data.username}</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">{data.name}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{data.bio}</p>
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-300" />{data.location}</span>
                  <a className="inline-flex items-center gap-2 transition hover:text-cyan-300" href={`mailto:${data.email}`}><Mail className="h-4 w-4 text-cyan-300" />{data.email}</a>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm font-semibold transition hover:border-cyan-400/50 hover:text-cyan-300"><Github className="h-4 w-4" />GitHub</a>
              <a href={`mailto:${data.email}`} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"><Mail className="h-4 w-4" />Contact</a>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Capabilities</p><h2 className="mt-2 text-2xl font-bold text-white">Tech stack</h2></div>
            {activeSkill && <button onClick={() => setActiveSkill(null)} className="text-sm text-slate-500 transition hover:text-white">Clear filter</button>}
          </div>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill) => <button key={skill} onClick={() => setActiveSkill(activeSkill === skill ? null : skill)} className={`rounded-full border px-4 py-2 text-sm transition ${activeSkill === skill ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"}`}>{skill}</button>)}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">Selected work</p><h2 className="mt-2 text-2xl font-bold text-white">Projects showcase</h2></div><Code2 className="h-6 w-6 text-slate-600" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredRepos.map((repo) => <article key={repo.name} className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-purple-400/40"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold text-white">{repo.name}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{repo.description}</p></div><a href={repo.url} target="_blank" rel="noreferrer" aria-label={`Open ${repo.name}`} className="text-slate-500 transition hover:text-purple-300"><ExternalLink className="h-5 w-5" /></a></div><div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5 text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />{repo.language}</span><span className="inline-flex items-center gap-1"><Star className="h-4 w-4" />{repo.stars}</span><span className="inline-flex items-center gap-1"><GitFork className="h-4 w-4" />{repo.forks}</span></div><div className="mt-4 flex flex-wrap gap-2">{repo.detectedTools.map((tool) => <span key={tool} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{tool}</span>)}</div><a href={repo.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-300 transition hover:text-purple-200">View repository <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a></article>)}
          </div>
          {filteredRepos.length === 0 && <p className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">No projects match this skill yet.</p>}
        </section>

        <section className="mt-12">
          <div className="mb-5"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Career path</p><h2 className="mt-2 text-2xl font-bold text-white">Experience</h2></div>
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-slate-800">
            {data.experiences.map((experience) => <article key={`${experience.company}-${experience.period}`} className="relative pl-9"><span className="absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-slate-950 bg-cyan-300 shadow-lg shadow-cyan-300/20" /><div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-xl"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><h3 className="text-lg font-semibold text-white">{experience.role}</h3><p className="mt-1 inline-flex items-center gap-2 text-sm text-cyan-300"><BriefcaseBusiness className="h-4 w-4" />{experience.company}</p></div><time className="text-sm text-slate-500">{experience.period}</time></div><p className="mt-4 text-sm leading-7 text-slate-400">{experience.desc}</p></div></article>)}
          </div>
        </section>
      </div>
    </main>
  )
}
