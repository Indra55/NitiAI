"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Languages, Mic, MicOff, Radio, Volume2 } from "lucide-react"
import LanguageBridgeModal from "@/components/language-bridge/LanguageBridgeModal"
import { useLanguageEval } from "@/hooks/use-language-eval"

export type TranscriptEntry = {
  text: string
  languageCode: string
  languageProbability: number | null
  timestamp: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555"
const SILENCE_MS = 1700
const SPEECH_THRESHOLD = 0.018

const languageChoices = [
  ["auto", "Auto detect (active)"],
  ["en-IN", "English"],
  ["hi-IN", "Hindi"],
  ["ta-IN", "Tamil"],
  ["te-IN", "Telugu"],
  ["kn-IN", "Kannada"],
  ["ml-IN", "Malayalam"],
  ["mr-IN", "Marathi"],
  ["bn-IN", "Bengali"],
  ["gu-IN", "Gujarati"],
  ["pa-IN", "Punjabi"],
  ["od-IN", "Odia"],
]

type InterviewCritique = { text: string; languageCode: string }
type InterviewStage = "discovery" | "drawing" | "deep_dive" | "feedback"

export function VoiceInterviewer({ onUserPaused, openingQuestion, introMessage, critiques = [], stage }: { onUserPaused?: (entry: TranscriptEntry) => void; openingQuestion: string; introMessage?: string | null; critiques?: InterviewCritique[]; stage: InterviewStage }) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [languageMode, setLanguageMode] = useState("auto")
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const animationRef = useRef<number | null>(null)
  const silenceStartedAt = useRef<number | null>(null)
  const heardSpeech = useRef(false)
  const listeningRef = useRef(false)
  const languageRef = useRef(languageMode)

  useEffect(() => { languageRef.current = languageMode }, [languageMode])

  const stopRecorder = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state === "recording") recorder.stop()
  }, [])

  const {
    evalResult,
    isBridgeModalOpen,
    evaluateAnswer,
    closeBridgeModal
  } = useLanguageEval()

  const sendUtterance = useCallback(async (blob: Blob) => {
    if (blob.size < 1_500) return
    setIsTranscribing(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("audio", blob, "utterance.webm")
      form.append("languageCode", languageRef.current)
      const response = await fetch(`${API_URL}/api/system-design/transcribe`, { method: "POST", body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not transcribe this utterance.")
      if (data.transcript?.trim()) {
        const entry: TranscriptEntry = {
          text: data.transcript.trim(),
          languageCode: data.languageCode || "en-IN",
          languageProbability: data.languageProbability ?? null,
          timestamp: data.timestamp || new Date().toISOString(),
        }
        setTranscripts((current) => [...current.slice(-19), entry])
        onUserPaused?.(entry)

        // Async lightweight evaluation for System Design explanation
        evaluateAnswer(entry.text, openingQuestion || "System Design Architecture", entry.languageCode)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transcribe this utterance.")
    } finally {
      setIsTranscribing(false)
    }
  }, [onUserPaused, openingQuestion, evaluateAnswer])

  const beginUtterance = useCallback(() => {
    const stream = streamRef.current
    if (!stream || !listeningRef.current || recorderRef.current?.state === "recording") return
    const chunks: BlobPart[] = []
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm"
    const recorder = new MediaRecorder(stream, { mimeType })
    recorderRef.current = recorder
    heardSpeech.current = false
    silenceStartedAt.current = null
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    recorder.onstop = () => {
      const utterance = new Blob(chunks, { type: recorder.mimeType || "audio/webm" })
      if (heardSpeech.current) void sendUtterance(utterance)
      // One microphone activation equals one candidate turn. This prevents the
      // interviewer audio or a second silence from being mistaken for an answer.
      listeningRef.current = false
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      contextRef.current?.close().catch(() => undefined)
      streamRef.current = null
      contextRef.current = null
      analyserRef.current = null
      setIsListening(false)
      setIsSpeaking(false)
    }
    recorder.start()
  }, [sendUtterance])

  const checkVoiceActivity = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser || !listeningRef.current) return
    const samples = new Uint8Array(analyser.fftSize)
    analyser.getByteTimeDomainData(samples)
    let energy = 0
    for (const sample of samples) energy += Math.abs(sample - 128) / 128
    const level = energy / samples.length
    const now = Date.now()
    if (level > SPEECH_THRESHOLD) {
      heardSpeech.current = true
      silenceStartedAt.current = null
      setIsSpeaking(true)
    } else if (heardSpeech.current) {
      setIsSpeaking(false)
      silenceStartedAt.current ??= now
      if (now - silenceStartedAt.current >= SILENCE_MS) {
        stopRecorder()
        silenceStartedAt.current = null
      }
    }
    animationRef.current = requestAnimationFrame(checkVoiceActivity)
  }, [stopRecorder])

  const stopListening = useCallback(() => {
    listeningRef.current = false
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    stopRecorder()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    contextRef.current?.close().catch(() => undefined)
    streamRef.current = null
    contextRef.current = null
    analyserRef.current = null
    setIsListening(false)
    setIsSpeaking(false)
  }, [stopRecorder])

  const startListening = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 1024
      context.createMediaStreamSource(stream).connect(analyser)
      streamRef.current = stream
      contextRef.current = context
      analyserRef.current = analyser
      listeningRef.current = true
      setIsListening(true)
      beginUtterance()
      animationRef.current = requestAnimationFrame(checkVoiceActivity)
    } catch {
      setError("Microphone access was blocked. Allow it in your browser and try again.")
    }
  }, [beginUtterance, checkVoiceActivity])

  useEffect(() => () => stopListening(), [stopListening])

  return (
    <section className="rounded-xl border border-[#e8e1da] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Volume2 size={16} className="text-[#ef4a18]" /> Interview room <span className="rounded-full bg-[#fff0eb] px-2 py-0.5 text-[10px] font-medium text-[#ef4a18]">{stage === "discovery" ? "Warm-up" : stage === "drawing" ? "Build" : stage === "deep_dive" ? "Trade-offs" : "Review"}</span></div><p className="mt-1 text-xs leading-5 text-gray-500">Speak naturally. A pause ends your turn and gives the tech lead a chance to respond.</p></div>
        <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${isSpeaking ? "bg-[#eaf6ee] text-[#287443]" : "bg-[#f4f1ed] text-gray-400"}`}><Radio size={14} /></span>
      </div>
      <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
        <article className="mr-5 rounded-xl rounded-tl-sm border border-[#ef4a18]/20 bg-[#fff0eb] p-3"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#ef4a18]">Mentor</p><p className="text-xs leading-5 text-gray-900">{introMessage || `Welcome. I’ll be your senior tech lead today. The scenario is: ${openingQuestion} I’ll first ask about requirements, then I’ll ask you to draw the architecture, and finally we’ll review your trade-offs.`}</p></article>
        <article className="mr-5 rounded-xl rounded-tl-sm border border-[#e8e1da] bg-white p-3 shadow-sm"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">First question</p><p className="text-xs leading-5 text-gray-800">Before drawing, what are the most important requirements and assumptions you would clarify for this system?</p></article>
        {transcripts.map((entry) => <article key={`${entry.timestamp}-${entry.text}`} className="ml-5 rounded-xl rounded-tr-sm bg-[#f4f1ed] p-3"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">You · {entry.languageCode}</p><p className="text-xs leading-5 text-gray-900">{entry.text}</p></article>)}
        {critiques.map((critique, index) => <article key={`${index}-${critique.text}`} className="mr-5 rounded-xl rounded-tl-sm border border-[#ef4a18]/20 bg-[#fff0eb] p-3"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#ef4a18]">Mentor · {critique.languageCode}</p><p className="text-xs leading-5 text-gray-900">{critique.text}</p></article>)}
        {transcripts.length === 0 && <p className="px-2 text-xs text-gray-400">The mentor is waiting for your first answer.</p>}
      </div>
      <label className="mb-3 flex items-center gap-2 text-xs text-gray-500"><Languages size={14} /><select value={languageMode} onChange={(event) => setLanguageMode(event.target.value)} className="min-w-0 flex-1 rounded-md border border-[#e8e1da] bg-[#fdfaf7] px-2 py-1.5 text-gray-700 outline-none"><option value="auto">Auto-detect (Saaras `unknown`)</option>{languageChoices.slice(1).map(([value, label]) => <option value={value} key={value}>{label} fallback</option>)}</select></label>
      <button onClick={isListening ? stopListening : startListening} disabled={isTranscribing} className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isListening ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#ef4a18] text-white hover:bg-[#d93d10] shadow-sm hover:-translate-y-0.5"}`}>
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}{isTranscribing ? "Mentor is listening…" : isListening ? isSpeaking ? "Your turn — keep explaining" : "Listening for your answer…" : transcripts.length ? "Answer the mentor" : "Begin your answer"}
      </button>
      {error && <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">{error}</p>}

      <LanguageBridgeModal
        isOpen={isBridgeModalOpen}
        onClose={closeBridgeModal}
        evaluationResult={evalResult}
        questionContext={openingQuestion || "System Design Architecture"}
        userNativeLanguage={languageMode === "auto" ? "hi-IN" : languageMode}
        onApplyEnglishAnswer={(perfectedEnglish) => {
          const entry: TranscriptEntry = {
            text: perfectedEnglish,
            languageCode: "en-IN",
            languageProbability: 1.0,
            timestamp: new Date().toISOString(),
          }
          setTranscripts((current) => [...current.slice(-19), entry])
          onUserPaused?.(entry)
        }}
      />
    </section>
  )
}
