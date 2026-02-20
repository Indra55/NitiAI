"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getResumeInfo, ResumeInfo } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"
import { Download, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toaster } from "@/lib/toaster"

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioConfig {
  personal: {
    name: string
    lastName: string
    title: string
    subtitle: string
    year: string
    location: string
    availableForWork: boolean
    email: string
  }
  current: {
    role: string
    company: string
    startYear: string
    endYear: string
  }
  skills: string[]
  workExperience: Array<{
    year: string
    role: string
    company: string
    description: string
    tech: string[]
  }>
  blogPosts: Array<{
    title: string
    excerpt: string
    date: string
    readTime: string
  }>
  socialLinks: Array<{
    name: string
    handle: string
    url: string
  }>
  footer: {
    copyright: string
    builtWith: string
  }
  workYears: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapResumeToPortfolioConfig(resume: ResumeInfo): PortfolioConfig {
  console.log("Mapping resume data:", resume)

  // Safe defaults for all fields
  const nameParts = (resume.extracted_name || "User Name").split(" ")
  const firstName = nameParts[0] || "User"
  const lastName = nameParts.slice(1).join(" ") || ""

  const currentYear = new Date().getFullYear().toString()

  // Get the most recent experience as current position
  // If no experience, use placeholder
  const currentJob = resume.experience?.[0] || {
    title: "Developer",
    company: "Tech Company",
    start: currentYear,
    end: "Present"
  }

  // Normalize start/end dates from different possible keys
  const getStartYear = (exp: any) => {
    const dateStr = exp.start || exp.start_date || ""
    return dateStr.match(/\d{4}/)?.[0]
  }

  const getEndYear = (exp: any) => {
    const dateStr = exp.end || exp.end_date || "Present"
    if (dateStr.toLowerCase() === 'present') return currentYear
    return dateStr.match(/\d{4}/)?.[0] || currentYear
  }

  // Calculate work years range
  const years = resume.experience?.map(exp => {
    const start = getStartYear(exp)
    const end = getEndYear(exp)
    return { start, end }
  }).filter(y => y.start) || []

  const minYear = years.length > 0 ? Math.min(...years.map(y => parseInt(y.start!))) : parseInt(currentYear)
  const maxYear = years.length > 0 ? Math.max(...years.map(y => parseInt(y.end!))) : parseInt(currentYear)

  const workYears = years.length > 0 ? `${minYear} — ${maxYear}` : `${currentYear}`

  // Map experience to work experience format
  const workExperience = (resume.experience || []).map(exp => {
    const year = getStartYear(exp) || currentYear
    return {
      year,
      role: exp.title || "Role",
      company: exp.company || "Company",
      description: exp.description || "Contributed to key projects and development.",
      tech: [] as string[]
    }
  })

  // If no experience, add a placeholder so the section isn't empty
  if (workExperience.length === 0) {
    workExperience.push({
      year: currentYear,
      role: "Software Developer",
      company: "Freelance",
      description: "Building innovative web applications and solutions.",
      tech: ["Web Development"]
    })
  }

  // Generate blog posts from projects or strengths
  let blogPosts = (resume.projects || []).slice(0, 4).map((project, index) => ({
    title: project.name || `Project ${index + 1}`,
    excerpt: project.description || "A notable project showcasing technical expertise.",
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    readTime: `${Math.floor(Math.random() * 5) + 3} min`
  }))

  // If fewer than 2 projects, fill with strengths
  if (blogPosts.length < 2 && resume.strengths) {
    const strengthPosts = resume.strengths.slice(0, 4 - blogPosts.length).map(strength => ({
      title: strength,
      excerpt: `Demonstrated strong capability in ${strength.toLowerCase()} across various initiatives.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      readTime: "3 min"
    }))
    blogPosts = [...blogPosts, ...strengthPosts]
  }

  // Build social links
  const socialLinks: Array<{ name: string; handle: string; url: string }> = []
  if (resume.linkedin_url) {
    socialLinks.push({ name: "LinkedIn", handle: "Connect", url: resume.linkedin_url })
  }
  if (resume.portfolio_url) {
    socialLinks.push({ name: "Portfolio", handle: "Visit", url: resume.portfolio_url })
  }
  // Always ensure at least one link (email)
  const email = resume.extracted_email || "email@example.com"
  if (socialLinks.length === 0) {
    socialLinks.push({ name: "Email", handle: email, url: `mailto:${email}` })
  }

  // Combine skills
  const allSkills = [...(resume.technical_skills || []), ...(resume.soft_skills || [])]
  const displaySkills = allSkills.length > 0 ? allSkills.slice(0, 10) : ["Development", "Design", "Problem Solving"]

  const currentRoleStart = getStartYear(currentJob) || currentYear
  const currentRoleEnd = currentJob.end || currentJob.end_date || "Present"

  const config = {
    personal: {
      name: firstName,
      lastName: lastName,
      title: resume.professional_title || "Professional",
      subtitle: resume.professional_summary || `Experienced ${resume.professional_title || "professional"} ready to create impact.`,
      year: currentYear,
      location: resume.extracted_location || "Remote",
      availableForWork: true,
      email: email,
    },
    current: {
      role: currentJob.title || "Developer",
      company: currentJob.company || "Available",
      startYear: currentRoleStart,
      endYear: currentRoleEnd,
    },
    skills: displaySkills,
    workExperience,
    blogPosts,
    socialLinks,
    footer: {
      copyright: `© ${currentYear} ${nameParts.join(" ")}. All rights reserved.`,
      builtWith: "Built with Niti AI Portfolio Builder",
    },
    workYears,
  }

  console.log("Generated Portfolio Config:", config)
  return config
}

function generateDownloadableHTML(config: PortfolioConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.personal.name} ${config.personal.lastName} - Portfolio</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #fafafa;
      --muted: #a1a1aa;
      --border: #27272a;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.6;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 3.5rem; font-weight: 300; margin-bottom: 1rem; }
    h1 span { color: var(--muted); }
    h2 { font-size: 2rem; font-weight: 300; margin-bottom: 2rem; }
    .subtitle { font-size: 1.25rem; color: var(--muted); margin-bottom: 2rem; max-width: 500px; }
    .section { padding: 4rem 0; border-bottom: 1px solid var(--border); }
    .meta { font-size: 0.875rem; color: var(--muted); font-family: monospace; margin-bottom: 1rem; }
    .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
    .skill { padding: 0.25rem 0.75rem; border: 1px solid var(--border); border-radius: 9999px; font-size: 0.75rem; }
    .job { padding: 1.5rem 0; border-bottom: 1px solid var(--border); }
    .job-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .job-title { font-size: 1.25rem; font-weight: 500; }
    .job-company { color: var(--muted); }
    .job-year { color: var(--muted); font-size: 1.25rem; }
    .job-desc { color: var(--muted); margin-top: 0.5rem; }
    .contact { margin-top: 2rem; }
    .contact a { color: var(--fg); text-decoration: none; }
    .contact a:hover { color: var(--muted); }
    .footer { padding: 2rem 0; text-align: center; color: var(--muted); font-size: 0.875rem; }
    .available { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--muted); }
    .available-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } h1 { font-size: 2.5rem; } }
  </style>
</head>
<body>
  <div class="container">
    <section class="section" style="min-height: 100vh; display: flex; align-items: center;">
      <div>
        <div class="meta">PORTFOLIO / ${config.personal.year}</div>
        <h1>${config.personal.name}<br><span>${config.personal.lastName}</span></h1>
        <p class="subtitle">${config.personal.subtitle}</p>
        <div style="display: flex; gap: 1rem; align-items: center; color: var(--muted); font-size: 0.875rem;">
          ${config.personal.availableForWork ? '<div class="available"><div class="available-dot"></div>Available for work</div>' : ''}
          <div>${config.personal.location}</div>
        </div>
        <div style="margin-top: 2rem;">
          <div class="meta">CURRENTLY</div>
          <div>${config.current.role}</div>
          <div style="color: var(--muted);">@ ${config.current.company}</div>
          <div style="color: var(--muted); font-size: 0.75rem;">${config.current.startYear} — ${config.current.endYear}</div>
        </div>
        <div style="margin-top: 2rem;">
          <div class="meta">FOCUS</div>
          <div class="skills">
            ${config.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
        <h2>Selected Work</h2>
        <div class="meta">${config.workYears}</div>
      </div>
      ${config.workExperience.map(job => `
        <div class="job">
          <div class="job-header">
            <div>
              <div class="job-title">${job.role}</div>
              <div class="job-company">${job.company}</div>
            </div>
            <div class="job-year">${job.year}</div>
          </div>
          <p class="job-desc">${job.description}</p>
        </div>
      `).join('')}
    </section>

    ${config.blogPosts.length > 0 ? `
    <section class="section">
      <h2>Projects & Highlights</h2>
      <div class="grid" style="margin-top: 2rem;">
        ${config.blogPosts.map(post => `
          <div style="padding: 1.5rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--muted); font-family: monospace; margin-bottom: 0.75rem;">
              <span>${post.date}</span>
              <span>${post.readTime}</span>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 500; margin-bottom: 0.5rem;">${post.title}</h3>
            <p style="color: var(--muted); font-size: 0.875rem;">${post.excerpt}</p>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section class="section">
      <h2>Let's Connect</h2>
      <p style="color: var(--muted); font-size: 1.125rem; margin-top: 1rem; max-width: 500px;">
        Always interested in new opportunities, collaborations, and conversations about technology and design.
      </p>
      <div class="contact">
        <a href="mailto:${config.personal.email}">${config.personal.email} →</a>
      </div>
      <div style="display: grid; grid-template-columns: 1fr; gap: 1rem; margin-top: 2rem;">
        ${config.socialLinks.map(social => `
          <a href="${social.url}" style="padding: 1rem; border: 1px solid var(--border); border-radius: 0.5rem; color: var(--fg); text-decoration: none;">
            <div style="font-weight: 500;">${social.name}</div>
            <div style="color: var(--muted); font-size: 0.875rem;">${social.handle}</div>
          </a>
        `).join('')}
      </div>
    </section>

    <footer class="footer">
      <p>${config.footer.copyright}</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">${config.footer.builtWith}</p>
    </footer>
  </div>
</body>
</html>`
}

// ============================================================================
// PORTFOLIO COMPONENT
// ============================================================================

export default function PortfolioPage() {
  // Start with light mode, only respect user's explicit choice
  const [isDark, setIsDark] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<PortfolioConfig | null>(null)
  const [downloading, setDownloading] = useState(false)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  // Load saved theme preference on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem('portfolio-theme')
    if (stored === 'dark') {
      setIsDark(true)
    }
  }, [])

  // Save theme preference when user toggles
  useEffect(() => {
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    async function fetchResumeData() {
      try {
        console.log("Fetching resume data...")
        const response = await getResumeInfo()
        console.log("Resume response:", response)

        if (response.error) {
          setError(response.error)
          toaster.create({
            title: "Portfolio Error",
            description: response.error,
            type: "error"
          })
          return
        }

        if (response.data) {
          const portfolioConfig = mapResumeToPortfolioConfig(response.data)
          setConfig(portfolioConfig)
        } else {
          setError("No resume data received")
          toaster.create({
            title: "No Data",
            description: "No resume data received",
            type: "warning"
          })
        }
      } catch (err) {
        console.error("Error fetching portfolio:", err)
        setError("Failed to load portfolio data")
        toaster.create({
          title: "Load Error",
          description: "Failed to load portfolio data",
          type: "error"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchResumeData()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [config])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const handleDownload = () => {
    if (!config) return
    setDownloading(true)

    try {
      const html = generateDownloadableHTML(config)
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config.personal.name.toLowerCase()}-${config.personal.lastName.toLowerCase()}-portfolio.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const sections = ["intro", "work", "thoughts", "connect"]

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="size-16" />
            <div className="text-xl font-light">Loading your portfolio...</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !config) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="max-w-md p-8 border border-red-500/20 rounded-lg bg-red-500/10 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-light text-red-500">Portfolio Unavailable</h2>
            <p className="text-muted-foreground">{error || "Please upload a resume first to generate your portfolio."}</p>
            <Link href="/dashboard" className="inline-block px-6 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground relative">
        {/* BACK BUTTON - Resets theme and navigates to dashboard */}
        <button
          onClick={() => {
            // Remove dark class from html to reset theme
            document.documentElement.classList.remove('dark')
            document.documentElement.style.colorScheme = 'light'
            // Clear portfolio theme preference
            localStorage.removeItem('portfolio-theme')
            // Navigate back
            window.location.href = '/dashboard'
          }}
          className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-muted/80 backdrop-blur-sm text-foreground rounded-full hover:bg-muted transition-colors border border-border"
        >
          <span className="text-lg">←</span>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* DOWNLOAD BUTTON */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="fixed top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {downloading ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">Download Portfolio</span>
        </button>

        {/* LEFT NAVIGATION DOTS */}
        <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
                className={`w-2 h-8 rounded-full transition-all duration-500 ${activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                aria-label={`Navigate to ${section}`}
              />
            ))}
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          {/* HERO/INTRO SECTION */}
          <header
            id="intro"
            ref={(el) => { sectionsRef.current[0] = el }}
            className="min-h-screen flex items-center"
          >
            <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
              <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-2">
                  <div className="text-sm text-muted-foreground font-mono tracking-wider">
                    PORTFOLIO / {config.personal.year}
                  </div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                    {config.personal.name}
                    <br />
                    <span className="text-muted-foreground">{config.personal.lastName}</span>
                  </h1>
                </div>

                <div className="space-y-6 max-w-md">
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                    {config.personal.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                    {config.personal.availableForWork && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Available for work
                      </div>
                    )}
                    <div>{config.personal.location}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground font-mono">CURRENTLY</div>
                  <div className="space-y-2">
                    <div className="text-foreground">{config.current.role}</div>
                    <div className="text-muted-foreground">@ {config.current.company}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.current.startYear} — {config.current.endYear}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground font-mono">FOCUS</div>
                  <div className="flex flex-wrap gap-2">
                    {config.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* WORK SECTION */}
          <section
            id="work"
            ref={(el) => { sectionsRef.current[1] = el }}
            className="min-h-screen py-20 sm:py-32 opacity-0"
          >
            <div className="space-y-12 sm:space-y-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <h2 className="text-3xl sm:text-4xl font-light">Selected Work</h2>
                <div className="text-sm text-muted-foreground font-mono">{config.workYears}</div>
              </div>

              <div className="space-y-8 sm:space-y-12">
                {config.workExperience.map((job, index) => (
                  <div
                    key={index}
                    className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
                  >
                    <div className="lg:col-span-2">
                      <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                        {job.year}
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium">{job.role}</h3>
                        <div className="text-muted-foreground">{job.company}</div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed max-w-lg">{job.description}</p>
                    </div>

                    <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
                      {job.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BLOG/THOUGHTS SECTION */}
          {config.blogPosts.length > 0 && (
            <section
              id="thoughts"
              ref={(el) => { sectionsRef.current[2] = el }}
              className="min-h-screen py-20 sm:py-32"
            >
              <div className="space-y-12 sm:space-y-16">
                <h2 className="text-3xl sm:text-4xl font-light">Projects & Highlights</h2>

                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                  {config.blogPosts.map((post, index) => (
                    <article
                      key={index}
                      className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                          {post.title}
                        </h3>

                        <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          <span>Read more</span>
                          <svg
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CONNECT SECTION */}
          <section id="connect" ref={(el) => { sectionsRef.current[3] = el }} className="py-20 sm:py-32">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>

                <div className="space-y-6">
                  <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                    Always interested in new opportunities, collaborations, and conversations about technology and design.
                  </p>

                  <div className="space-y-4">
                    <Link
                      href={`mailto:${config.personal.email}`}
                      className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                    >
                      <span className="text-base sm:text-lg">{config.personal.email}</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div className="text-sm text-muted-foreground font-mono">ELSEWHERE</div>

                <div className="grid grid-cols-1 gap-4">
                  {config.socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.url}
                      className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                          {social.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{social.handle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-12 sm:py-16 border-t border-border">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{config.footer.copyright}</div>
                <div className="text-xs text-muted-foreground">{config.footer.builtWith}</div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </footer>
        </main>

        {/* BOTTOM GRADIENT OVERLAY */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
      </div>
    </ProtectedRoute>
  )
}
