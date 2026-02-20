"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, RefreshCw, User } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface MockRoom {
  roomId: string
  link: string
  hostCandidateName: string
  participantCount: number
  status: string
}

export function MockInterviewList() {
  const [rooms, setRooms] = useState<MockRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${process.env.NEXT_PUBLIC_ML_API_URL || 'https://hacksyncinterview.onrender.com'}/api/rooms`).catch(() => null)

      if (!res || !res.ok) {
        // Fallback for demonstration if service is offline
        setRooms([
          {
            roomId: "demo-1",
            link: "#",
            hostCandidateName: "Demo Host",
            participantCount: 1,
            status: "lobby"
          }
        ])
        setError(null)
        return
      }

      const data = await res.json()
      setRooms(Array.isArray(data) ? data : [])
      setError(null)

    } catch (err) {
      console.log("Safe fallback triggered")
      setRooms([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
    const interval = setInterval(fetchRooms, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="flex flex-col h-full border-border/40 bg-card/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-emerald-500/10">
            <Video className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-lg">Mock Interviews</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRooms} disabled={loading}>
          {loading ? <Spinner className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
            <Spinner className="size-8" />
            <p className="text-sm">Finding active rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center p-4">
            <p className="text-sm">No active rooms found.</p>
            <Button variant="link" className="text-emerald-500" onClick={() => window.open(process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:5000", "_blank")}>Start a room?</Button>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.roomId}
              className="group flex flex-col gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all cursor-pointer"
              onClick={() => window.open(room.link, '_blank')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">Room {room.roomId.slice(-4)}</span>
                <Badge variant={room.status === 'lobby' ? "default" : "secondary"} className="text-xs capitalize">
                  {room.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {room.hostCandidateName}
                </span>
                <span className="text-emerald-500 font-medium group-hover:underline">Join ({room.participantCount}) →</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/40">
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"                   onClick={() => window.location.href = "https://hacksync-interview.vercel.app/"} >
          Create New Room
        </Button>
      </div>
    </Card>
  )
}

