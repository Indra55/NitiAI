"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  FileText,
  Mic,
  Users,
  LogOut,
  User,
  Menu,
  X,
  TrendingUp,
  Brain,
  Briefcase,
  MoreHorizontal,
  ArrowLeft,
  FileSearch,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useLanguage, SUPPORTED_SITE_LANGUAGES } from "@/lib/language-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "motion/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Main navigation items
const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { label: "Resume Arena", href: "/resume-arena", icon: FileText },
  { label: "JD Match", href: "/match-analysis", icon: FileSearch },
  { label: "Coding Arena", href: "/coding-practice", icon: FileSearch },
]

// Additional features in dropdown
const moreNavItems = [
  { label: "Opportunities", href: "/opportunities", icon: Users },
  { label: "Portfolio", href: "/portfolio", icon: Briefcase },
  { label: "Language Agent", href: "/lingua-coach", icon: Globe },
  { label: "Interview", href: "/interview", icon: Mic },
]

export function DynamicNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { currentLanguage, changeLanguage } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isCompressed, setIsCompressed] = useState(false)
  const [isMoreHovered, setIsMoreHovered] = useState(false)
  const lastScrollY = useRef(0)
  const scrollThreshold = useRef(0)

  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      if (currentScrollY <= 20) {
        setIsVisible(true)
      } else if (scrollDelta > 5 && currentScrollY > 40) {
        setIsVisible(false)
      } else if (scrollDelta < -5) {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleNavEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
  }

  const handleNavLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMoreHovered(false)
    }, 300)
  }

  const handleMoreEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setIsMoreHovered(true)
  }

  const isDashboardRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/journey") ||
    pathname?.startsWith("/resume") ||
    pathname?.startsWith("/learning") ||
    pathname?.startsWith("/interview") ||
    pathname?.startsWith("/opportunities") ||
    pathname?.startsWith("/insights") ||
    pathname?.startsWith("/career-intelligence") ||
    pathname?.startsWith("/skill-gap") ||
    pathname?.startsWith("/peers") ||
    pathname?.startsWith("/ai-planner") ||
    pathname?.startsWith("/resume-builder") ||
    pathname?.startsWith("/peer-learn") ||
    pathname?.startsWith("/peer-learning") ||
    pathname?.startsWith("/portfolio") ||
    pathname?.startsWith("/career-persona") ||
    pathname?.startsWith("/job-trends") ||
    pathname?.startsWith("/linkedin-jobs") ||
    pathname?.startsWith("/match-analysis") ||
    pathname?.startsWith("/profile")

  // The resume builder is a fixed-height workspace. Keep its navigation in
  // document flow so its toolbar cannot render beneath a floating navbar.
  const isResumeBuilderRoute = pathname?.startsWith("/resume-builder")

  return (
    <nav
      className={`${isResumeBuilderRoute ? "sticky" : "fixed"} top-0 z-50 w-full pointer-events-none transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      } ${isCompressed ? "py-1" : "py-2"}`}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Website Name */}
          <Link
            href={isDashboardRoute ? "/dashboard" : "/"}
            className="pointer-events-auto flex items-center gap-2.5 font-bold transition-transform hover:scale-105"
          >
            <Image src="/nitiai.png" alt="Niti AI" width={38} height={38} className="size-9 shrink-0 object-contain" priority />
            <span className="text-base font-bold tracking-tight text-slate-900">
              Niti AI
            </span>
          </Link>

          {/* Floating Pill-shaped Navbar - Desktop */}
          <div
            onMouseLeave={handleNavLeave}
            onMouseEnter={handleNavEnter}
            className={`pointer-events-auto hidden xl:flex items-center justify-between relative overflow-hidden border border-slate-200/80 rounded-full bg-white/80 backdrop-blur-xl shadow-md transition-all duration-300 w-[640px] h-11 px-2 ${
              !isMoreHovered
                ? "border-slate-200/80 hover:shadow-lg hover:bg-white/90"
                : "border-orange-500/50 shadow-orange-500/10"
            }`}
          >
            {/* Orange Background Fill (Animated on Hover) */}
            <div
              className={`absolute inset-0 bg-[#ef4a18] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] origin-right ${
                isMoreHovered ? "scale-x-100" : "scale-x-0"
              }`}
            />

            {/* Main Navigation Items */}
            <div
              className={`flex items-center justify-between flex-1 h-full transition-all duration-300 ${
                isMoreHovered
                  ? "opacity-0 translate-x-4 pointer-events-none absolute inset-y-0 left-0 w-full px-2"
                  : "opacity-100 translate-x-0 relative w-full"
              }`}
            >
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} className="flex-1 mx-0.5">
                    <div
                      className={`flex items-center justify-center gap-1.5 rounded-full font-medium transition-all duration-200 h-8 px-3 ${
                        isActive
                          ? "bg-[#ef4a18] text-white shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs whitespace-nowrap">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* More Navigation Items */}
            <div
              className={`flex items-center justify-between flex-1 h-full transition-all duration-300 ${
                !isMoreHovered
                  ? "opacity-0 -translate-x-4 pointer-events-none absolute inset-y-0 left-0 w-full px-2"
                  : "opacity-100 translate-x-0 relative w-full"
              }`}
            >
              {moreNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} className="flex-1 mx-0.5">
                    <div
                      className={`flex items-center justify-center gap-1.5 rounded-full font-medium transition-all duration-200 z-10 relative h-8 px-3 ${
                        isActive
                          ? "bg-white text-[#ef4a18] shadow-xs font-semibold"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs whitespace-nowrap">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Divider */}
            <div className={`h-4 w-px mx-1 transition-colors duration-300 z-10 relative shrink-0 ${isMoreHovered ? "bg-white/30" : "bg-slate-200"}`} />

            {/* More Trigger Button */}
            <div className="flex items-center z-10 relative shrink-0" onMouseEnter={handleMoreEnter}>
              <div
                className={`flex items-center gap-1 rounded-full font-medium transition-all duration-200 cursor-pointer h-8 px-2.5 ${
                  isMoreHovered
                    ? "text-white bg-white/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {isMoreHovered ? <ArrowLeft className="w-3.5 h-3.5 shrink-0" /> : <MoreHorizontal className="w-3.5 h-3.5 shrink-0" />}
                <span className="hidden lg:inline text-xs whitespace-nowrap">{isMoreHovered ? "Back" : "More"}</span>
              </div>
            </div>
          </div>

          {/* User Profile Menu & Mobile Toggle */}
          <div className="pointer-events-auto flex items-center gap-2">
            
            {/* Direct Language Selector Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <select
                value={currentLanguage}
                onChange={(e) => {
                  changeLanguage(e.target.value);
                }}
                className="bg-transparent text-[11px] font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_SITE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-700 hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {user && (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className={`border border-slate-200 shadow-xs transition-all ${isCompressed ? "h-7 w-7" : "h-8.5 w-8.5"}`}>
                      <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-slate-900 text-white font-semibold text-[11px]">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5" align="end" side="bottom">
                  <DropdownMenuLabel className="font-normal text-slate-900 px-3 py-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold leading-none">{user?.name || "Candidate Account"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer text-slate-700 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />

                  {/* Global Multilingual Site Language Selector */}
                  <div
                    className="px-3 py-2 space-y-1"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-orange-500" /> Site Language
                    </label>
                    <select
                      value={currentLanguage}
                      onChange={(e) => {
                        changeLanguage(e.target.value);
                      }}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {SUPPORTED_SITE_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs font-medium">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="pointer-events-auto md:hidden overflow-hidden bg-white border border-slate-200 rounded-2xl mt-2 p-3 shadow-xl"
            >
              <div className="space-y-1.5">
                {mainNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive ? "bg-[#ef4a18] text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
