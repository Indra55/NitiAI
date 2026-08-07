"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Mic, Square, Volume2, VolumeX, Globe, Loader2, AlertCircle, ArrowRight, User, Bot, RotateCcw, FileText } from "lucide-react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import {
  startVoiceSession,
  processVoiceAudio,
  type VoiceProcessResponse,
} from "@/lib/api"

const SUPPORTED_LANGUAGES: Record<string, string> = {
  "en-IN": "English",
  "hi-IN": "हिंदी",
  "bn-IN": "বাংলা",
  "ta-IN": "தமிழ்",
  "te-IN": "తెలుగు",
  "kn-IN": "ಕನ್ನಡ",
  "ml-IN": "മലയാളം",
  "mr-IN": "मराठी",
  "gu-IN": "ગુજરાતી",
  "pa-IN": "ਪੰਜਾਬੀ",
  "od-IN": "ଓଡ଼ିଆ",
}

interface ResumeData {
  name?: string; email?: string; phone?: string; location?: string
  title?: string; summary?: string
  education?: Array<Record<string, string>>
  experience?: Array<Record<string, string>>
  technical_skills?: string[]; soft_skills?: string[]
  projects?: Array<Record<string, unknown>>; certifications?: Array<Record<string, string>>
}

interface ChatMessage {
  id: string
  role: "user" | "ai"
  content: string
}

