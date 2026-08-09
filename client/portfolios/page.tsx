"use client"

import { Search, ChevronRight, Menu, X, Globe, Youtube, Instagram, Facebook, Twitter, Github, Mail, MapPin, Code2, Folder, FileCode } from "lucide-react"
import { useState } from "react"

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
  const reposList = data?.repos || []
  const skillsList = data?.skills || []
  const experiencesList = data?.experiences || []

  const portfolioData = {
    "Featured Repositories": reposList.map((r) => ({
      name: r.name,
      thumbnail: data?.avatarUrl || "https://github.com/octocat.png",
      size: `${r.stars} Stars`,
      created: r.language || "Code",
      client: r.detectedTools?.slice(0, 2).join(", ") || "Open Source",
      tags: r.detectedTools?.join(", ") || "Project",
      url: r.url,
      description: r.description
    })),
    "Skills & Tech Stack": skillsList.map((s) => ({
      name: s,
      thumbnail: data?.avatarUrl || "https://github.com/octocat.png",
      size: "Proficient",
      created: "2026",
      client: "Core Competency",
      tags: "Tech Stack",
      url: "#",
      description: `${s} engineering & integration`
    })),
    "Work Experience": experiencesList.map((e) => ({
      name: `${e.role} @ ${e.company}`,
      thumbnail: data?.avatarUrl || "https://github.com/octocat.png",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans p-4 sm:p-8">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-48 -left-48 w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <section className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3.5 py-1 rounded-full bg-orange-950 border border-orange-800 text-orange-400 text-xs font-mono font-bold mb-3">
                  @{data?.username || "candidate"}
                </span>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                  {data?.name || "Developer Portfolio"}
                </h1>
                <p className="text-lg font-bold text-orange-500 mt-2">
                  {data?.targetRole || "Software Engineer"}
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                {data?.bio || "Welcome to my interactive developer portfolio showcasing software projects, tech stack skills, and career achievements."}
              </p>

              {/* Contact & Social Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {data?.username && (
                  <a
                    href={`https://github.com/${data.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-200 hover:border-orange-500 hover:text-orange-400 transition-all"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {data?.email && (
                  <a
                    href={`mailto:${data.email}`}
                    className="w-10 h-10 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center text-slate-200 hover:border-orange-500 hover:text-orange-400 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {data?.location && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-full border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" /> {data.location}
                  </span>
                )}
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-orange-500">+{data?.repos?.length || 0}</div>
                  <p className="text-xs text-slate-400 mt-1">Live Repositories &amp; Projects</p>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">+{data?.skills?.length || 0}</div>
                  <p className="text-xs text-slate-400 mt-1">Technical Skills &amp; Stack</p>
                </div>
              </div>
            </div>

            {/* Right Side Signature Card */}
            <div className="relative flex justify-center">
              <div className="relative bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-[2.5rem] p-6 sm:p-8 w-full sm:w-[360px] lg:w-[380px] h-[440px] overflow-hidden flex flex-col justify-between shadow-2xl">
                {/* Globe Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-mono font-bold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                    {data?.targetRole || "Developer"}
                  </span>
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Signature / Role Text */}
                <div className="my-auto">
                  <h3 className="text-3xl font-extrabold text-white italic font-serif leading-tight">
                    {data?.name}
                  </h3>
                  <p className="text-xs text-white/90 font-mono mt-1 font-semibold">
                    {data?.targetRole}
                  </p>
                </div>

                {/* Candidate Avatar Image */}
                <div className="flex items-end justify-between pt-4 border-t border-white/20">
                  <img
                    src={data?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80";
                    }}
                    alt={data?.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white/60 shadow-2xl bg-slate-900"
                  />
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-md">
                    <ChevronRight className="w-5 h-5 text-white rotate-45" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SEARCH & NAVIGATION HEADER */}
        <header className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
              {data?.name?.charAt(0) || "P"}
            </div>
            <span className="font-bold text-sm text-slate-100">{data?.name}</span>
          </div>

          <div className="relative w-64 sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search projects &amp; skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 pl-9 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>
        </header>

        {/* MAIN 3-COLUMN EXPLORER LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_360px] gap-6">
          
          {/* Left Sidebar - Candidate Overview & Folders */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800 space-y-2">
              <h2 className="text-base font-bold text-slate-100">
                {data?.name} is a {data?.targetRole || "Developer"} based in {data?.location || "Worldwide"}
              </h2>
              <p className="text-xs text-slate-400">{data?.email}</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-800 space-y-1">
              <button
                onClick={() => {
                  setSelectedFolder(null)
                  setSelectedFile(null)
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  selectedFolder === null ? "bg-orange-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <span>📂</span>
                  <span>All Items ({displayFiles.length})</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-70" />
              </button>

              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => {
                    setSelectedFolder(folder)
                    setSelectedFile(null)
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    selectedFolder === folder ? "bg-orange-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    <span>📁</span>
                    <span>{folder}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          {/* Center Column - Interactive Item List */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-800 max-h-[550px] overflow-y-auto space-y-2">
            {selectedFolder && (
              <div className="p-3 border-b border-slate-800/80 mb-2">
                <h3 className="text-sm font-bold text-white">{selectedFolder}</h3>
                <p className="text-xs text-slate-400">
                  {filteredFiles.length} {searchQuery ? "matching items" : "items"}
                </p>
              </div>
            )}

            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <button
                  key={`${file.name}-${index}`}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer border ${
                    selectedFile?.name === file.name
                      ? "bg-slate-800 border-orange-500/80 text-white shadow-md"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={file.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80";
                        }}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{file.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{file.client || file.tags}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching items found.
              </div>
            )}
          </div>

          {/* Right Column - Selected Item Detail View */}
          <div className="space-y-4">
            {selectedFile ? (
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-orange-950 border border-orange-800 text-orange-400 px-2.5 py-0.5 rounded-full font-bold">
                      {selectedFile.size || "Detail View"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedFile.created}</span>
                  </div>

                  <div className="space-y-1 my-auto">
                    <h3 className="text-base font-bold text-white">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedFile.description || "Project details & stack specs."}</p>
                  </div>

                  {selectedFile.url && selectedFile.url !== "#" && (
                    <a
                      href={selectedFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:underline pt-2"
                    >
                      View Live Repository &rarr;
                    </a>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Category</span>
                    <span className="font-semibold text-slate-200">{selectedFile.client}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Tags / Tech</span>
                    <span className="font-semibold text-orange-400">{selectedFile.tags}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-800 text-center text-xs text-slate-500">
                Select any item from the center list to view details.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
