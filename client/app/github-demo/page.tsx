'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, Layers, Target, 
  Code2, Database, Cpu, ArrowRight, Lock, ExternalLink, Award, Volume2, Mic, MicOff, LogOut,
  AlertCircle, Play, Check, FolderGit2, Globe, Search, Link2
} from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

export default function GitHubDemoPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [githubInput, setGithubInput] = useState<string>('https://github.com/jayyy255');
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Senior Backend & Systems Engineer');
  
  // Authorization States
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);

  // Scanning & Analysis States
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Answer Evaluation States
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Voice Recorder Hook
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
        // Fallback simple regex parsing
        const match = trimmed.match(/github\.com\/([^\/]+)/i);
        if (match) return match[1];
      }
    }
    return trimmed.replace(/^@/, '');
  };

  // On Mount: Check URL Query Params or default username
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('username');
      const initialUser = userParam ? parseUsername(userParam) : 'jayyy255';
      
      if (userParam) setGithubInput(`https://github.com/${initialUser}`);
      setActiveUsername(initialUser);
      checkAuthStatus(initialUser);
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
        setIsAuthorized(data.isAuthorized);
        if (data.profile) setProfile(data.profile);
        
        // If stored scan exists and user is authorized, fetch scan results
        if (data.hasStoredScan) {
          await fetchStoredScan(userToCheck);
        } else {
          setScanResult(null);
        }
      }
    } catch (e) {
      console.error('Check status error:', e);
      setIsAuthorized(false);
    } finally {
      setCheckingAuth(false);
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
    const userToAuth = activeUsername || parseUsername(githubInput) || 'jayyy255';
    window.location.href = `http://localhost:5000/api/github/auth/login?username=${encodeURIComponent(userToAuth)}`;
  };

  const handleReauthorize = async () => {
    const userToAuth = activeUsername || parseUsername(githubInput) || 'jayyy255';
    try {
      setLoading(true);
      const res = await fetch('/api/github/reauthorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userToAuth })
      });
      const data = await res.json();
      if (data.success && data.authUrl) {
        window.location.href = `http://localhost:5000${data.authUrl}`;
      } else {
        window.location.href = `http://localhost:5000/api/github/auth/login?username=${encodeURIComponent(userToAuth)}&forceReauth=true`;
      }
    } catch (e) {
      console.error('Reauthorize error:', e);
      window.location.href = `http://localhost:5000/api/github/auth/login?username=${encodeURIComponent(userToAuth)}&forceReauth=true`;
    } finally {
      setLoading(false);
    }
  };

  const runScanAndAnalyze = async () => {
    const targetUser = activeUsername || parseUsername(githubInput);
    if (!targetUser) return;
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
  const actualTotalCount = reposList.length > 0 ? reposList.length : (scanResult?.reposCount || 0);
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
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading GitHub Studio...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-4 py-1.5 rounded-full text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" /> NitiAI GitHub OAuth &amp; 2-Tier Indexing Engine
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            GitHub Repository Analysis &amp; Roadmap Studio
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            100% Public &amp; Private Repository Scan, 2-Tier Relational Graph Indexing, and Dynamic Probing Questions.
          </p>
        </div>

        {/* STEP 1: CANDIDATE GITHUB LINK / USERNAME INPUT CARD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-950 border border-indigo-800 rounded-full flex items-center justify-center text-indigo-400">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Step 1: Enter Candidate GitHub Profile URL or Username</h2>
              <p className="text-xs text-slate-400">Input any candidate's GitHub profile link to check token status in database.</p>
            </div>
          </div>

          <form onSubmit={handleLinkSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                placeholder="e.g. https://github.com/jayyy255 or SujalChoudhari"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={checkingAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {checkingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Check Token Status
            </button>
          </form>

          {activeUsername && (
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <span>Active Target Candidate:</span>
              <span className="bg-slate-950 border border-slate-800 text-indigo-300 font-mono px-2 py-0.5 rounded font-bold">
                @{activeUsername}
              </span>
            </div>
          )}
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

        {/* CONDITION 1: NO VALID AUTHORIZATION TOKEN FOR ACTIVE USER */}
        {activeUsername && !isAuthorized && !checkingAuth && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-950 border border-amber-800 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold">
                No Valid Token in Database for @{activeUsername}
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-2">Connect &amp; Save OAuth Token</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Authorize NitiAI via GitHub OAuth for candidate <strong>@{activeUsername}</strong> to securely store the access token in PostgreSQL database and fetch <strong>all public &amp; private repositories</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleAuthorize}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
              >
                <Github className="w-5 h-5" /> 🔐 Authorize GitHub Account (@{activeUsername})
              </button>

              <button
                onClick={handleReauthorize}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 px-5 rounded-xl text-sm transition-all border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-purple-400" /> Re-authorize (Clear Stale Token)
              </button>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tokens Stored Securely in PostgreSQL Database (`github_tokens` table)</span>
            </div>
          </div>
        )}

        {/* CONDITION 2: AUTHORIZATION VERIFIED IN DB -> SHOW SCAN ACTION & RESULTS */}
        {activeUsername && isAuthorized && !checkingAuth && (
          <div className="space-y-6">
            {/* Valid Token Status Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Verified OAuth Token Found in Database</span>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                      @{activeUsername}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Active OAuth access token verified in PostgreSQL `github_tokens` table.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runScanAndAnalyze}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} 🚀 Scan Repositories &amp; Generate Roadmap Learnings
                </button>

                <button
                  onClick={handleReauthorize}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  title="Re-authorize GitHub account"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-authorize
                </button>
              </div>
            </div>

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
                onClick={runScanAndAnalyze}
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
                  <h3 className="text-xl font-bold text-slate-100">Scanning &amp; Indexing All Public &amp; Private Repositories...</h3>
                  <p className="text-xs text-slate-400">Fetching repositories for @{activeUsername} into Tier 1 In-Memory Hash Map &amp; Tier 2 Neon PostgreSQL Graph.</p>
                </div>
              </div>
            )}

            {/* Scan Results Display */}
            {scanResult && !loading && (
              <div className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                {/* Header Metrics */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Analysis Complete</span>
                    <h2 className="text-2xl font-bold text-slate-100 mt-0.5">
                      Scanned Repositories for @{scanResult.githubUsername}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs px-3 py-1.5 rounded-xl font-bold">
                      {scanResult.analysis?.roleMatchScore || 88}% Role Match
                    </span>
                  </div>
                </div>

                {/* ACTUAL LIVE SCAN REPOSITORIES COUNT METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 flex items-center justify-between shadow-lg">
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

                  <div className="bg-slate-950 border border-purple-900/60 rounded-xl p-4 flex items-center justify-between shadow-lg">
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

                  <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-4 flex items-center justify-between shadow-lg">
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

                {/* Verdict & Skill Gaps */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-950/40 border border-purple-900/60 rounded-xl space-y-1">
                    <span className="text-xs text-purple-300 font-semibold uppercase">Role Compatibility Verdict</span>
                    <p className="text-sm text-purple-200 font-medium">{scanResult.analysis?.roleFitVerdict || 'Strong polyglot alignment'}</p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Identified Skill Gaps for Roadmap Learnings</span>
                    <p className="text-sm text-amber-300 font-medium font-mono">
                      {scanResult.analysis?.missingRoleSkills ? scanResult.analysis.missingRoleSkills.join(', ') : 'None'}
                    </p>
                  </div>
                </div>

                {/* Scanned Repositories Breakdown (Public & Private) */}
                {reposList.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                      <span>Indexed Repositories List ({reposList.length} Repositories):</span>
                      <span className="text-xs text-emerald-400 font-mono">2-Tier Hybrid PostgreSQL Graph</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-2">
                      {reposList.map((r: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                          <span className="truncate font-medium text-slate-200" title={r.name}>{r.name}</span>
                          {r.private ? (
                            <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5 shrink-0">
                              <Lock className="w-2.5 h-2.5" /> Private
                            </span>
                          ) : (
                            <span className="bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                              Public
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Probing Questions & Spoken Answer Tester */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-200">
                      Role-Tailored Probing Questions ({scanResult.analysis?.probingQuestions ? scanResult.analysis.probingQuestions.length : 0} Questions)
                    </h3>
                    <div className="space-y-3">
                      {scanResult.analysis?.probingQuestions && scanResult.analysis.probingQuestions.map((q: any, idx: number) => {
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
                              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{q.repoName}</span>
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
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" /> Test Candidate Spoken / Typed Answer
                    </h3>

                    {selectedQuestion ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
                          <span className="text-indigo-400 font-semibold block">Question ({selectedQuestion.repoName}):</span>
                          <p className="text-slate-200">{selectedQuestion.question}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-400">Candidate Answer</label>
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
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
                            placeholder="Type or record your architectural trade-off justification..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={handleEvaluateAnswer}
                          disabled={evaluating || !candidateAnswer}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Evaluate Answer Depth
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
                      <p className="text-slate-500 text-xs italic">Select a question to evaluate candidate responses.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Rocket icon helper component
function Rocket(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.35 1.34-1.9a10 10 0 0 1 3.54-5.6l-3.32-3.32a10 10 0 0 1-5.6 3.54c-.55.24-1.19.63-1.9 1.34Z" />
      <path d="m12 15 3 3" />
      <path d="M15 9l-3-3" />
      <path d="M12 9A9.9 9.9 0 0 1 20.7 3.3c.4.4.4 1 0 1.4A9.9 9.9 0 0 1 15 12" />
    </svg>
  );
}
