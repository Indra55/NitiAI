"use client"

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring } from "framer-motion"
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, Menu, Send, X } from "lucide-react"

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

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>{children}</motion.div>
}

function Glass({ children }: { children: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }} transition={{ duration: 0.5 }} viewport={{ once: true }}><div className="relative overflow-hidden rounded-xl bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-6 transition hover:border-purple-500/50"><div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur opacity-25" /><div className="relative">{children}</div></div></motion.div>
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="text-center space-y-4"><Reveal><span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">{subtitle}</span></Reveal><motion.h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>{title}</motion.h2><motion.div className="mx-auto h-1.5 w-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} /></div>
}

function MouseFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 }); const [visible, setVisible] = useState(false)
  useEffect(() => { const move = (e: MouseEvent) => { setPosition({ x: e.clientX, y: e.clientY }); setVisible(true) }; const leave = () => setVisible(false); window.addEventListener("mousemove", move); document.body.addEventListener("mouseleave", leave); return () => { window.removeEventListener("mousemove", move); document.body.removeEventListener("mouseleave", leave) } }, [])
  return <><motion.div className="pointer-events-none fixed left-0 top-0 z-50 h-8 w-8 rounded-full mix-blend-difference" animate={{ x: position.x - 16, y: position.y - 16, opacity: visible ? 1 : 0 }} transition={{ type: "spring", damping: 20, stiffness: 300 }}><div className="h-full w-full rounded-full bg-white opacity-50" /></motion.div><motion.div className="pointer-events-none fixed left-0 top-0 z-50 h-2 w-2 rounded-full bg-white" animate={{ x: position.x - 1, y: position.y - 1, opacity: visible ? 1 : 0 }} /></>
}

function ParticleHero() { const ref = useRef<HTMLCanvasElement>(null); useEffect(() => { const canvas = ref.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; let frame = 0; let particles: { x: number; y: number; bx: number; by: number; size: number; color: string }[] = []; let mouse = { x: -999, y: -999 }; const resize = () => { const r = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1; canvas.width = r.width * dpr; canvas.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); particles = []; for (let y = 15; y < r.height; y += 30) for (let x = 15; x < r.width; x += 30) particles.push({ x, y, bx: x, by: y, size: Math.random() * 4 + 2, color: `hsl(${270 + Math.random() * 60}, 70%, 60%)` }) }; const move = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top } }; const animate = () => { const r = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); particles.forEach((p, i) => { const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy); if (d < 110) { p.x -= dx / d * (110 - d) / 110 * 2; p.y -= dy / d * (110 - d) / 110 * 2 } else { p.x += (p.bx - p.x) / 10; p.y += (p.by - p.y) / 10 } ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); if (i > 0 && Math.hypot(p.x - particles[i - 1].x, p.y - particles[i - 1].y) < 34) { ctx.strokeStyle = "rgba(180,120,255,.2)"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[i - 1].x, particles[i - 1].y); ctx.stroke() } }); frame = requestAnimationFrame(animate) }; resize(); animate(); window.addEventListener("resize", resize); window.addEventListener("mousemove", move); return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", move) } }, []); return <motion.canvas ref={ref} className="h-[350px] w-full md:h-[450px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} /> }

