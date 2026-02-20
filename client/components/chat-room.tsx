"use client"

import React, { useEffect, useState, useRef } from "react"
import io, { Socket } from "socket.io-client"
import { Send, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  room: string
  author: string
  message: string
  time: string
}

interface ChatRoomProps {
  roomId: string
  username: string
}

export function ChatRoom({ roomId, username }: ChatRoomProps) {
  const [currentMessage, setCurrentMessage] = useState("")
  const [messageList, setMessageList] = useState<Message[]>([])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect only if not already connected
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555")
    }

    const socket = socketRef.current
    socket.emit("join_room", roomId)

    const handleReceiveMessage = (data: Message) => {
      setMessageList((list) => [...list, data])
    }

    socket.on("receive_message", handleReceiveMessage)

    return () => {
      socket.off("receive_message", handleReceiveMessage)
    }
  }, [roomId])

  const callAiBot = async (query: string, history: Message[]) => {
    if (!socketRef.current) return

    try {
      setIsAiTyping(true)
      const context = history.slice(-5).map(m => `${m.author}: ${m.message}`).join("\n")

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "stepfun/step-3.5-flash:free",
          "messages": [
            {
              "role": "system",
              "content": `You are NitiBot, a helpful AI assistant in a peer learning chat room about ${roomId}. 
                        Context of recent discussion:
                        ${context}

                        Answer the user's query mainly but use the context if needed. Keep it concise.`
            },
            {
              "role": "user",
              "content": query
            }
          ]
        })
      })

      const data = await response.json()
      const aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that."

      const aiMessage: Message = {
        room: roomId,
        author: "NitiBot",
        message: aiText,
        time: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2, '0')
      }

      socketRef.current.emit("send_message", aiMessage)
      setMessageList((list) => [...list, aiMessage])
    } catch (error) {
      console.error("AI Error:", error)
    } finally {
      setIsAiTyping(false)
    }
  }

  const sendMessage = async () => {
    if (currentMessage !== "" && socketRef.current) {
      const messageData: Message = {
        room: roomId,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          String(new Date(Date.now()).getMinutes()).padStart(2, '0'),
      }

      socketRef.current.emit("send_message", messageData)
      setMessageList((list) => [...list, messageData])
      setCurrentMessage("")

      if (messageData.message.includes("@nitiBot")) {
        const query = messageData.message.replace("@nitiBot", "").trim()
        await callAiBot(query, messageList)
      }
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-primary/5 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute opacity-75"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 relative"></div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Live Discussion</h3>
            <p className="text-xs text-muted-foreground">{roomId} Room</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">
          {username}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageList.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        {messageList.map((messageContent, index) => {
          const isMe = username === messageContent.author
          const isAi = messageContent.author === "NitiBot"

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe
                  ? "bg-orange-500 text-white rounded-br-sm"
                  : isAi
                    ? "bg-linear-to-br from-violet-500 to-purple-600 text-white rounded-bl-sm shadow-lg"
                    : "bg-orange-50 text-orange-950 rounded-bl-sm"
                  }`}
              >
                {!isMe && (
                  <div className="flex items-center gap-1 mb-1 opacity-70">
                    {isAi ? <span className="text-xs">🤖</span> : <User className="w-3 h-3" />}
                    <span className="text-[10px] font-bold">{messageContent.author}</span>
                  </div>
                )}
                {isAi ? (
                  <div className="text-sm prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-white/20 rounded px-1 py-0.5 text-xs" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-1" {...props} />,
                      }}
                    >
                      {messageContent.message}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{messageContent.message}</p>
                )}
                <p className={`text-[10px] mt-1 ${isMe || isAi ? "text-white/80" : "text-orange-900/60"} text-right`}>
                  {messageContent.time}
                </p>
              </div>
            </div>
          )
        })}
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-violet-100 text-violet-800 rounded-2xl px-4 py-2 rounded-bl-sm text-xs flex items-center gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-75">●</span>
              <span className="animate-pulse delay-150">●</span>
              NitiBot is typing...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type your message... (use @nitiBot to ask AI)"
            className="flex-1 bg-muted/50 border border-input hover:border-primary/50 focus:border-primary rounded-lg px-4 py-2 text-sm transition-colors outline-none"
            onChange={(event) => {
              setCurrentMessage(event.target.value)
            }}
            onKeyDown={(event) => {
              event.key === "Enter" && sendMessage()
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim()}
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
