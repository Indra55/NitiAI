"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Dashboard", href: "/dashboard" }, { label: "Discover", href: "/" }, { label: "Career", href: "/career-path" },
  { label: "Learning", href: "/learning" }, { label: "Interview", href: "/interview" }, { label: "Resume", href: "/resume" },
]

export function DynamicNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-50 border-b border-[#1b1b19] bg-[#f5f4ef]">
      <div className="mx-auto flex h-16 max-w-[1600px] items-stretch px-5 md:px-8">
        <Link href="/dashboard" className="flex items-center border-r border-[#c8c7c0] pr-5 text-[15px] font-semibold tracking-[-.06em] text-[#161615] sm:pr-8">SKILLSPHERE<span className="ml-1 font-serif text-xl font-normal">®</span></Link>
        <nav className="ml-5 hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} className={`border-b-2 py-[21px] text-[11px] font-semibold uppercase tracking-[.12em] transition-colors ${pathname === item.href ? "border-[#171716] text-[#171716]" : "border-transparent text-[#77766f] hover:text-[#171716]"}`}>{item.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center">
          <Link href="/opportunities" className="hidden h-full items-center border-l border-[#c8c7c0] px-6 text-[11px] font-semibold uppercase tracking-[.12em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#f5f4ef] sm:flex">Opportunities</Link>
          <button onClick={() => setOpen(!open)} className="flex size-16 items-center justify-center border-l border-[#c8c7c0] lg:hidden" aria-label="Toggle navigation">{open ? <X className="size-4" /> : <Menu className="size-4" />}</button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button className="ml-4 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-black"><Avatar className="size-8 border border-[#171716]"><AvatarImage src={user?.avatar || "/abstract-profile.png"} /><AvatarFallback className="bg-[#171716] text-[10px] font-semibold text-white">{initials}</AvatarFallback></Avatar></button></DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5 w-56 rounded-none border-[#171716] bg-[#f5f4ef]" align="end"><DropdownMenuLabel className="font-normal"><p className="text-sm font-semibold">{user?.name || "Your account"}</p><p className="mt-1 text-xs text-[#77766f]">{user?.email}</p></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><Link href="/profile" className="gap-2"><User className="size-4" />Profile</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => { logout(); router.push("/login") }} className="gap-2"><LogOut className="size-4" />Log out</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {open && <nav className="grid grid-cols-2 border-t border-[#1b1b19] bg-[#f5f4ef] lg:hidden">{navItems.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className={`border-b border-r border-[#c8c7c0] px-5 py-4 text-[11px] font-semibold uppercase tracking-[.12em] ${pathname === item.href ? "bg-[#171716] text-white" : "text-[#171716]"}`}>{item.label}</Link>)}</nav>}
    </header>
  )
}