export default function VoiceResumePage() {
  const router = useRouter()
  const recorder = useVoiceRecorder()
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [language, setLanguage] = useState("en-IN")
  const [enableTTS, setEnableTTS] = useState(true)
  const [resumeData, setResumeData] = useState<ResumeData>({})
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  
  const [phase, setPhase] = useState<"welcome" | "interview">("welcome")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory, isProcessing])

  const playBase64Audio = useCallback((base64: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(`data:audio/wav;base64,${base64}`)
      audioRef.current = audio
      setIsPlayingAudio(true)
      audio.onended = () => setIsPlayingAudio(false)
      audio.onerror = () => setIsPlayingAudio(false)
      audio.play()
    } catch { setIsPlayingAudio(false) }
  }, [])

  const handleStartSession = useCallback(async () => {
    setError(null)
    const result = await startVoiceSession(language, enableTTS)
    if (result.data) {
      setSessionId(result.data.sessionId)
      
      const firstMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "ai",
        content: result.data.aiResponse
      }
      setChatHistory([firstMsg])
      setPhase("interview")
      
      if (enableTTS && result.data.aiResponseAudio) {
        playBase64Audio(result.data.aiResponseAudio)
      }
    } else {
      setError(result.error || "Failed to start session")
    }
  }, [language, enableTTS, playBase64Audio])

  const handleProcessAudio = useCallback(async () => {
    if (!recorder.audioBlob) return
    setIsProcessing(true)
    setError(null)

    const payloadHistory = chatHistory.map(msg => ({ role: msg.role, content: msg.content }))

    const result = await processVoiceAudio(
      recorder.audioBlob,
      language,
      resumeData,
      payloadHistory,
      enableTTS
    )

    if (result.data && result.data.success) {
      const data = result.data as VoiceProcessResponse
      
      setChatHistory(prev => [
        ...prev,
        { id: Date.now().toString() + "-user", role: "user", content: data.originalTranscript },
        { id: Date.now().toString() + "-ai", role: "ai", content: data.aiResponse }
      ])
      
      if (data.extractedData && Object.keys(data.extractedData).length > 0) {
        setResumeData(prev => ({ ...prev, ...data.extractedData }))
      }
      
      if (enableTTS && data.aiResponseAudio) {
        playBase64Audio(data.aiResponseAudio)
      }
    } else {
      setError(result.error || "Failed to process audio")
    }
    
    recorder.resetRecording()
    setIsProcessing(false)
  }, [recorder, language, resumeData, chatHistory, enableTTS, playBase64Audio])

  useEffect(() => {
    if (!recorder.isRecording && recorder.audioBlob && phase === "interview" && !isProcessing) {
      handleProcessAudio()
    }
  }, [recorder.isRecording, recorder.audioBlob, phase, isProcessing, handleProcessAudio])

  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden flex flex-col font-sans selection:bg-gray-900 selection:text-white">
      <DynamicNavbar />
      
      <main className="relative z-10 flex-1 flex min-h-0 pt-28 pb-8 px-4 w-full max-w-7xl mx-auto gap-8">
        
        {/* === WELCOME PHASE === */}
        <AnimatePresence mode="wait">
          {phase === "welcome" && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-white">
              <div className="text-center space-y-10 max-w-2xl px-6">
                
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                    Build Your Resume.
                    <br />
                    <span className="text-gray-400">Conversational Style.</span>
                  </h1>
                  <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Simply chat with our AI recruiter in your native language. Correct mistakes on the fly and watch your document structure itself automatically.
                  </p>
                </div>

                {/* Language selector */}
                <div className="max-w-xl mx-auto space-y-5">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-widest">
                    <Globe className="w-4 h-4" /> Select Language
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <button key={code} onClick={() => setLanguage(code)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${language === code
                          ? "bg-gray-900 border-gray-900 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                        }`}>
                        {name}
                      </button>
                    ))}
                  </div>
                  
                  {/* TTS toggle */}
                  <button onClick={() => setEnableTTS(!enableTTS)}
                    className={`flex items-center justify-center gap-3 w-full px-4 py-4 rounded-lg border transition-all ${enableTTS
                      ? "bg-gray-50 border-gray-200 text-gray-900 font-medium"
                      : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600"
                    }`}>
                    {enableTTS ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    <span className="text-sm">{enableTTS ? "AI Voice Enabled" : "Silent Mode"}</span>
                  </button>
                </div>

                {/* Start button */}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleStartSession}
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gray-900 text-white font-medium text-lg hover:bg-gray-800 transition-colors shadow-xl shadow-gray-900/10">
                  Begin Interview
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                {error && (
                  <div className="flex items-center gap-2 justify-center text-red-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* === INTERVIEW PHASE === */}
          {phase === "interview" && (
            <>
              {/* Left Column: Chat & Voice Interface */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full lg:w-1/2 flex flex-col h-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center relative">
                      <Mic className="w-5 h-5 text-gray-900" />
                      {isPlayingAudio && <span className="absolute top-0 right-0 w-3 h-3 bg-gray-900 border-2 border-white rounded-full animate-ping" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Recruiter</h3>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">LISTENING & STRUCTURING</p>
                    </div>
                  </div>
                  <button onClick={() => { setPhase("welcome"); setResumeData({}); setChatHistory([]) }} className="p-2.5 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100" title="Start Over">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Log Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-white">
                  {chatHistory.map((msg, i) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === "ai" ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-white border-gray-200 text-gray-900"}`}>
                        {msg.role === "ai" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className={`max-w-[85%] px-5 py-4 ${msg.role === "ai" ? "bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm text-gray-800" : "bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tr-sm text-gray-900"}`}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-900 flex items-center justify-center shrink-0">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-6 py-5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} className="h-4" />
                </div>

                {/* Voice Controls Area */}
                <div className="p-8 bg-white border-t border-gray-100 flex flex-col items-center gap-6">
                  
                  {/* Waveform visualization */}
                  <div className="flex items-center justify-center gap-1.5 h-12">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <motion.div key={i}
                        animate={{ height: recorder.isRecording ? `${Math.max(4, recorder.audioLevel * 48 * (0.5 + Math.random() * 0.5))}px` : 4 }}
                        transition={{ duration: 0.1 }}
                        className={`w-1 rounded-full ${recorder.isRecording ? "bg-red-500" : "bg-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Main Interaction Button */}
                  <div className="flex flex-col items-center gap-4">
                    <motion.button
                      disabled={isProcessing}
                      whileTap={{ scale: 0.95 }}
                      onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        recorder.isRecording
                          ? "bg-red-500"
                          : isProcessing 
                            ? "bg-gray-100 border border-gray-200"
                            : "bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-900/20"
                      }`}>
                      {recorder.isRecording && (
                        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 rounded-full bg-red-500/20" />
                      )}
                      {recorder.isRecording ? (
                        <Square className="w-8 h-8 text-white relative z-10" fill="currentColor" />
                      ) : isProcessing ? (
                        <Loader2 className="w-8 h-8 text-gray-400 relative z-10 animate-spin" />
                      ) : (
                        <Mic className="w-8 h-8 text-white relative z-10" />
                      )}
                    </motion.button>
                    
                    <p className="text-gray-500 text-sm font-medium tracking-wide">
                      {recorder.isRecording 
                        ? `RECORDING... ${recorder.duration}S / 25S` 
                        : isProcessing
                          ? "THINKING..."
                          : recorder.error 
                            ? recorder.error.toUpperCase()
                            : "TAP TO SPEAK"
                      }
                    </p>
                  </div>
                  
                  {error && <div className="text-red-600 text-xs font-medium flex items-center gap-1.5 bg-red-50 px-4 py-2 rounded-lg border border-red-100"><AlertCircle className="w-4 h-4" /> {error}</div>}
                </div>
              </motion.div>

              {/* Right Column: Live Resume Preview */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:flex w-1/2 flex-col h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                
                <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-400" /> Document Preview</h3>
                  <button onClick={() => router.push("/resume-builder")} className="text-xs font-semibold text-gray-900 hover:text-white bg-white hover:bg-gray-900 border border-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                    Export / Edit <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 bg-white text-gray-900 space-y-8 font-serif">
                  {/* Empty state watermark */}
                  {Object.keys(resumeData).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 font-sans">
                      <FileText className="w-16 h-16 mb-4 text-gray-200" />
                      <p className="text-lg font-medium text-gray-400">Your document is empty.</p>
                      <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">Begin speaking with the AI to watch your resume build automatically.</p>
                    </div>
                  )}

                  {Object.keys(resumeData).length > 0 && (
                    <>
                      {/* Name */}
                      <div className="border-b-2 border-gray-900 pb-6">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{resumeData.name || "Your Name"}</h2>
                        <p className="text-xl text-gray-600 font-medium mt-2">{resumeData.title || "Professional Title"}</p>
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 font-sans font-medium">
                          {resumeData.email && <span>{resumeData.email}</span>}
                          {resumeData.phone && <span>• {resumeData.phone}</span>}
                          {resumeData.location && <span>• {resumeData.location}</span>}
                        </div>
                      </div>
                      
                      {resumeData.summary && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 font-sans">Professional Summary</h3>
                          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                        </div>
                      )}

                      {resumeData.experience && resumeData.experience.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 font-sans">Work Experience</h3>
                          <div className="space-y-6">
                            {resumeData.experience.map((exp, i) => (
                              <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                  <div className="text-lg font-bold text-gray-900">{exp.role} <span className="font-normal text-gray-500 italic">at {exp.company}</span></div>
                                  {(exp.startDate || exp.endDate) && <div className="text-gray-500 text-sm font-sans font-medium whitespace-nowrap">{exp.startDate} — {exp.endDate}</div>}
                                </div>
                                {exp.description && <p className="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{exp.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {resumeData.education && resumeData.education.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 font-sans">Education</h3>
                          <div className="space-y-4">
                            {resumeData.education.map((edu, i) => (
                              <div key={i}>
                                <div className="text-lg font-bold text-gray-900">{edu.degree}</div>
                                <div className="text-gray-700 flex justify-between items-baseline mt-1">
                                  <span>{edu.institution}</span>
                                  {edu.endDate && <span className="text-gray-500 text-sm font-sans font-medium">{edu.endDate}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(resumeData.technical_skills?.length || resumeData.soft_skills?.length) ? (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 font-sans">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.technical_skills?.map((s, i) => <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-800 font-sans rounded text-sm font-medium">{s}</span>)}
                            {resumeData.soft_skills?.map((s, i) => <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 font-sans rounded text-sm font-medium">{s}</span>)}
                          </div>
                        </div>
                      ) : null}

                      {resumeData.projects && resumeData.projects.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 font-sans">Projects</h3>
                          <div className="space-y-4">
                            {resumeData.projects.map((p, i) => (
                              <div key={i}>
                                <span className="text-lg font-bold text-gray-900">{String(p.name || "")}</span>
                                {p.description && <p className="text-gray-700 mt-1 leading-relaxed">{String(p.description)}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