function ProjectCard({ repo, username }: { repo: TemplateProps['data']['repos'][number]; username: string }) { 
  const [hover, setHover] = useState(false); 
  return (
    <Reveal>
      <article className="group relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm transition hover:border-purple-500/50 p-6 flex flex-col justify-between" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div>
          <h3 className="mb-2 text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{repo.name}</h3>
          <p className="mb-4 text-sm text-zinc-300 leading-relaxed">{repo.description || "Open source software project showcase."}</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {repo.detectedTools.map(tag => (
              <span key={tag} className="rounded-md bg-zinc-700/60 px-2.5 py-1 text-xs text-purple-300 font-mono">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-between border-t border-zinc-700/50 pt-4">
          <a href={repo.url || `https://github.com/${username}/${repo.name}`} target="_blank" rel="noreferrer" className="flex items-center text-xs text-zinc-400 hover:text-white">
            <Github className="mr-1.5 h-4 w-4 text-purple-400" /> Source Code
          </a>
          <a href={repo.url || `https://github.com/${username}/${repo.name}`} target="_blank" rel="noreferrer" className="flex items-center rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-bold text-white">
            Repository <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </a>
        </div>
      </article>
    </Reveal>
  ); 
}

function ContactForm() { 
  const [sending, setSending] = useState(false); 
  const [sent, setSent] = useState(false); 
  const submit = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    setSending(true); 
    await new Promise(r => setTimeout(r, 800)); 
    setSending(false); 
    setSent(true); 
    e.currentTarget.reset() 
  }; 
  return (
    <Reveal>
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6">
        <h3 className="mb-6 text-2xl font-bold text-white">Send Me a Message</h3>
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Your Name" className="w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3.5 py-2 text-sm text-white outline-none focus:border-purple-500" />
          <input required type="email" placeholder="Your Email" className="w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3.5 py-2 text-sm text-white outline-none focus:border-purple-500" />
          <textarea required rows={4} placeholder="Your Message" className="w-full rounded-md border border-zinc-700 bg-zinc-900/50 px-3.5 py-2 text-sm text-white outline-none focus:border-purple-500" />
          <button disabled={sending} className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 cursor-pointer">
            {sending ? "Sending..." : sent ? "Message sent!" : <>Send Message <Send className="ml-2 h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </Reveal>
  ); 
}

export default function ThirdPortfolioTemplate({ data }: TemplateProps) { 
  const reposList = data?.repos || [];
  const skillsList = data?.skills || [];
  const experiencesList = data?.experiences || [];

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white p-6 md:p-12">
      <MouseFollower />
      
      {/* HERO SECTION */}
      <section className="relative flex min-h-[500px] items-center justify-center pt-8">
        <div className="container relative z-10 grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono font-bold text-purple-300">
              {data?.targetRole || "Software Engineer & Creative Developer"}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">
              Hi, I&apos;m <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">{data?.name || "Developer"}</span>
            </h1>
            <p className="max-w-[600px] text-base md:text-lg text-zinc-300 leading-relaxed">
              {data?.bio || "I craft exceptional digital experiences with code, backend architecture, and a passion for innovation."}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`mailto:${data?.email}`} className="flex items-center rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg">
                Contact Me <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href={`https://github.com/${data?.username}`} target="_blank" rel="noreferrer" className="flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-bold text-purple-300 hover:text-white">
                <Github className="mr-2 h-4 w-4" /> GitHub Profile
              </a>
            </div>
          </div>
          <ParticleHero />
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="container py-16">
        <Heading title="About Me" subtitle="Candidate Background" />
        <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
          <img
            src={data?.avatarUrl || "https://github.com/octocat.png"}
            alt={data?.name}
            className="aspect-square w-full max-w-sm mx-auto rounded-2xl border-2 border-purple-500/40 object-cover shadow-2xl"
          />
          <Glass>
            <p className="text-base text-zinc-200 leading-relaxed">
              {data?.bio || `I'm a passionate software engineer with experience building web applications and digital products.`}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-mono">
              <div><span className="text-zinc-500">Name</span><br /><strong className="text-white">{data?.name}</strong></div>
              <div><span className="text-zinc-500">Email</span><br /><strong className="text-purple-300">{data?.email}</strong></div>
              <div><span className="text-zinc-500">Location</span><br /><strong className="text-white">{data?.location}</strong></div>
              <div><span className="text-zinc-500">Role</span><br /><strong className="text-pink-400">{data?.targetRole}</strong></div>
            </div>
          </Glass>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="container py-16">
        <Heading title="My Skills" subtitle="Technologies & Stack" />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {skillsList.map((skill, idx) => (
            <Reveal key={skill}>
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 space-y-2">
                <div className="text-xs font-bold text-white">{skill}</div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${80 + (idx % 20)}%` }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* REPOSITORIES / PROJECTS SECTION */}
      <section className="container py-16">
        <Heading title="Featured Projects" subtitle="Scanned GitHub Repositories" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reposList.map(repo => (
            <ProjectCard key={repo.name} repo={repo} username={data?.username} />
          ))}
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="container py-16">
        <Heading title="Work Experience" subtitle="Career Journey" />
        <div className="mx-auto mt-12 max-w-4xl space-y-6">
          {experiencesList.map((exp, i) => (
            <Reveal key={`${exp.company}-${i}`}>
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 space-y-2">
                <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                <div className="text-xs font-mono text-purple-300">{exp.company} | {exp.period}</div>
                <p className="text-xs text-zinc-300 leading-relaxed">{exp.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="container py-16">
        <Heading title="Get In Touch" subtitle="Contact & Connect" />
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Glass>
            <h3 className="mb-6 text-xl font-bold text-white">Contact Information</h3>
            <div className="space-y-4 text-xs font-mono text-zinc-300">
              <p className="flex items-center gap-3"><Mail className="text-purple-400 w-4 h-4" />{data?.email}</p>
              <p className="flex items-center gap-3"><Github className="text-purple-400 w-4 h-4" />github.com/{data?.username}</p>
            </div>
          </Glass>
          <ContactForm />
        </div>
      </section>
    </main>
  ); 
}
