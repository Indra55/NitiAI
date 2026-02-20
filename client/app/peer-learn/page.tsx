"use client"

import Link from "next/link"
import { MagneticButton } from "@/components/magnetic-button"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, useEffect } from "react"
import "@/app/dashboard/dashboard.css"

interface PeerMeeting {
  id: string
  meeting_title: string
  peer_name: string
  scheduled_date: string
  scheduled_time: string
  meeting_type: string
  meeting_agenda: string
}

// Mock meeting history data (read-only)
const mockMeetingHistory: PeerMeeting[] = [
  {
    id: "1",
    meeting_title: "DSA Problem Solving Session",
    peer_name: "Alex Chen",
    scheduled_date: "2026-01-10",
    scheduled_time: "14:00",
    meeting_type: "dsa-practice",
    meeting_agenda: "Practice medium-level LeetCode problems focusing on dynamic programming and graphs.",
  },
  {
    id: "2",
    meeting_title: "System Design Mock Interview",
    peer_name: "Sarah Johnson",
    scheduled_date: "2026-01-08",
    scheduled_time: "10:00",
    meeting_type: "mock-interview",
    meeting_agenda: "Design a URL shortener service. Focus on scalability and database design.",
  },
]

export default function PeerLearning() {
  const [showForm, setShowForm] = useState(false)
  const [meetings, setMeetings] = useState<PeerMeeting[]>([])

  // Form state
  const [formData, setFormData] = useState({
    peerName: "",
    peerEmail: "",
    peerLinkedIn: "",
    meetingTitle: "",
    meetingAgenda: "",
    meetingTopics: "",
    skillLevel: "intermediate",
    meetingType: "mock-interview",
    date: "",
    time: "",
    duration: "60",
    timezone: "UTC",
  })

  // Use environment variable or default to localhost:5555
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555"

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/peer-meetings`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setMeetings(data.meetings)
        } else {
          console.error("Failed to fetch meetings:", response.status, response.statusText)
        }
      } catch (error) {
        console.error("Error fetching meetings:", error)
      }
    }

    fetchMeetings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic required field validation
    if (!formData.peerName || !formData.meetingTitle || !formData.meetingAgenda) {
      alert("Please fill in all required fields.")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/peer-meetings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          peer_name: formData.peerName,
          peer_email: formData.peerEmail,
          peer_linkedin: formData.peerLinkedIn,
          meeting_title: formData.meetingTitle,
          meeting_agenda: formData.meetingAgenda,
          meeting_topics: formData.meetingTopics,
          skill_level: formData.skillLevel,
          meeting_type: formData.meetingType,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          duration_minutes: formData.duration,
          timezone: formData.timezone
        })
      })

      if (response.ok) {
        // Redirect to peer meeting platform
        window.location.href = "https://peer2peer.hitanshu.tech"
      } else {
        const errorData = await response.json()
        alert(`Failed to create meeting: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating meeting:", error)
      alert("An error occurred while creating the meeting.")
    }
  }

  const formatMeetingType = (type: string) => {
    const types: Record<string, string> = {
      "mock-interview": "Mock Interview",
      "code-review": "Code Review",
      "system-design": "System Design",
      "dsa-practice": "DSA Practice",
      "general": "General",
    }
    return types[type] || type
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <ProtectedRoute>
      <div className="dashboard-theme">
        <DynamicNavbar />
        <main className="min-h-screen bg-background pt-28 pb-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">

            {/* ============================================ */}
            {/* SECTION 1: What is Peer Meeting */}
            {/* ============================================ */}
            <section className="mb-16">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-foreground/20 bg-foreground/15 backdrop-blur-md">
                <p className="font-mono text-xs text-foreground/90">Peer Learning</p>
              </div>
              <h1 className="text-4xl md:text-5xl font-light leading-tight text-foreground mb-6">
                Peer Meetings for Interview Preparation
              </h1>

              <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl mt-0.5">🎯</span>
                    <p className="text-foreground/80 text-lg">
                      Peer meetings simulate real interview environments
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl mt-0.5">💬</span>
                    <p className="text-foreground/80 text-lg">
                      Helps practice explaining solutions clearly
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl mt-0.5">🔍</span>
                    <p className="text-foreground/80 text-lg">
                      Peer feedback exposes weak areas
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl mt-0.5">📚</span>
                    <p className="text-foreground/80 text-lg">
                      Useful for mock interviews, DSA, system design, and behavioral rounds
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent text-xl mt-0.5">💪</span>
                    <p className="text-foreground/80 text-lg">
                      Builds confidence and consistency before actual interviews
                    </p>
                  </li>
                </ul>
              </div>
            </section>

            {/* ============================================ */}
            {/* SECTION 2: Meeting History */}
            {/* ============================================ */}
            <section className="mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">
                Your Peer Meeting History
              </h2>

              {meetings.length === 0 ? (
                <div className="bg-foreground/5 border border-foreground/20 rounded-2xl p-8 text-center">
                  <p className="text-foreground/60 text-lg">
                    You haven't had any peer meetings yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="bg-gradient-to-br from-foreground/8 to-foreground/3 border border-foreground/15 rounded-xl p-6 hover:border-foreground/25 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {meeting.meeting_title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                            <span className="flex items-center gap-1.5">
                              <span className="text-accent">👤</span>
                              {meeting.peer_name}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="text-accent">📅</span>
                              {formatDate(meeting.scheduled_date)} at {meeting.scheduled_time}
                            </span>
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                              {formatMeetingType(meeting.meeting_type)}
                            </span>
                          </div>
                          <p className="text-foreground/60 text-sm">
                            <span className="font-semibold text-foreground/70">Agenda:</span> {meeting.meeting_agenda}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ============================================ */}
            {/* SECTION 3: Create New Meeting */}
            {/* ============================================ */}
            <section className="mb-16">
              <MagneticButton
                variant="primary"
                size="lg"
                className="mb-6"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Close Form" : "Create New Peer Meeting"}
              </MagneticButton>

              {showForm && (
                <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Peer Info Section */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-accent">👤</span> Peer Information
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Peer Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="peerName"
                            value={formData.peerName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="Enter peer's name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Peer Email
                          </label>
                          <input
                            type="email"
                            name="peerEmail"
                            value={formData.peerEmail}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="peer@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Peer LinkedIn
                          </label>
                          <input
                            type="url"
                            name="peerLinkedIn"
                            value={formData.peerLinkedIn}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meeting Details Section */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-accent">📋</span> Meeting Details
                      </h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                              Meeting Title <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              name="meetingTitle"
                              value={formData.meetingTitle}
                              onChange={handleInputChange}
                              required
                              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                              placeholder="e.g., DSA Problem Solving Session"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                              Meeting Topics
                            </label>
                            <input
                              type="text"
                              name="meetingTopics"
                              value={formData.meetingTopics}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                              placeholder="Arrays, Trees, Graphs (comma-separated)"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Meeting Agenda <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            name="meetingAgenda"
                            value={formData.meetingAgenda}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors resize-none"
                            placeholder="Describe what you want to cover in this meeting..."
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                              Skill Level
                            </label>
                            <select
                              name="skillLevel"
                              value={formData.skillLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground/80 mb-2">
                              Meeting Type
                            </label>
                            <select
                              name="meetingType"
                              value={formData.meetingType}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
                            >
                              <option value="mock-interview">Mock Interview</option>
                              <option value="code-review">Code Review</option>
                              <option value="system-design">System Design</option>
                              <option value="dsa-practice">DSA Practice</option>
                              <option value="general">General</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Section */}
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-accent">📅</span> Schedule
                      </h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Duration (mins)
                          </label>
                          <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            min="15"
                            max="180"
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Timezone
                          </label>
                          <select
                            name="timezone"
                            value={formData.timezone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-background/50 border border-foreground/20 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors cursor-pointer"
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Asia/Kolkata">India (IST)</option>
                            <option value="Asia/Tokyo">Japan (JST)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-4 bg-accent hover:bg-accent/90 text-background font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/25"
                      >
                        Create & Join Meeting →
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>

            {/* Navigation */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/journey/job-trends">
                <MagneticButton size="lg" variant="primary">
                  Next: Job Trends
                </MagneticButton>
              </Link>
              <Link href="/journey/portfolio">
                <MagneticButton size="lg" variant="secondary">
                  Back
                </MagneticButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
