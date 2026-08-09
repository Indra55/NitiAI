'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Mic, MicOff, Code2, Brain, FileText, Sparkles, RefreshCw, Volume2, 
  CheckCircle2, AlertCircle, Play, Pause, Upload, MessageSquare, Award, ArrowRight,
  GitBranch, Github, Layers, Target, ShieldCheck, Lock, Rocket, BookOpen, Compass, Search, Link2
} from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { getResumeInfo } from '@/lib/api';

export default function SarvamIndicStudio() {
  const [activeTab, setActiveTab] = useState<string>('github-audit');
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

  // States for GitHub Role-Based Analysis & Roadmap Studio (2-Tier Hybrid Engine)
  const [githubInput, setGithubInput] = useState<string>('https://github.com/Indra55');
  const [githubUsername, setGithubUsername] = useState<string>('Indra55');
  const [githubRole, setGithubRole] = useState<string>('Senior Backend & Systems Engineer');
  const [githubOAuthConnected, setGithubOAuthConnected] = useState<boolean>(false);
  const [githubAnalysis, setGithubAnalysis] = useState<any>(null);
  const [selectedGithubQuestion, setSelectedGithubQuestion] = useState<any>(null);
  const [githubCandidateAnswer, setGithubCandidateAnswer] = useState<string>('');
  const [githubEvaluationResult, setGithubEvaluationResult] = useState<any>(null);

  // Parse GitHub Username helper
  const parseUsername = (input: string): string => {
    if (!input) return '';
    let trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) return parts[0];
      } catch (e) {
        const match = trimmed.match(/github\.com\/([^\/]+)/i);
        if (match) return match[1];
      }
    }
    return trimmed.replace(/^@/, '');
  };

  // Check URL query parameters for GitHub OAuth callback status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('username');
      if (userParam) {
        const parsed = parseUsername(userParam);
        setGithubUsername(parsed);
        setGithubInput(`https://github.com/${parsed}`);
      }
      if (urlParams.get('githubConnected') === 'true') {
        setGithubOAuthConnected(true);
        setActiveTab('github-audit');
      }
    }
  }, []);

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
            Title: ${res.data.jobTitle || 'Engineer'}
            Summary: ${res.data.summary || ''}
            Skills: ${res.data.skills?.join(', ') || ''}
            Experience: ${res.data.experiences?.map((e: any) => `${e.title} at ${e.company}: ${e.description}`).join('; ') || ''}
            Projects: ${res.data.projects?.map((p: any) => `${p.title}: ${p.description}`).join('; ') || ''}
          `;
          setResumeText(formattedText);
          setResumeStatus('found');
        } else {
          setResumeStatus('not_found');
        }
      } catch (err) {
        setResumeStatus('not_found');
      }
    }
    loadResume();
  }, []);

  // Handlers for Feature 3 (Live Code Explainer)
  const handleCodeExplainer = async () => {
    setLoading(true);
    try {
      let bodyData;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('codeSnippet', codeSnippet);
        formData.append('targetLang', targetLang);
        bodyData = formData;
      } else {
        bodyData = JSON.stringify({
          codeSnippet,
          verbalExplanation: verbalExp,
          targetLang
        });
      }

      const res = await fetch('/api/sarvam/live-code-explainer', {
        method: 'POST',
        headers: audioBlob ? {} : { 'Content-Type': 'application/json' },
        body: bodyData
      });
      const data = await res.json();
      if (data.success) {
        setCodeExplainerResult(data);
        if (data.audio_b64) playBase64Audio(data.audio_b64);
      }
    } catch (err) {
      console.error('Code explainer error:', err);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Handlers for Feature 4 (Socratic Tech Debate)
  const handleTechDebate = async () => {
    setLoading(true);
    try {
      let bodyData;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('debateTopic', debateTopic);
        formData.append('targetLang', targetLang);
        formData.append('debateHistory', JSON.stringify(debateHistory));
        bodyData = formData;
      } else {
        bodyData = JSON.stringify({
          debateTopic,
          candidateStance,
          targetLang,
          debateHistory
        });
      }

      const res = await fetch('/api/sarvam/tech-debate', {
        method: 'POST',
        headers: audioBlob ? {} : { 'Content-Type': 'application/json' },
        body: bodyData
      });
      const data = await res.json();
      if (data.success) {
        setDebateResult(data);
        if (data.audio_b64) playBase64Audio(data.audio_b64);

        const newHistory = [
          ...debateHistory,
          { role: 'user', content: candidateStance },
          { role: 'assistant', content: data.debateResponse.socraticPushback }
        ];
        setDebateHistory(newHistory);
      }
    } catch (err) {
      console.error('Tech debate error:', err);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Handlers for Resume Probing Arena
  const handleGenerateResumeQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/resume-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole
        })
      });
      const data = await res.json();
      if (data.success) {
        setResumeQuestions(data);
      }
    } catch (err) {
      console.error('Resume questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for GitHub Role Audit & Roadmap Studio
  const handleGitHubRoleAnalyze = async () => {
    const userToScan = parseUsername(githubInput) || githubUsername;
    if (!userToScan) return;
    setGithubUsername(userToScan);
    setLoading(true);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: userToScan,
          targetRole: githubRole,
          languageCode: targetLang
        })
      });
      const data = await res.json();
      if (data.success) {
        setGithubAnalysis(data.analysis);
        if (data.analysis.probingQuestions && data.analysis.probingQuestions.length > 0) {
          setSelectedGithubQuestion(data.analysis.probingQuestions[0]);
        }
      }
    } catch (err) {
      console.error('GitHub analyze error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateGithubAnswer = async () => {
    if (!selectedGithubQuestion) return;
    setLoading(true);
    try {
      let res;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('question', selectedGithubQuestion.question);
        formData.append('candidateAnswer', githubCandidateAnswer);
        formData.append('repoName', selectedGithubQuestion.repoName);
        formData.append('targetRole', githubRole);
        formData.append('languageCode', targetLang);
        res = await fetch('/api/github/evaluate-answer', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/github/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: selectedGithubQuestion.question,
            candidateAnswer: githubCandidateAnswer,
            repoName: selectedGithubQuestion.repoName,
            targetRole: githubRole,
            languageCode: targetLang
          })
        });
      }
      const data = await res.json();
      if (data.success) {
        setGithubEvaluationResult(data.evaluation);
        if (data.transcript) setGithubCandidateAnswer(data.transcript);
      }
    } catch (err) {
      console.error('Evaluate answer error:', err);
    } finally {
      setLoading(false);
      resetRecording();
    }
  };

  // Transfer GitHub question to Tech Debate Arena
  const transferQuestionToDebate = (q: any) => {
    setDebateTopic(`Architectural Trade-off: ${q.toolComparison || q.repoName}`);
    setCandidateStance(`In my project ${q.repoName}, I chose this architecture because of trade-offs in throughput, latency, and system scalability.`);
    setActiveTab('tech-debate');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-100">
      {/* Indic Language Selector Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-950 border border-indigo-800 rounded-xl flex items-center justify-center text-indigo-400 font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Sarvam Indic Multilingual AI Co-Pilot</span>
              <span className="bg-indigo-950 border border-indigo-800 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-mono">10 Indic Languages Supported</span>
            </div>
            <p className="text-xs text-slate-400">Speech-to-Text &amp; Voice Dictation running via Sarvam AI API (Saaras V3 + Bulbul V3)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-400 whitespace-nowrap">Voice Dictation Language:</label>
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-medium focus:outline-none"
          >
            <option value="hi-IN">Hindi (हिंदी)</option>
            <option value="bn-IN">Bengali (বাংলা)</option>
            <option value="ta-IN">Tamil (தமிழ்)</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
            <option value="kn-IN">Kannada (কন্নড)</option>
            <option value="mr-IN">Marathi (मराठी)</option>
            <option value="gu-IN">Gujarati (ગુજરાતી)</option>
            <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
            <option value="ml-IN">Malayalam (മലയാളം)</option>
            <option value="en-IN">English (India)</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('github-audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'github-audit'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Github className="w-4 h-4" /> GitHub 2-Tier Graph &amp; Learning Roadmap
        </button>

        <button
          onClick={() => setActiveTab('code-explainer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'code-explainer'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" /> Indic Live Code Audio Explainer
        </button>

        <button
          onClick={() => setActiveTab('tech-debate')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'tech-debate'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" /> Socratic Tech Debate Arena
        </button>

        <button
          onClick={() => setActiveTab('resume-audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'resume-audit'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Resume Probing Arena
        </button>
      </div>

      {/* Global Voice Recorder Control Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isRecording ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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

        {/* Audio Blob Preview */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-medium font-mono">Recorded Audio Ready: {duration}s</span>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[450px]">
        {/* TAB 4: GITHUB 2-TIER GRAPH & LEARNING ROADMAP */}
        {activeTab === 'github-audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Github className="w-5 h-5 text-purple-400" /> GitHub Repository Analysis &amp; Learning Roadmap Studio
                </h2>
                <p className="text-slate-400 text-sm">2-Tier Hybrid Indexing (In-Memory Inverted Index + Neon PostgreSQL Graph) for 100% Public &amp; Private Repo Analysis.</p>
              </div>
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-mono">2-Tier Hybrid Engine</span>
            </div>

            {/* Input Form Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Candidate GitHub Profile URL or Handle:</label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={githubInput} 
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="e.g. https://github.com/Indra55 or SujalChoudhari"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Role Title Applied For:</label>
                  <input 
                    type="text" 
                    value={githubRole} 
                    onChange={(e) => setGithubRole(e.target.value)}
                    placeholder="e.g. Senior Backend & Systems Engineer"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button 
                  onClick={handleGitHubRoleAnalyze}
                  disabled={loading || !githubInput.trim()}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Run 2-Tier Scan &amp; Generate Roadmap Learnings
                </button>

                <a
                  href={`/api/github/auth/login?username=${encodeURIComponent(parseUsername(githubInput) || 'Indra55')}`}
                  className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5 bg-purple-950/80 border border-purple-800 px-4 py-2.5 rounded-xl font-medium transition-all"
                >
                  <Lock className="w-3.5 h-3.5" /> Connect OAuth for Private Repos
                </a>
              </div>
            </div>

            {/* Analysis & Roadmap Display */}
            {githubAnalysis ? (
              <div className="space-y-6">
                {/* Metrics Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950 border border-emerald-900/60 rounded-xl space-y-1">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Role Match Score</span>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">{githubAnalysis.roleMatchScore}%</div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-purple-900/60 rounded-xl space-y-1">
                    <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Indexed Repositories</span>
                    <div className="text-sm font-semibold text-purple-200 mt-1">{githubAnalysis.roleFitVerdict}</div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-indigo-900/60 rounded-xl space-y-1">
                    <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Roadmap Advice Gaps</span>
                    <div className="text-xs font-mono text-amber-300 mt-1">{githubAnalysis.missingRoleSkills?.join(', ')}</div>
                  </div>
                </div>

                {/* PERSONALIZED LEARNING ROADMAP ADVOCACY CARD */}
                <div className="p-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950 border border-purple-900/60 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-400" /> Personalized Interactive Roadmap Advice for @{githubUsername}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-indigo-400 font-semibold block">1. Recommended Technical Expansion:</span>
                      <p className="text-slate-300">Focus on system-level streaming (Kafka / RabbitMQ) to complement your existing Node.js &amp; Python services.</p>
                    </div>
                    <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-purple-400 font-semibold block">2. System Architecture Trade-off Practice:</span>
                      <p className="text-slate-300">Practice justifying relational (PostgreSQL) vs document (MongoDB) storage trade-offs in real-time interviews.</p>
                    </div>
                  </div>
                </div>

                {/* Questions & Live Spoken Evaluator */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-200">
                      Generated Repository Probing Questions ({githubAnalysis.probingQuestions?.length || 0} Questions)
                    </h3>
                    <div className="space-y-3">
                      {githubAnalysis.probingQuestions && githubAnalysis.probingQuestions.map((q: any, idx: number) => {
                        const isSelected = selectedGithubQuestion?.id === q.id;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedGithubQuestion(q)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                              isSelected 
                                ? 'bg-purple-950/50 border-purple-500 shadow-md' 
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                              <span>Q{idx + 1}. {q.toolComparison || q.repoName}</span>
                              <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded font-mono">{q.repoName}</span>
                            </div>
                            <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.question}</p>
                            
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400">Click card to select for voice answer</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  transferQuestionToDebate(q);
                                }}
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-950 border border-emerald-800 px-2 py-1 rounded-lg"
                              >
                                <Brain className="w-3 h-3" /> Challenge in Tech Debate
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Question Spoken Answer Evaluator */}
                  <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" /> Test Spoken / Typed Answer to Repo Question
                    </h3>

                    {selectedGithubQuestion ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                          <span className="text-purple-400 font-semibold block">Question ({selectedGithubQuestion.repoName}):</span>
                          <p className="text-slate-200">{selectedGithubQuestion.question}</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-400 block">Candidate Spoken or Typed Answer:</label>
                          <textarea 
                            rows={4}
                            value={githubCandidateAnswer}
                            onChange={(e) => setGithubCandidateAnswer(e.target.value)}
                            placeholder="Speak using microphone button above or type your architectural trade-off justification..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={handleEvaluateGithubAnswer}
                          disabled={loading || !githubCandidateAnswer}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />} Evaluate Answer Depth &amp; Dictate Indic Voice Response
                        </button>

                        {githubEvaluationResult && (
                          <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-indigo-300">
                              <span>Candidate Technical Depth Score:</span>
                              <span className="text-emerald-400 font-bold text-sm">{githubEvaluationResult.technicalScore}%</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{githubEvaluationResult.logicFeedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Select a question card on the left to evaluate candidate answers.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-950 border border-slate-800 rounded-2xl">
                Enter a GitHub profile link or handle above and click "Run 2-Tier Scan" to analyze repositories and generate roadmap advices.
              </div>
            )}
          </div>
        )}

        {/* FEATURE 3: Live Code Explainer */}
        {activeTab === 'code-explainer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-pink-400" /> Feature 3: Indic Live Code Audio Explainer &amp; Real-Time Co-Pilot
                </h2>
                <p className="text-slate-400 text-sm">Record or type your verbal thought process; Sarvam AI verifies reasoning &amp; dictates response in your spoken language.</p>
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
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />} Analyze Reasoning &amp; Dictate Voice Hint
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
                  <Brain className="w-5 h-5 text-emerald-400" /> Feature 4: Socratic Technical Debate &amp; Dynamic Follow-Ups
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
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Challenge Stance &amp; Dictate Voice Pushback
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-400" /> Socratic Architect Pushback &amp; Dictation</span>
                  {playingAudio && <span className="text-xs text-emerald-400 animate-pulse flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" /> Dictating Voice ({targetLang})...</span>}
                </h3>
                {debateResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400">Composure &amp; Trade-off Score:</span>
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
                  <FileText className="w-5 h-5 text-indigo-400" /> Resume Probing &amp; Interview Question Generator
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Target Role Title Applied For</label>
                <input 
                  type="text" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Resume Plain Text Content</label>
                <textarea 
                  rows={8}
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste candidate resume text or experience bullet points..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleGenerateResumeQuestions}
                  disabled={loading || !resumeText}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Extract Technical Probing Questions
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Resume-Grounded Interview Questions
                </h3>
                {resumeQuestions ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-lg text-indigo-200 font-medium">
                      {resumeQuestions.verdict}
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
      </div>
    </div>
  );
}
