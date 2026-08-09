"use client";

import React, { useState, useEffect, useRef } from "react";
import { DynamicNavbar } from "@/components/dynamic-navbar";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Sparkles,
  Mic,
  MicOff,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Code2,
  Layers,
  Users,
  Send,
  Volume2,
  Sliders,
  Award,
  ChevronRight,
  VolumeX,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";

type InterviewType = "dsa" | "system_design" | "behavioral";

const INTERVIEW_CATEGORIES = [
  {
    id: "dsa" as InterviewType,
    title: "Coding & Technical Viva",
    icon: Code2,
    description: "Explain algorithms, time complexity, and data structure choices clearly."
  },
  {
    id: "system_design" as InterviewType,
    title: "System Architecture",
    icon: Layers,
    description: "Articulate low-latency trade-offs, caching, and microservices design."
  },
  {
    id: "behavioral" as InterviewType,
    title: "Behavioral & HR Leadership",
    icon: Users,
    description: "Structure leadership stories, conflict resolution, and impact metrics."
  }
];

const SAMPLE_PRACTICE_PROMPTS: Record<InterviewType, string[]> = {
  dsa: [
    "How do you detect a cycle in a linked list using Floyd's Tortoise and Hare algorithm?",
    "Explain the difference between a BFS traversal and a DFS traversal on a binary tree.",
    "Why does a HashMap provide O(1) average time complexity for lookup operations?"
  ],
  system_design: [
    "How would you design a rate limiter to handle 100,000 requests per second?",
    "Explain how cache eviction works in Redis using LRU vs LFU strategies.",
    "How do you handle database write contention in a high-concurrency flash sale?"
  ],
  behavioral: [
    "Tell me about a time when you disagreed with a senior engineer's architectural choice.",
    "Describe a complex production incident you resolved under tight time pressure.",
    "How do you prioritize competing technical debt vs new product features?"
  ]
};

