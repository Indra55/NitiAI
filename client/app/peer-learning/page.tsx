"use client"

import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Users, BookOpen } from "lucide-react"
import Link from "next/link"
import "@/app/dashboard/dashboard.css"
import { MockInterviewList } from "./components/mock-interview-list"
import { MentorPlaceholder } from "./components/mentor-placeholder"

const ROOMS = [
  { id: "frontend", name: "Frontend Engineering", icon: "🎨", members: 124 },
  { id: "backend", name: "Backend Systems", icon: "⚙️", members: 98 },
  { id: "system-design", name: "System Design", icon: "🏗️", members: 156 },
  { id: "dsa", name: "DSA & LeetCode", icon: "🧠", members: 210 },
]

export default function PeerLearningPage() {
  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-24 pb-10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <section className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                         <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">Peer Learning Hub</h1>
                </div>
                <p className="text-muted-foreground ml-11 max-w-2xl">
                    Connect, discuss, and practice with peers. Join live discussion rooms or schedule mock interviews.
                </p>
            </section>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                
                {/* Primary Column: Discussion Room Directory */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {ROOMS.map((room) => (
                            <Link 
                                href={`/peer-learning/${room.id}`}
                                key={room.id}
                                className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all duration-300 cursor-pointer block"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-2xl group-hover:scale-110 transition-transform duration-300">
                                        {room.icon}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {room.members} online
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{room.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Join the community discussion on {room.name.toLowerCase()} topics.
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                                    <div className="flex -space-x-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Join Room <Users className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Secondary Column: Interviews & Mentorship */}
                <div className="xl:col-span-1 space-y-6 flex flex-col h-auto">
                    {/* Mock Interviews */}
                    <div className="flex-1 min-h-[300px]">
                        <MockInterviewList />
                    </div>
                    
                    {/* Mentor Placeholder */}
                    <div className="shrink-0">
                        <MentorPlaceholder />
                    </div>
                </div>

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
