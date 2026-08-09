"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Globe,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  X,
  Volume2,
  Languages
} from 'lucide-react';

interface LanguageBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationResult: {
    clarityScore: number;
    grammarScore: number;
    relevanceScore: number;
    logicalCoherenceScore: number;
    totalScore: number; // out of 40
    explanation: string;
    grammarIssues: string[];
    suggestions: string[];
  } | null;
  questionContext: string;
  userNativeLanguage?: string;
  onApplyEnglishAnswer: (perfectedEnglish: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
  { code: 'or-IN', label: 'Odia (ଓଡ଼ିଆ)' }
];

export default function LanguageBridgeModal({
  isOpen,
  onClose,
  evaluationResult,
  questionContext,
  userNativeLanguage = 'hi-IN',
  onApplyEnglishAnswer
}: LanguageBridgeModalProps) {
  const [selectedLang, setSelectedLang] = useState(userNativeLanguage);
  const [nativeInput, setNativeInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [assistedResult, setAssistedResult] = useState<{
    nativeExplanationWhy?: string;
    nativeExplanationHow?: string;
    englishExplanation: string;
    keyPhrases: string[];
    explanationTip: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (userNativeLanguage) setSelectedLang(userNativeLanguage);
  }, [userNativeLanguage]);

  if (!isOpen || !evaluationResult) return null;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            setIsTranslating(true);
            const res = await fetch(`${backendUrl}/api/language-eval/speech-to-text`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Audio, languageCode: selectedLang })
            });
            const data = await res.json();
            if (data.transcript) {
              setNativeInput(data.transcript);
              await handleTranslateNativeThought(data.transcript);
            }
          } catch (e) {
            console.error('Sarvam ASR Error:', e);
          } finally {
            setIsTranslating(false);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Recording error:', e);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranslateNativeThought = async (textToTranslate?: string) => {
    const inputStr = textToTranslate || nativeInput;
    if (!inputStr.trim()) return;

    setIsTranslating(true);
    try {
      const res = await fetch(`${backendUrl}/api/language-eval/assist-bridge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nativeThought: inputStr,
          nativeLanguage: selectedLang,
          questionContext
        })
      });
      const data = await res.json();
      setAssistedResult(data);
    } catch (e) {
      console.error('Assist bridge error:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const totalScore = evaluationResult.totalScore; // out of 40
  const isLowScore = totalScore < 24;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <Sparkles className="w-6 h-6 text-orange-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                LinguaCraft Language Bridge
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  Multilingual Assist
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Refine your technical articulation & express complex thoughts naturally.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score Breakdown Badge */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Articulation Quality Analysis
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-black ${isLowScore ? 'text-amber-600' : 'text-emerald-600'}`}>
                {totalScore}
              </span>
              <span className="text-xs text-slate-400 font-semibold">/ 40</span>
            </div>
          </div>

          {/* Individual Dimension Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Clarity</div>
              <div className="text-sm font-bold text-slate-800">{evaluationResult.clarityScore}/10</div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Grammar</div>
              <div className="text-sm font-bold text-slate-800">{evaluationResult.grammarScore}/10</div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Relevance</div>
              <div className="text-sm font-bold text-slate-800">{evaluationResult.relevanceScore}/10</div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Coherence</div>
              <div className="text-sm font-bold text-slate-800">{evaluationResult.logicalCoherenceScore}/10</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {evaluationResult.explanation}
          </p>

          {/* Grammar Errors */}
          {evaluationResult.grammarIssues && evaluationResult.grammarIssues.length > 0 && (
            <div className="space-y-1 border-t border-slate-200/60 pt-2">
              <span className="text-[11px] font-bold text-amber-700">Grammar & Syntax Fixes:</span>
              <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                {evaluationResult.grammarIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Multilingual Bridge Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Express in Your Native Language
            </label>

            {/* Language Dropdown */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Native Text Input + Voice Recording */}
          <div className="relative">
            <textarea
              rows={3}
              value={nativeInput}
              onChange={(e) => setNativeInput(e.target.value)}
              placeholder="Explain your thought process naturally in your native language (e.g. Hindi, Marathi, Tamil)... LinguaCraft will convert it to professional technical English."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-all resize-none font-medium"
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-pulse shadow-sm cursor-pointer"
                >
                  <MicOff size={14} /> Stop Recording
                </button>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Mic size={14} /> Speak Native Audio
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => handleTranslateNativeThought()}
            disabled={isTranslating || !nativeInput.trim()}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            {isTranslating ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Translating & Refining via Sarvam AI...
              </>
            ) : (
              <>
                <Languages size={14} /> Translate & Generate Professional English
              </>
            )}
          </button>
        </div>

        {/* Sarvam AI Assisted Result */}
        {assistedResult && (
          <div className="bg-orange-50/50 border border-orange-200/80 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Refined Professional English
              </span>
            </div>

            {assistedResult.nativeExplanationWhy && (
              <div className="text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-orange-100 space-y-1">
                <span className="font-bold text-slate-900">Why & How to Explain:</span>
                <p>{assistedResult.nativeExplanationWhy}</p>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-900 leading-relaxed bg-white p-3 rounded-xl border border-orange-100 shadow-2xs">
              "{assistedResult.englishExplanation}"
            </p>

            {assistedResult.keyPhrases && (
              <div className="flex flex-wrap gap-1.5">
                {assistedResult.keyPhrases.map((phrase, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 bg-white text-orange-800 border border-orange-200 rounded-lg text-[10px] font-bold">
                    {phrase}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onApplyEnglishAnswer(assistedResult.englishExplanation);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                Use Perfected English Answer <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
