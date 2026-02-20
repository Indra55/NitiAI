"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MoreHorizontal, Phone, Video, Hash, Users } from "lucide-react"

interface Message {
  id: string
  sender: string
  avatar: string
  content: string
  timestamp: string
  isMe: boolean
}

const ROOMS = [
  { id: "frontend", name: "Frontend Engineering", icon: "🎨", members: 124 },
  { id: "backend", name: "Backend Systems", icon: "⚙️", members: 98 },
  { id: "system-design", name: "System Design", icon: "🏗️", members: 156 },
  { id: "dsa", name: "DSA & LeetCode", icon: "🧠", members: 210 },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  frontend: [
    { id: "1", sender: "Alice", avatar: "A", content: "Has anyone tried React 19 yet?", timestamp: "10:30 AM", isMe: false },
    { id: "2", sender: "Bob", avatar: "B", content: "Yes! The new compiler is amazing.", timestamp: "10:32 AM", isMe: false },
    { id: "3", sender: "Me", avatar: "M", content: "I'm planning to upgrade our dashboard to it.", timestamp: "10:33 AM", isMe: true },
  ],
  backend: [
    { id: "1", sender: "Dave", avatar: "D", content: "Redis vs Memcached for session storage?", timestamp: "09:15 AM", isMe: false },
  ],
  "system-design": [
     { id: "1", sender: "Sarah", avatar: "S", content: "How would you design a rate limiter?", timestamp: "2:00 PM", isMe: false },
  ],
  dsa: [
      { id: "1", sender: "Mike", avatar: "M", content: "Stuck on DP probem. Any tips?", timestamp: "11:00 AM", isMe: false },
  ]
}

export function DiscussionRoom() {
  const [activeRoom, setActiveRoom] = useState("frontend")
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES["frontend"])
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(MOCK_MESSAGES[activeRoom] || [])
  }, [activeRoom])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msg: Message = {
      id: Date.now().toString(),
      sender: "Me",
      avatar: "M",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setMessages([...messages, msg])
    setNewMessage("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 h-[600px] gap-4">
      {/* Room List Sidebar */}
      <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-sm p-3 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground px-2 py-2 uppercase tracking-wider">Channels</h3>
        {ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
              activeRoom === room.id 
                ? "bg-primary/10 text-primary hover:bg-primary/15" 
                : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xl">{room.icon}</span>
            <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{room.name}</p>
                <p className="text-xs opacity-70 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {room.members}
                </p>
            </div>
          </button>
        ))}
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3 border-border/40 bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {ROOMS.find(r => r.id === activeRoom)?.icon}
             </div>
             <div>
                <h2 className="font-bold text-lg">{ROOMS.find(r => r.id === activeRoom)?.name}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {ROOMS.find(r => r.id === activeRoom)?.members} online
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8 mt-1 border border-border/50">
                  <AvatarFallback className={msg.isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                    {msg.avatar}
                  </AvatarFallback>
                </Avatar>
                <div 
                    className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        msg.isMe 
                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                            : "bg-secondary/80 text-secondary-foreground rounded-tl-sm"
                    }`}
                >
                  <p>{msg.content}</p>
                  <span className={`text-[10px] block mt-1 opacity-70 ${msg.isMe ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-card/30 border-t border-border/40">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                <Hash className="w-5 h-5" />
            </Button>
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${activeRoom}...`}
                className="flex-1 bg-background/50 border-border/40 focus-visible:ring-primary/20"
            />
            <Button type="submit" disabled={!newMessage.trim()} className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
