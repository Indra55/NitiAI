"use client"

import React, { use } from "react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { ChatRoom } from "@/components/chat-room"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import "@/app/dashboard/dashboard.css"

export default function RoomPage({ params }: { params: Promise<{ roomid: string }> }) {
  const unwrappedParams = use(params)
  const roomid = unwrappedParams.roomid
  
  const { user } = useAuth()
  
  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-background pb-10">
        <DynamicNavbar />
        <div className="pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link 
                href="/peer-learning" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Peer Learning
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Area */}
                <div className="lg:col-span-3">
                    <ChatRoom roomId={roomid} username={user?.name || "Anonymous User"} />
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h4 className="font-semibold mb-3">Room Guidelines</h4>
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                            <li>Be respectful to others.</li>
                            <li>Keep discussions on topic ({roomid}).</li>
                            <li>Share knowledge and resources.</li>
                            <li>No spamming or self-promotion.</li>
                        </ul>
                    </div>
                    
                     <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <p className="text-xs text-primary font-medium text-center">
                            Connected as <br/>
                            <span className="text-lg font-bold">{user?.name || "Guest"}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
