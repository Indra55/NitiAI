"use client"

import { Search, ChevronRight, Menu, X, Globe, Youtube, Instagram, Facebook, Twitter, Github, Mail, MapPin, Code2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

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

export default function SecondPortfolioTemplate({ data }: TemplateProps) {
  // Build dynamic folder data from candidate repos and skills
  const reposList = data?.repos || []
  const skillsList = data?.skills || []
  const experiencesList = data?.experiences || []

  const portfolioData = {
    "Featured Repositories": reposList.map((r) => ({
      name: r.name,
      thumbnail: data?.avatarUrl || "/placeholder.svg",
      size: `${r.stars} Stars`,
      created: r.language || "Code",
      client: r.detectedTools?.slice(0, 2).join(", ") || "Open Source",
      tags: r.detectedTools?.join(", ") || "Project",
      url: r.url,
      description: r.description
    })),
    "Skills & Tech Stack": skillsList.map((s) => ({
      name: s,
      thumbnail: data?.avatarUrl || "/placeholder.svg",
      size: "Proficient",
      created: "2026",
      client: "Core Competency",
      tags: "Tech Stack",
      url: "#",
      description: `${s} development & integration`
    })),
    "Work Experience": experiencesList.map((e) => ({
      name: `${e.role} @ ${e.company}`,
      thumbnail: data?.avatarUrl || "/placeholder.svg",
      size: e.period,
      created: e.period,
      client: e.company,
      tags: e.role,
      url: "#",
      description: e.desc
    }))
  }

  const folders = Object.keys(portfolioData)

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<any>(portfolioData["Featured Repositories"]?.[0] || null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const displayFiles = selectedFolder
    ? portfolioData[selectedFolder as keyof typeof portfolioData]
    : Object.values(portfolioData).flat()

  const filteredFiles = displayFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Decorative blob shapes */}
      <div className="blob-shape w-[600px] h-[600px] -top-48 -left-48" />
      <div className="blob-shape w-[500px] h-[500px] -bottom-32 -right-32" />
      <div className="blob-shape w-[400px] h-[400px] top-1/2 -right-48" />
      <div className="blob-shape w-[450px] h-[450px] -bottom-48 left-1/4" />

      <div className="relative z-10 p-4 md:p-8">
        {/* Hero Section */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 mb-6 border border-border/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-2 text-foreground">
                  {data?.name || "Developer Portfolio"}
                </h1>
                <p className="text-xl md:text-2xl font-bold text-orange-600 tracking-tight">
                  @{data?.username || "candidate"}
                </p>
              </div>

              {/* Subtitle */}
              <p className="text-base md:text-lg max-w-md leading-relaxed text-foreground/80">
                {data?.bio || "Welcome to a visual journey of software engineering and digital craft."}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://github.com/${data?.username || ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-orange-500 hover:bg-orange-500/10 transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${data?.email || ""}`}
                  className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-orange-500 hover:bg-orange-500/10 transition-all"
                  aria-label="Mail"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/70 pl-2">
                  <MapPin className="w-4 h-4 text-orange-600" /> {data?.location || "Remote"}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">+{data?.repos?.length || 0}</div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Live Repositories &amp; Open Source Projects
                  </p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">+{data?.skills?.length || 0}</div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Technical Skills &amp; Engineering Capabilities
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Orange Card */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-[3rem] p-8 md:p-12 w-full lg:w-[500px] xl:w-[600px] aspect-[4/5] overflow-hidden">
                {/* Globe Icon */}
                <div className="absolute top-6 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center">
                  <Globe className="w-7 h-7 text-white" />
                </div>

                {/* Signature Text */}
                <div className="absolute top-8 left-8 right-20">
                  <svg viewBox="0 0 300 80" className="w-full max-w-[250px]">
                    <text
                      x="10"
                      y="50"
                      fill="white"
                      fontSize="40"
                      fontFamily="'Brush Script MT', cursive"
                      style={{ fontStyle: "italic" }}
                    >
                      {data?.targetRole || "Engineering"}
                    </text>
                  </svg>
                </div>

                {/* Main Image */}
                <div className="absolute inset-0 flex items-end justify-end p-6">
                  <img
                    src={data?.avatarUrl || "https://github.com/octocat.png"}
                    alt={data?.name}
                    className="h-72 w-72 rounded-3xl object-cover border-4 border-white/40 shadow-2xl"
                  />
                </div>

                {/* Side Icons */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFB84D] flex items-center justify-center overflow-hidden border-2 border-white/20">
                    <Code2 className="w-7 h-7 text-black" />
                  </div>
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                    <ChevronRight className="w-7 h-7 text-white rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Header Navigation */}
        <header className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 mb-4 md:mb-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-semibold" aria-label="Profile">
                {data?.name?.charAt(0) || "P"}
              </div>
              <span className="font-bold text-sm text-foreground">{data?.name}</span>
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href={`mailto:${data?.email}`} className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </a>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search projects & skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 rounded-md border border-border/50 bg-input/50 px-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring w-64"
                />
              </div>
            </nav>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card/80 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-border/50">
            <nav className="flex flex-col gap-4">
              <a href={`mailto:${data?.email}`} className="text-sm font-medium hover:text-primary transition-colors text-left">
                Contact
              </a>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search projects & skills..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-md border border-border/50 bg-input/50 px-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </nav>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_400px] gap-4 md:gap-6">
          {/* Left Sidebar - Intro & Folders */}
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50">
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight mb-2">
                {data?.name} is a {data?.targetRole || "Software Engineer"} based in {data?.location || "Worldwide"}
              </h1>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50 space-y-1">
              <button
                onClick={() => {
                  setSelectedFolder(null)
                  setSelectedFile(null)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group ${
                  selectedFolder === null ? "bg-muted/70" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl opacity-60">📂</span>
                  <span className="text-sm font-medium">All Files ({displayFiles.length})</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-opacity ${
                    selectedFolder === null ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </button>
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    setSelectedFolder(folder)
                    setSelectedFile(null)
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group ${
                    selectedFolder === folder ? "bg-muted/70" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl opacity-60">📁</span>
                    <span className="text-sm font-medium">{folder}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-opacity ${
                      selectedFolder === folder ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Center - File List */}
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50 max-h-[600px] overflow-y-auto">
            <div className="space-y-1">
              {selectedFolder && (
                <div className="p-3 mb-2">
                  <h2 className="text-lg font-semibold">{selectedFolder}</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredFiles.length} {searchQuery ? "results" : "items"}
                  </p>
                </div>
              )}
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => (
                  <button
                    key={`${file.name}-${index}`}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group ${
                      selectedFile?.name === file.name ? "bg-muted/70" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted/50 overflow-hidden flex-shrink-0">
                        <img
                          src={file.thumbnail || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-left">{file.name}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-opacity ${
                        selectedFile?.name === file.name ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No items found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Preview */}
          <div className={`space-y-4 ${selectedFile ? "block" : "hidden xl:block"}`}>
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary/20 to-primary/40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full p-8 flex flex-col justify-between">
                    <div className="text-[40px] md:text-[60px] font-bold text-primary leading-none truncate">
                      {selectedFile?.name || data?.name}
                    </div>
                    <div className="w-full h-48 rounded-[2rem] overflow-hidden border-4 border-primary/30 my-auto">
                      <img
                        src={selectedFile?.thumbnail || data?.avatarUrl}
                        alt={selectedFile?.name || "Preview"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-primary-foreground/80 font-mono">
                      {selectedFile?.tags || "Project"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{selectedFile?.name || data?.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedFile?.description || selectedFile?.size || "Details"}</p>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{selectedFile?.size || "Project"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{selectedFile?.client || "Engineering"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <span className="font-medium">{selectedFile?.tags || "Tech Stack"}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="xl:hidden w-full bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Back to Files
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
