"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Languages, Mic, MicOff, Radio, Volume2 } from "lucide-react"

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

export function VoiceInterviewer({ onUserPaused }: { onUserPaused?: (entry: TranscriptEntry) => void }) {
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
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transcribe this utterance.")
    } finally {
      setIsTranscribing(false)
    }
  }, [onUserPaused])

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
      if (listeningRef.current) window.setTimeout(beginUtterance, 100)
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
    <section className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><div className="flex items-center gap-2 text-sm font-semibold"><Volume2 size={16} className="text-orange-400" /> Explain your design</div><p className="mt-1 text-xs leading-5 text-slate-400">VAD ends an utterance after 1.7s of silence, then transcribes it with Saaras.</p></div>
        <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${isSpeaking ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-800 text-slate-400"}`}><Radio size={14} /></span>
      </div>
      <label className="mb-3 flex items-center gap-2 text-xs text-slate-400"><Languages size={14} /><select value={languageMode} onChange={(event) => setLanguageMode(event.target.value)} className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-slate-200 outline-none"><option value="auto">Auto-detect (Saaras `unknown`)</option>{languageChoices.slice(1).map(([value, label]) => <option value={value} key={value}>{label} fallback</option>)}</select></label>
      <button onClick={isListening ? stopListening : startListening} disabled={isTranscribing} className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isListening ? "bg-red-500/15 text-red-200 hover:bg-red-500/25" : "bg-orange-500 text-slate-950 hover:bg-orange-400"}`}>
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}{isTranscribing ? "Transcribing…" : isListening ? "Stop listening" : "Start explaining"}
      </button>
      {error && <p className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">{error}</p>}
      <div className="mt-4 space-y-2"><p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Transcript history</p>{transcripts.length === 0 ? <p className="text-xs text-slate-500">Your recognized explanations will appear here.</p> : transcripts.slice().reverse().map((entry) => <article key={`${entry.timestamp}-${entry.text}`} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2.5"><div className="mb-1 flex justify-between gap-2 text-[10px] text-slate-500"><span>{entry.languageCode}{entry.languageProbability !== null ? ` · ${Math.round(entry.languageProbability * 100)}%` : ""}</span><span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><p className="text-xs leading-5 text-slate-200">{entry.text}</p></article>)}</div>
    </section>
  )
}
