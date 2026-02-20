"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, FileText, BookOpen, Mic, Users, LogOut, User, Menu, X, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: TrendingUp },
  { label: "Explore", href: "/", icon: Compass },
  { label: "Resume", href: "/resume", icon: FileText },
  { label: "Learning", href: "/learning", icon: BookOpen },
  { label: "Interview", href: "/interview", icon: Mic },
  { label: "Peer Learning", href: "/peers", icon: Users },
]

export function DynamicNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isCompressed, setIsCompressed] = useState(false)
  const lastScrollY = useRef(0)
  const scrollThreshold = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      // Show navbar when scrolling up
      if (scrollDelta < -5) {
        setIsVisible(true)
        setIsCompressed(false)
        scrollThreshold.current = currentScrollY
      }
      // Compress navbar when scrolling down past threshold
      else if (scrollDelta > 5 && currentScrollY > 100) {
        setIsCompressed(true)
      }
      // Hide navbar when scrolling down significantly
      else if (scrollDelta > 10 && currentScrollY > 200) {
        setIsVisible(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${isCompressed ? "py-2" : "py-4"}`}
    >
      {/* Glass morphism background */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-xl border-b border-border/20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold transition-all duration-300 ${
              isCompressed ? "text-sm" : "text-lg"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              S
            </div>
            <span
              className={`hidden sm:inline transition-all duration-300 ${isCompressed ? "opacity-70" : "opacity-100"}`}
            >
              SKILLSPHERE
            </span>
          </Link>

          {/* Pill-shaped navbar - desktop */}
          <div
            className={`hidden md:flex items-center gap-1 bg-muted/30 border border-primary/20 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-muted/40 ${
              isCompressed ? "px-2 py-1.5" : "px-5 py-2.5"
            }`}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 rounded-full font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/20"
                    } ${isCompressed ? "text-xs px-2" : "text-sm px-3"}`}
                  >
                    <Icon className={`flex-shrink-0 transition-all ${isCompressed ? "w-3 h-3" : "w-4 h-4"}`} />
                    <span
                      className={`font-medium hidden lg:inline transition-all ${isCompressed ? "text-xs" : "text-sm"}`}
                    >
                      {item.label}
                    </span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User menu and mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* User dropdown */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className={`border border-primary/20 transition-all ${isCompressed ? "h-7 w-7" : "h-8 w-8"}`}>
                    <AvatarImage src={user?.avatar || "/abstract-profile.png"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-serif text-xs">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="bottom">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Guest"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 rounded-lg ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