const SUPPORTED_NATIVE_LANGUAGES = [
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { code: "gu-IN", label: "Gujarati (ગુજરાતી)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
  { code: "pa-IN", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "or-IN", label: "Odia (ଓଡ଼િଆ)" }
];

interface EvalResult {
  clarityScore: number
  grammarScore: number
  relevanceScore: number
  logicalCoherenceScore: number
  totalScore: number
  explanation: string
  grammarIssues: string[]
  suggestions: string[]
}

interface CoachBridgeResult {
  nativeExplanationWhy: string
  nativeExplanationHow: string
  perfectedEnglish: string
  keyTechnicalPhrases: string[]
  explanationTip: string
  audioHintText: string
}

export default function LinguaCoachPage() {
  const { currentLanguage } = useLanguage();
  const [selectedType, setSelectedType] = useState<InterviewType>("dsa");
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [nativeLang, setNativeLang] = useState("hi-IN");
  
  const [userInput, setUserInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Evaluation & Coaching State
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [coachBridgeResult, setCoachBridgeResult] = useState<CoachBridgeResult | null>(null);

  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activePrompt = SAMPLE_PRACTICE_PROMPTS[selectedType][currentPromptIdx];
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined") return "audio/webm";
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4", "audio/wav"];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "audio/webm";
  };

  const handleStartRecording = async () => {
    setRecordingStatus("Initializing microphone...");
    setUserInput("");
    setRecordingTime(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setRecordingStatus("Processing recorded audio...");
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(t => t.stop());

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const resultStr = reader.result as string;
          const base64Audio = resultStr ? resultStr.split(",")[1] : "";
          if (!base64Audio) {
            setRecordingStatus("No audio data captured.");
            return;
          }

          try {
            setIsProcessing(true);
            setRecordingStatus("Sending to Sarvam Saaras V3 ASR...");
            const res = await fetch(`${backendUrl}/api/language-eval/speech-to-text`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64Audio, languageCode: nativeLang })
            });
            const data = await res.json();
            if (data.transcript && data.transcript.trim().length > 0) {
              setUserInput(data.transcript);
              setRecordingStatus("Sarvam ASR transcribed successfully.");
              await evaluateAndCoach(data.transcript);
            } else if (userInput.trim().length > 0) {
              setRecordingStatus("Using live Web Speech transcript.");
              await evaluateAndCoach(userInput);
            }
          } catch (e) {
            console.error("Sarvam ASR error:", e);
            if (userInput.trim().length > 0) {
              await evaluateAndCoach(userInput);
            }
          } finally {
            setIsProcessing(false);
            setTimeout(() => setRecordingStatus(null), 3000);
          }
        };
      };

      // Also start Web Speech API fallback for live transcript display
      if (typeof window !== "undefined") {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = nativeLang === "hi-IN" ? "hi-IN" : "en-US";
            recognition.onresult = (e: any) => {
              let currentTranscript = "";
              for (let i = e.resultIndex; i < e.results.length; i++) {
                currentTranscript += e.results[i][0].transcript;
              }
              if (currentTranscript.trim().length > 0) {
                setUserInput(currentTranscript);
              }
            };
            recognition.start();
            speechRecognitionRef.current = recognition;
          } catch (err) {
            console.warn("Web Speech API error:", err);
          }
        }
      }

      mediaRecorderRef.current.start(250); // Flush chunks every 250ms
      setIsRecording(true);
      setRecordingStatus("Recording active - speak now...");

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (e: any) {
      console.error("Microphone error:", e);
      setRecordingStatus(`Microphone access error: ${e.message || "Permission denied"}`);
    }
  };

  const handleStopRecording = () => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch(e){}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleSpeakText = (text: string) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const evaluateAndCoach = async (textToProcess?: string) => {
    const inputStr = textToProcess || userInput;
    if (!inputStr.trim()) return;

    setIsProcessing(true);
    setEvalResult(null);
    setCoachBridgeResult(null);

    try {
      // 1. Run Async English Quality Evaluation
      const evalRes = await fetch(`${backendUrl}/api/language-eval/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer: inputStr,
          questionContext: activePrompt,
          nativeLanguage: nativeLang
        })
      });
      const evalData = await evalRes.json();
      setEvalResult(evalData);

      // 2. Run Sarvam LinguaCraft Native Mentorship & Bridge
      const bridgeRes = await fetch(`${backendUrl}/api/language-eval/assist-bridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nativeThought: inputStr,
          nativeLanguage: nativeLang,
          questionContext: activePrompt
        })
      });
      const bridgeData = await bridgeRes.json();

      setCoachBridgeResult({
        nativeExplanationWhy: bridgeData.nativeExplanationWhy || "Break down the core technical mechanism and trade-offs clearly before describing implementation details.",
        nativeExplanationHow: bridgeData.nativeExplanationHow || `In ${nativeLang}, explain the concept in your own natural words first, then connect it using technical keywords.`,
        perfectedEnglish: bridgeData.englishExplanation || inputStr,
        keyTechnicalPhrases: bridgeData.keyPhrases || ["system architecture", "time complexity", "scalability"],
        explanationTip: bridgeData.explanationTip || "Use clear active verbs to demonstrate confidence.",
        audioHintText: bridgeData.audioHintText || "Confidently articulate your solution in English."
      });
    } catch (err) {
      console.error("LinguaCraft execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
        <DynamicNavbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 space-y-8">
          
          {/* Header Banner */}
          <header className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full border border-orange-200">
                  LinguaCraft Agent
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  Untimed Practice Mode
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Native-to-English Language Betterment Agent
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal leading-relaxed">
                Explain complex technical concepts in your native language without time limits. Sarvam AI guides you on why and how to structure your thought in native language, then transitions you smoothly into professional English.
              </p>
            </div>

            {/* Native Language Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 shrink-0 w-full md:w-64">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-orange-600" /> Native Language
              </label>
              <select
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 cursor-pointer"
              >
                {SUPPORTED_NATIVE_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </header>

          {/* Interview Type Selector Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INTERVIEW_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedType(cat.id);
                    setCurrentPromptIdx(0);
                    setEvalResult(null);
                    setCoachBridgeResult(null);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-md"
                      : "bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? "bg-slate-800 text-orange-400" : "bg-slate-100 text-slate-700"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                        Active Mode
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold">{cat.title}</h3>
                  <p className={`text-xs mt-1 font-normal ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {cat.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Main Practice & Articulation Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: Interview Question & Candidate Response Input (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Question Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
                    Practice Question {currentPromptIdx + 1} of {SAMPLE_PRACTICE_PROMPTS[selectedType].length}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPromptIdx((prev) => (prev + 1) % SAMPLE_PRACTICE_PROMPTS[selectedType].length);
                      setEvalResult(null);
                      setCoachBridgeResult(null);
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    Next Prompt <ChevronRight size={14} />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  "{activePrompt}"
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  No timer restrictions. Take your time to explain your thought process naturally in your native language or in English.
                </p>
              </div>

              {/* Response Input Area */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-orange-600" />
                  Your Explanation / Native Brainstorm
                </label>

                <textarea
                  rows={5}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Explain your solution or thought process naturally in your native language (e.g. Hindi, Marathi, Tamil) or English... LinguaCraft will analyze your articulation and provide native mentorship."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all resize-none font-medium"
                />

                {recordingStatus && (
                  <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 animate-in fade-in">
                    {isRecording && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />}
                    <span>{recordingStatus}</span>
                    {isRecording && (
                      <span className="ml-auto font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {/* Voice Record Toggle */}
                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-pulse cursor-pointer"
                    >
                      <MicOff size={15} /> Stop Recording
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mic size={15} className="text-orange-600" /> Speak Native Audio
                    </button>
                  )}

                  {/* Execute Coach & Eval */}
                  <Button
                    onClick={() => evaluateAndCoach()}
                    disabled={isProcessing || !userInput.trim()}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs px-6 py-2.5 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin mr-2" /> LinguaCraft Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze & Get Native Coaching <ArrowRight size={14} className="ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>

            {/* RIGHT: English Evaluation Pipeline & Sarvam Native Mentorship (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Native Language Coaching (Why & How) */}
              {coachBridgeResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      Native Language Mentorship
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                      Step-by-Step Guidance
                    </span>
                  </div>

                  {/* Why to say it */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Why to Say It (Native Logic):</span>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {coachBridgeResult.nativeExplanationWhy}
                    </p>
                  </div>

                  {/* How to say it */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">How to Frame It (Sentence Structure):</span>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      {coachBridgeResult.nativeExplanationHow}
                    </p>
                  </div>

                  {/* Transition to Professional English */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        Perfected Professional English Answer:
                      </span>
                      <button
                        onClick={() => handleSpeakText(coachBridgeResult.perfectedEnglish)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                      >
                        {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        Listen Audio
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/80">
                      "{coachBridgeResult.perfectedEnglish}"
                    </p>
                  </div>

                  {/* Key Technical Phrases */}
                  {coachBridgeResult.keyTechnicalPhrases && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Vocabulary Terms:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {coachBridgeResult.keyTechnicalPhrases.map((phrase, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[10px] font-bold">
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => setUserInput(coachBridgeResult.perfectedEnglish)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    Adopt Perfected English Answer <ArrowRight size={14} />
                  </Button>
                </div>
              )}

              {/* Integrated English Evaluation Pipeline */}
              {evalResult ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-600" />
                      English Evaluation Pipeline
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                      <span className={`text-sm font-black ${evalResult.totalScore < 14 ? "text-amber-600" : "text-emerald-600"}`}>
                        {evalResult.totalScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">/ 20</span>
                    </div>
                  </div>

                  {/* 4 Dimension Badges */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Clarity</div>
                      <div className="text-sm font-bold text-slate-800">{evalResult.clarityScore}/10</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Grammar</div>
                      <div className="text-sm font-bold text-slate-800">{evalResult.grammarScore}/10</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Relevance</div>
                      <div className="text-sm font-bold text-slate-800">{evalResult.relevanceScore}/10</div>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Coherence</div>
                      <div className="text-sm font-bold text-slate-800">{evalResult.logicalCoherenceScore}/10</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {evalResult.explanation}
                  </p>

                  {evalResult.grammarIssues && evalResult.grammarIssues.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[11px] font-bold text-amber-700">Grammar & Syntax Fixes:</span>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                        {evalResult.grammarIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-center space-y-3 text-slate-400">
                  <Award className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">
                    Submit your explanation to view your English Evaluation Pipeline breakdown (/20).
                  </p>
                </div>
              )}

            </div>

          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
