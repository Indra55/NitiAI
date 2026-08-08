'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Mic, MicOff, Code2, Brain, FileText, Sparkles, RefreshCw, Volume2, 
  CheckCircle2, AlertCircle, Play, Pause, Upload, MessageSquare, Award, ArrowRight,
  GitBranch, Github, Layers, Target, ShieldCheck
} from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { getResumeInfo } from '@/lib/api';

export default function SarvamIndicStudio() {
  const [activeTab, setActiveTab] = useState<string>('code-explainer');
  const [targetLang, setTargetLang] = useState<string>('hi-IN');
  const [loading, setLoading] = useState<boolean>(false);

  // Audio Playback State
  const [playingAudio, setPlayingAudio] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Voice Recorder Hook (25s Limit)
  const {
    isRecording,
    duration,
    maxDuration,
    audioBlob,
    audioUrl,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
    error: recordingError
  } = useVoiceRecorder();

  // States for Feature 3 (Live Code Explainer)
  const [codeSnippet, setCodeSnippet] = useState('function twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    let diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}');
  const [verbalExp, setVerbalExp] = useState('Is code me hum HashMap populate kar rahe hain to avoid nested loops, isse space complexity O(N) ho jaati hai aur time complexity O(N) rehti hai.');
  const [codeExplainerResult, setCodeExplainerResult] = useState<any>(null);

  // States for Feature 4 (Socratic Tech Debate)
  const [debateTopic, setDebateTopic] = useState('PostgreSQL vs MongoDB for high-throughput transactional e-commerce checkout');
  const [candidateStance, setCandidateStance] = useState('I choose PostgreSQL because e-commerce transactions require strict ACID compliance to prevent double-spending and stock overbooking.');
  const [debateResult, setDebateResult] = useState<any>(null);
  const [debateHistory, setDebateHistory] = useState<Array<{ role: string; content: string }>>([]);

  // States for Resume Probing Arena
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Senior Full Stack Engineer');
  const [resumeStatus, setResumeStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [resumeQuestions, setResumeQuestions] = useState<any>(null);

  // States for GitHub Role-Based Analysis Tab
  const [githubUsername, setGithubUsername] = useState<string>('jaydalvi');
  const [githubRole, setGithubRole] = useState<string>('Senior Backend Engineer');
  const [githubAnalysis, setGithubAnalysis] = useState<any>(null);

  // Auto-play AI response audio when audio_b64 is received
  const playBase64Audio = (audioB64: string | null) => {
    if (!audioB64) return;
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(`data:audio/wav;base64,${audioB64}`);
      audioPlayerRef.current = audio;
      setPlayingAudio(true);
      audio.play();
      audio.onended = () => setPlayingAudio(false);
      audio.onerror = () => setPlayingAudio(false);
    } catch (err) {
      console.warn('Audio playback error:', err);
      setPlayingAudio(false);
    }
  };

  // Auto-load built resume from API on mount
  useEffect(() => {
    async function loadResume() {
      setResumeStatus('loading');
      try {
        const res = await getResumeInfo();
        if (res.data) {
          const formattedText = `
Name: ${res.data.personal_info?.full_name || 'Candidate'}
Summary: ${res.data.personal_info?.summary || ''}
Skills: ${res.data.skills?.map(s => s.name).join(', ') || ''}
Experience: ${res.data.work_experience?.map(w => `${w.job_title} at ${w.company}: ${w.description}`).join(' | ') || ''}
Education: ${res.data.education?.map(e => `${e.degree} in ${e.field_of_study}`).join(' | ') || ''}
          `.trim();
          setResumeText(formattedText);
          setResumeStatus('found');
        } else {
          setResumeStatus('not_found');
        }
      } catch (e) {
        setResumeStatus('not_found');
      }
    }
    loadResume();
  }, []);

  // Transcribe recorded microphone audio blob dynamically via Saaras V3
  const handleTranscribeAudio = async (targetField: 'codeExplainer' | 'techDebate') => {
    if (!audioBlob) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('languageCode', targetLang);

      const res = await fetch('/api/sarvam/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.transcript) {
        if (data.languageCode) setTargetLang(data.languageCode);
        if (targetField === 'codeExplainer') {
          setVerbalExp(data.transcript);
        } else {
          setCandidateStance(data.transcript);
        }
      }
    } catch (e) {
      console.error('Transcription error:', e);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Handler for Feature 3 (Live Code Explainer)
  const handleCodeExplainer = async () => {
    setLoading(true);
    try {
      let res;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('code', codeSnippet);
        formData.append('problemTitle', 'Two Sum');
        formData.append('candidateVerbalExplanation', verbalExp);
        formData.append('languageCode', targetLang);

        res = await fetch('/api/sarvam/live-code-explainer', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/sarvam/live-code-explainer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeSnippet, problemTitle: 'Two Sum', candidateVerbalExplanation: verbalExp, languageCode: targetLang })
        });
      }
      const data = await res.json();
      setCodeExplainerResult(data);
      if (data.transcript) setVerbalExp(data.transcript);
      if (data.detectedLanguage) setTargetLang(data.detectedLanguage);

      if (data.audioHint && data.audioHint.audios) {
        playBase64Audio(data.audioHint.audios[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Handler for Feature 4 (Socratic Tech Debate & Dynamic Follow-Ups)
  const handleTechDebate = async () => {
    setLoading(true);
    try {
      const updatedHistory = [...debateHistory, { role: 'user', content: candidateStance }];
      setDebateHistory(updatedHistory);

      let res;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('topic', debateTopic);
        formData.append('candidateStance', candidateStance);
        formData.append('resumeContext', resumeText);
        formData.append('debateHistory', JSON.stringify(updatedHistory));
        formData.append('languageCode', targetLang);

        res = await fetch('/api/sarvam/tech-debate', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/sarvam/tech-debate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: debateTopic,
            candidateStance,
            resumeContext: resumeText,
            debateHistory: updatedHistory,
            languageCode: targetLang
          })
        });
      }
      const data = await res.json();
      setDebateResult(data);
      if (data.transcript) setCandidateStance(data.transcript);
      if (data.detectedLanguage) setTargetLang(data.detectedLanguage);

      if (data.debateResponse && data.debateResponse.socraticPushback) {
        setDebateHistory([...updatedHistory, { role: 'assistant', content: data.debateResponse.socraticPushback }]);
      }

      if (data.voicePushback && data.voicePushback.audios) {
        playBase64Audio(data.voicePushback.audios[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Handler for Resume Probing Questions
  const handleFetchResumeQuestions = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/resume-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole, languageCode: targetLang })
      });
      const data = await res.json();
      setResumeQuestions(data.result);
      if (data.firstQuestionAudio && data.firstQuestionAudio.audios) {
        playBase64Audio(data.firstQuestionAudio.audios[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for GitHub Role-Based Analysis & Dynamic 3-6 Probing Questions
  const handleGitHubRoleAnalyze = async () => {
    if (!githubUsername) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/github-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername, targetRole: githubRole, languageCode: targetLang })
      });
      const data = await res.json();
      setGithubAnalysis(data.analysis);
      if (data.firstQuestionAudio && data.firstQuestionAudio.audios) {
        playBase64Audio(data.firstQuestionAudio.audios[0]);
      }
    } catch (e) {
      console.error('GitHub role analyze error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Sarvam AI Indic Model Stack
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NitiAI Indic Career & Interview Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real Voice Explainer, Socratic Tech Debate, Resume Probing, and GitHub Role-Based Codebase Audit.
          </p>
        </div>

        {/* Global Language Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-slate-400">Target Language:</span>
          <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-transparent text-sm font-semibold text-indigo-300 focus:outline-none cursor-pointer"
          >
            <option value="hi-IN" className="bg-slate-900 text-white">Hindi (हिंदी)</option>
            <option value="ta-IN" className="bg-slate-900 text-white">Tamil (தமிழ்)</option>
            <option value="te-IN" className="bg-slate-900 text-white">Telugu (తెలుగు)</option>
            <option value="mr-IN" className="bg-slate-900 text-white">Marathi (मराठी)</option>
            <option value="bn-IN" className="bg-slate-900 text-white">Bengali (বাংলা)</option>
            <option value="kn-IN" className="bg-slate-900 text-white">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>
      </div>

      {/* Feature Tabs Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'code-explainer', label: '3. Live Code Explainer', icon: Code2 },
          { id: 'tech-debate', label: '4. Socratic Tech Debate', icon: Brain },
          { id: 'resume-audit', label: 'Resume Probing Arena', icon: FileText },
          { id: 'github-audit', label: 'GitHub Role Audit & Probing', icon: Github },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shared Voice Recorder Widget with Explicit Timer (0s / 25s) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3.5 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>{isRecording ? 'Recording in progress...' : 'Microphone Ready'}</span>
              <span className="font-mono bg-slate-950 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded text-[11px]">
                {duration}s / {maxDuration}s
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isRecording ? 'Recording will auto-stop at 25s' : 'Click mic button whenever you are ready to speak your answer'}
            </div>
          </div>
        </div>

        {/* Real-time Audio Waveform Bar */}
        {isRecording && (
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg">
            <div className="text-xs text-indigo-400 font-mono">Volume:</div>
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-400 h-full transition-all duration-75"
                style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Audio Blob Preview & Transcribe Action */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-medium font-mono">Recorded: {duration}s / {maxDuration}s</span>
            <button
              onClick={() => handleTranscribeAudio(activeTab === 'code-explainer' ? 'codeExplainer' : 'techDebate')}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Transcribe via Saaras V3
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[450px]">
        {/* FEATURE 3: Live Code Explainer */}
        {activeTab === 'code-explainer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-pink-400" /> Feature 3: Indic Live Code Audio Explainer & Real-Time Co-Pilot
                </h2>
                <p className="text-slate-400 text-sm">Record or type your verbal thought process; Sarvam AI verifies reasoning & dictates response in your spoken language.</p>
              </div>
              <span className="text-xs bg-pink-950 text-pink-300 border border-pink-800 px-3 py-1 rounded-full font-mono">Saaras V3 + Bulbul V3</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Code Editor Snippet</label>
                <textarea 
                  rows={6}
                  value={codeSnippet} 
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-pink-300 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Verbal Thought Process (Spoken Audio or Typed)</label>
                <input 
                  type="text" 
                  value={verbalExp} 
                  onChange={(e) => setVerbalExp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleCodeExplainer}
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />} Analyze Reasoning & Dictate Voice Hint
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-pink-400" /> Audio Co-Pilot Verification
                </h3>
                {codeExplainerResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400">Logic Matches Code:</span>
                      <span className="text-emerald-400 font-bold">
                        {codeExplainerResult.evaluation.logicMatchesCode ? 'Verified Alignment' : 'Discrepancy Found'}
                      </span>
                    </div>
                    <div className="p-3 bg-pink-950/40 border border-pink-900/50 rounded-lg text-xs text-pink-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong>AI Spoken Hint (Dictated in {targetLang}):</strong>
                        {playingAudio && <span className="text-xs text-pink-400 animate-pulse flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Playing Spoken Voice...</span>}
                      </div>
                      <p>{codeExplainerResult.evaluation.audioHintText}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Record or enter verbal code reasoning to test Sarvam AI audio explainer.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 4: Socratic Tech Debate & Dynamic Multi-Turn Follow-Ups */}
        {activeTab === 'tech-debate' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" /> Feature 4: Socratic Technical Debate & Dynamic Follow-Ups
                </h2>
                <p className="text-slate-400 text-sm">Principal Architect challenges candidate trade-offs and dictates voice follow-ups in your spoken language.</p>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-mono">Sarvam 105B + Bulbul V3</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Debate Topic / Tech Choice</label>
                <input 
                  type="text" 
                  value={debateTopic} 
                  onChange={(e) => setDebateTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Candidate Stance / Answer (Spoken or Typed)</label>
                <textarea 
                  rows={4}
                  value={candidateStance} 
                  onChange={(e) => setCandidateStance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleTechDebate}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Challenge Stance & Dictate Voice Pushback
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-400" /> Socratic Architect Pushback & Dictation</span>
                  {playingAudio && <span className="text-xs text-emerald-400 animate-pulse flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Dictating Voice ({targetLang})...</span>}
                </h3>
                {debateResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400">Composure & Trade-off Score:</span>
                      <span className="text-emerald-400 font-bold text-sm">{debateResult.debateResponse.architecturalScore}%</span>
                    </div>
                    <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-xs text-emerald-200 space-y-2">
                      <strong>Principal Architect Counter-Question (Dictated in {targetLang}):</strong>
                      <p>{debateResult.debateResponse.socraticPushback}</p>
                    </div>
                    {debateResult.debateResponse.followupQuestion && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-indigo-300">
                        <strong>Dynamic Follow-up Question:</strong> {debateResult.debateResponse.followupQuestion}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Submit your architectural stance to begin multi-turn Socratic debate.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESUME PROBING ARENA */}
        {activeTab === 'resume-audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" /> Resume Probing & Interview Question Generator
                </h2>
                <p className="text-slate-400 text-sm">Generates deep technical probing questions based on your resume claims (e.g. MongoDB vs PostgreSQL, Caching).</p>
              </div>
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-mono">Resume Screening</span>
            </div>

            {/* Resume Source Detection Banner */}
            {resumeStatus === 'not_found' && (
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span className="text-xs text-amber-200">
                    No active resume detected from system. Please paste your resume text below or create one with NitiAI Resume Builder.
                  </span>
                </div>
              </div>
            )}

            {resumeStatus === 'found' && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automatically loaded user's stored resume profile from NitiAI system.</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Target Role Applied For</label>
                <input 
                  type="text" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />

                <label className="text-xs font-medium text-slate-400">Resume Text Content</label>
                <textarea 
                  rows={6}
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste candidate resume text or tech stack here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-200 focus:outline-none"
                />
                <button 
                  onClick={handleFetchResumeQuestions}
                  disabled={loading || !resumeText}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Extract Claims & Generate Dynamic Probing (3-6 Range)
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Award className="w-4 h-4 text-indigo-400" /> Generated Resume Probing Questions</span>
                  {playingAudio && <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Dictating in {targetLang}...</span>}
                </h3>

                {resumeQuestions && resumeQuestions.questions ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400">Role Fit Verdict ({targetRole}):</span>
                      <span className="text-indigo-400 font-bold text-sm">{resumeQuestions.roleFitVerdict || `${resumeQuestions.overallResumeScore}% Match`}</span>
                    </div>

                    <div className="space-y-3">
                      {resumeQuestions.questions.map((q: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-indigo-300 font-semibold">
                            <span>{idx + 1}. {q.topic}</span>
                            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">{q.whyAsked || 'Resume Claim'}</span>
                          </div>
                          <p className="text-slate-200 font-medium">{q.question}</p>
                          <div className="text-[11px] text-slate-400">
                            <strong>Expected Concepts:</strong> {q.expectedConcepts ? q.expectedConcepts.join(', ') : 'Architecture depth'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Generate questions to see personalized probing technical queries extracted from your resume.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GITHUB ROLE-BASED ANALYSIS TAB */}
        {activeTab === 'github-audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Github className="w-5 h-5 text-indigo-400" /> GitHub Repository Role Audit & Probing Arena
                </h2>
                <p className="text-slate-400 text-sm">Analyzes GitHub repos for target role fit and generates dynamic 3–6 probing questions comparing project tools.</p>
              </div>
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-mono">Sarvam 105B + Saaras V3</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">GitHub Username</label>
                <input 
                  type="text" 
                  value={githubUsername} 
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="e.g. jaydalvi"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Target Role Applied For</label>
                <input 
                  type="text" 
                  value={githubRole} 
                  onChange={(e) => setGithubRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleGitHubRoleAnalyze}
                  disabled={loading || !githubUsername}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />} Audit GitHub Repos & Generate Probing Range (3-6)
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> GitHub Role Alignment Report</span>
                  {playingAudio && <span className="text-xs text-purple-400 animate-pulse flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Dictating in {targetLang}...</span>}
                </h3>

                {githubAnalysis ? (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Role Match Score ({githubRole}):</span>
                      <span className="text-emerald-400 font-bold text-sm">{githubAnalysis.roleMatchScore}%</span>
                    </div>

                    <div className="p-3 bg-purple-950/40 border border-purple-900/50 rounded-lg text-purple-200 font-medium">
                      {githubAnalysis.roleFitVerdict}
                    </div>

                    {githubAnalysis.missingRoleSkills && (
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                        <strong>Identified Roadmap Gaps for Role:</strong> {githubAnalysis.missingRoleSkills.join(', ')}
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Role-Tailored Probing Questions ({githubAnalysis.probingQuestions ? githubAnalysis.probingQuestions.length : 0} Questions):</span>
                      {githubAnalysis.probingQuestions && githubAnalysis.probingQuestions.map((q: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-purple-300 font-semibold">
                            <span>{idx + 1}. {q.toolComparison || q.repoName}</span>
                            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">{q.repoName}</span>
                          </div>
                          <p className="text-slate-200 font-medium">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Analyze a GitHub handle to view role compatibility and generated repo questions.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
