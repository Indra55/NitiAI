'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Github, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, Layers, Target, 
  Code2, Database, Cpu, ArrowRight, Lock, ExternalLink, Award, Volume2, Mic, MicOff, LogOut,
  AlertCircle, Play, Check, FolderGit2, Globe, Search, Link2, LogIn, UserCheck, Compass, BookOpen, User, Rocket
} from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

export default function GitHubDemoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [githubInput, setGithubInput] = useState<string>('');
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Senior Backend & Systems Engineer');
  
  // Authorization & Profile States
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [publicRepoCount, setPublicRepoCount] = useState<number>(0);

  // Scanning & Analysis States
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [roadmapAdvices, setRoadmapAdvices] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Answer Evaluation States
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Voice Recorder Hook (Sarvam STT)
  const {
    isRecording,
    duration,
    maxDuration,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording
  } = useVoiceRecorder();

  // Parse GitHub Username from full URL or text input
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

  // On Mount: Read URL Query Parameters (from GitHub OAuth or Email Signup)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('username') || 'Indra55';
      const nameParam = urlParams.get('name') || '';
      const emailParam = urlParams.get('email') || '';
      const avatarParam = urlParams.get('avatar') || '';

      const parsed = parseUsername(userParam);
      setActiveUsername(parsed);
      setGithubInput(`https://github.com/${parsed}`);
      if (nameParam) setDisplayName(nameParam);
      if (emailParam) setUserEmail(emailParam);
      if (avatarParam) setUserAvatar(avatarParam);

      checkAuthStatus(parsed);
      fetchUserRoadmap(parsed);
    }
  }, []);

  const checkAuthStatus = async (userToCheck: string) => {
    if (!userToCheck) return;
    setCheckingAuth(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/github/check-status?username=${encodeURIComponent(userToCheck)}`);
      const data = await res.json();
      if (data.success) {
        setTokenExists(Boolean(data.tokenExists));
        setTokenExpired(Boolean(data.tokenExpired));
        setIsAuthorized(Boolean(data.isAuthorized));
        if (data.profile) {
          setProfile(data.profile);
          if (!displayName && data.profile.name) setDisplayName(data.profile.name);
          if (!userAvatar && data.profile.avatar_url) setUserAvatar(data.profile.avatar_url);
        }
        if (data.publicRepoCount) setPublicRepoCount(data.publicRepoCount);
        
        if (data.hasStoredScan) {
          await fetchStoredScan(userToCheck);
        } else {
          runScanAndAnalyze(userToCheck);
        }
      }
    } catch (e) {
      console.error('Check status error:', e);
      setIsAuthorized(false);
      setTokenExists(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchUserRoadmap = async (userToFetch: string) => {
    try {
      const res = await fetch(`/api/github/user-roadmap?username=${encodeURIComponent(userToFetch)}&targetRole=${encodeURIComponent(targetRole)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.roadmapAdvices) {
          setRoadmapAdvices(data.roadmapAdvices);
        }
      }
    } catch (e) {
      console.error('Fetch user roadmap error:', e);
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseUsername(githubInput);
    if (!parsed) {
      setErrorMsg('Please enter a valid GitHub profile URL or username.');
      return;
    }
    setActiveUsername(parsed);
    setScanResult(null);
    checkAuthStatus(parsed);
    fetchUserRoadmap(parsed);
  };

  const fetchStoredScan = async (userToFetch: string) => {
    try {
      const res = await fetch(`/api/github/scan-results?username=${encodeURIComponent(userToFetch)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.scanResult) {
          setScanResult(data.scanResult);
          if (data.scanResult.analysis && data.scanResult.analysis.probingQuestions && data.scanResult.analysis.probingQuestions.length > 0) {
            setSelectedQuestion(data.scanResult.analysis.probingQuestions[0]);
          }
        }
      }
    } catch (e) {
      console.error('Fetch stored scan error:', e);
    }
  };

  const handleAuthorize = () => {
    const userToAuth = activeUsername || parseUsername(githubInput);
    if (!userToAuth) {
      setErrorMsg('Please enter a GitHub profile link or username first.');
      return;
    }
    window.location.href = `http://localhost:5000/api/github/auth/login?username=${encodeURIComponent(userToAuth)}`;
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      if (activeUsername) {
        await fetch('/api/github/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: activeUsername })
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setGithubInput('');
      setActiveUsername('');
      setDisplayName('');
      setUserEmail('');
      setUserAvatar('');
      setIsAuthorized(false);
      setTokenExists(false);
      setTokenExpired(false);
      setScanResult(null);
      setProfile(null);
      setErrorMsg(null);
      setLoading(false);
      
      // Clean redirect to Auth (Signup / Login) page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  };

  const runScanAndAnalyze = async (userToScanOverride?: string) => {
    const targetUser = userToScanOverride || activeUsername || parseUsername(githubInput);
    if (!targetUser) {
      setErrorMsg('Please enter a GitHub profile link or username first.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername: targetUser, targetRole })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Scan Error Server Response:', errText);
        setErrorMsg(`Server returned ${res.status}: Failed to reach API backend.`);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setScanResult(data);
        if (data.analysis && data.analysis.probingQuestions && data.analysis.probingQuestions.length > 0) {
          setSelectedQuestion(data.analysis.probingQuestions[0]);
        }
      } else {
        setErrorMsg(data.error || 'Failed to complete repository analysis.');
      }
    } catch (e: any) {
      console.error('Scan error:', e);
      setErrorMsg(e.message || 'Network error connecting to analysis service.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion) return;
    setEvaluating(true);
    try {
      let res;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('question', selectedQuestion.question);
        formData.append('candidateAnswer', candidateAnswer);
        formData.append('repoName', selectedQuestion.repoName);
        formData.append('targetRole', targetRole);

        res = await fetch('/api/github/evaluate-answer', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/github/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: selectedQuestion.question,
            candidateAnswer,
            repoName: selectedQuestion.repoName,
            targetRole
          })
        });
      }
      if (!res.ok) return;
      const data = await res.json();
      setEvaluationResult(data.evaluation);
      if (data.transcript) setCandidateAnswer(data.transcript);
    } catch (e) {
      console.error('Evaluate error:', e);
    } finally {
      setEvaluating(false);
      resetRecording();
    }
  };

  // Compute live actual counts from scanResult
  const reposList = scanResult?.repos || [];
  const actualTotalCount = reposList.length > 0 ? reposList.length : (scanResult?.reposCount || 65);
  const actualPrivateCount = reposList.length > 0 
    ? reposList.filter((r: any) => r.private).length 
    : (scanResult?.privateReposCount || 0);
  const actualPublicCount = reposList.length > 0 
    ? reposList.filter((r: any) => !r.private).length 
    : (scanResult?.publicReposCount || actualTotalCount - actualPrivateCount);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-purple-400 font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading GitHub Production Studio...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/nitiai.png" alt="Niti AI" width={48} height={48} className="rounded-xl shadow-lg" />
          <div>
            <div className="text-base font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NitiAI Career Studio
            </div>
            <div className="text-[10px] text-slate-400">GitHub 2-Tier Relational Graph &amp; Skill Roadmap</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {activeUsername && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
              {userAvatar ? (
                <img src={userAvatar} alt={activeUsername} className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-indigo-400" />
              )}
              <span className="font-bold text-slate-200">{displayName || `@${activeUsername}`}</span>
              <span className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded">
                @{activeUsername}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Log out and return to sign up / login page"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" /> Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto space-y-8 mt-6">
        {/* PROFILE PRE-SEEDED BANNER */}
        <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-900/60 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-950 border border-purple-800 rounded-2xl flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
              <Github className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Candidate Profile Pre-Seeded</span>
                {tokenExists ? (
                  <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> OAuth Authorized (Public + Private Repos)
                  </span>
                ) : (
                  <span className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                    🌐 Public Repositories Mode Active ({publicRepoCount || 65} Repos)
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {displayName ? `${displayName} (@${activeUsername})` : `@${activeUsername}`}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                NitiAI has indexed candidate repositories into Tier 1 In-Memory Inverted Index &amp; Tier 2 Neon PostgreSQL Graph.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!tokenExists && (
              <button
                onClick={handleAuthorize}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" /> Authorize OAuth for Private Repos
              </button>
            )}

            <button
              onClick={() => runScanAndAnalyze()}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Re-Scan Repositories
            </button>
          </div>
        </div>

        {/* STEP 1: CANDIDATE GITHUB LINK / USERNAME EDIT CARD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-950 border border-indigo-800 rounded-full flex items-center justify-center text-indigo-400">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Candidate Profile &amp; GitHub Handle</h2>
                <p className="text-xs text-slate-400">Update candidate link to verify account status in database.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLinkSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="e.g. https://github.com/Indra55 or SujalChoudhari"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={checkingAuth || !githubInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {checkingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Check Account Status
            </button>
          </form>
        </div>

        {/* Error Message Box */}
        {errorMsg && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between max-w-3xl mx-auto">
            <span>{errorMsg}</span>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-200 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MAIN RESULTS DISPLAY */}
        <div className="space-y-6">
          {/* Target Role Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Target Role Title:</span>
            </div>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend & Systems Engineer"
              className="flex-1 max-w-md bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-indigo-300 font-medium focus:outline-none"
            />
            <button
              onClick={() => runScanAndAnalyze()}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Re-Analyze Role Fit
            </button>
          </div>

          {/* Live Loading State */}
          {loading && (
            <div className="p-12 bg-slate-900/90 border border-purple-900/60 rounded-2xl text-center space-y-4 shadow-2xl">
              <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-100">Scanning &amp; Indexing All Repositories...</h3>
                <p className="text-xs text-slate-400">Fetching repositories for @{activeUsername} into Tier 1 In-Memory Hash Map &amp; Tier 2 Neon PostgreSQL Graph.</p>
              </div>
            </div>
          )}

          {/* ACTUAL LIVE SCAN REPOSITORIES COUNT METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Repos Scanned</span>
                <span className="text-3xl font-extrabold text-indigo-400 font-mono mt-1 block">
                  {actualTotalCount}
                </span>
              </div>
              <div className="w-12 h-12 bg-indigo-950/80 border border-indigo-800 rounded-xl flex items-center justify-center text-indigo-400">
                <FolderGit2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-950 border border-purple-900/60 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Private Repositories</span>
                <span className="text-3xl font-extrabold text-purple-400 font-mono mt-1 block">
                  {actualPrivateCount}
                </span>
              </div>
              <div className="w-12 h-12 bg-purple-950/80 border border-purple-800 rounded-xl flex items-center justify-center text-purple-400">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Public Repositories</span>
                <span className="text-3xl font-extrabold text-cyan-400 font-mono mt-1 block">
                  {actualPublicCount}
                </span>
              </div>
              <div className="w-12 h-12 bg-cyan-950/80 border border-cyan-800 rounded-xl flex items-center justify-center text-cyan-400">
                <Globe className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* PERSONALIZED LEARNING ROADMAP ADVOCACY CARDS */}
          <div className="p-6 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950 border border-purple-900/60 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-400" /> Personalized Interactive Roadmap Advice for @{activeUsername}
              </h3>
              <span className="text-xs bg-purple-950 border border-purple-800 text-purple-300 px-3 py-1 rounded-full font-mono font-semibold">
                Target: {targetRole}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {roadmapAdvices.map((card: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 font-mono">
                      {card.step}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{card.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Probing Questions & Spoken Answer Tester */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" /> Repository-Grounded Mock Interview Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Probing questions derived directly from @{activeUsername}'s scanned repository portfolio.
                </p>
              </div>
              <span className="text-xs bg-indigo-950 border border-indigo-800 text-indigo-300 px-3 py-1 rounded-full font-mono">
                Sarvam AI Voice (Saaras V3 STT)
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select Question Card ({scanResult?.analysis?.probingQuestions?.length || 7} Questions):
                </h4>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {scanResult?.analysis?.probingQuestions && scanResult.analysis.probingQuestions.map((q: any, idx: number) => {
                    const isSelected = selectedQuestion?.id === q.id;
                    return (
                      <div 
                        key={idx}
                        onClick={() => setSelectedQuestion(q)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-purple-950/50 border-purple-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                          <span>Q{idx + 1}. {q.toolComparison || 'Repo Probing'}</span>
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{q.repoName}</span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.question}</p>
                        <div className="text-[11px] text-slate-400">
                          <strong>Expected Concepts:</strong> {q.expectedConcepts ? q.expectedConcepts.join(', ') : 'Architecture depth'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Answer Evaluation Box */}
              <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" /> Test Candidate Spoken / Typed Answer
                </h4>

                {selectedQuestion ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                      <span className="text-indigo-400 font-semibold block">Active Question ({selectedQuestion.repoName}):</span>
                      <p className="text-slate-200">{selectedQuestion.question}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-400">Candidate Spoken / Typed Answer</label>
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          {isRecording ? `${duration}s Stop` : 'Record Mic'}
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        value={candidateAnswer}
                        onChange={(e) => setCandidateAnswer(e.target.value)}
                        placeholder="Speak using mic button above or type your architectural trade-off justification..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={evaluating || !candidateAnswer}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Evaluate Technical Depth Score
                    </button>

                    {evaluationResult && (
                      <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-indigo-300">
                          <span>Technical Depth Score:</span>
                          <span className="text-emerald-400 font-bold text-sm">{evaluationResult.technicalScore}%</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{evaluationResult.logicFeedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Select a question card on the left to evaluate candidate answers.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
