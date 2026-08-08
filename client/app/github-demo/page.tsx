'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, Layers, Target, 
  Code2, Database, Cpu, ArrowRight, Lock, ExternalLink, Award, Volume2, Mic, MicOff, LogOut
} from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

export default function GitHubDemoPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('jayyy255');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Senior Backend & Systems Engineer');
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

  // Handle client-side hydration & query params parsing
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isConnected = urlParams.get('githubConnected') === 'true';
      const userParam = urlParams.get('username');
      const tokenParam = urlParams.get('token');

      if (isConnected || tokenParam) {
        setGithubConnected(true);
        const activeUser = userParam || 'jayyy255';
        setUsername(activeUser);
        if (tokenParam) setAccessToken(tokenParam);
        runScan(activeUser, tokenParam);
      }
    }
  }, []);

  const handleOAuthConnect = () => {
    window.location.href = '/api/github/auth/login';
  };

  const handleReauthenticate = () => {
    setGithubConnected(false);
    setScanResult(null);
    setAccessToken(null);
    window.location.href = '/api/github/auth/login';
  };

  const runScan = async (userToScan: string, token: string | null = accessToken) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          githubUsername: userToScan, 
          targetRole,
          accessToken: token || accessToken
        })
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
      if (!res.ok) {
        console.error('Evaluate API error');
        return;
      }
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
            GitHub Repository Analysis Live Studio
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            100% Public &amp; Private Repository Scan, 2-Tier Relational Graph Indexing, and Dynamic Probing Questions.
          </p>
        </div>

        {/* CONDITION 1: DISCONNECTED STATE -> SHOW CONNECT BUTTON */}
        {!githubConnected && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-purple-950 border border-purple-800 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <Github className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Connect Your GitHub Account</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Authorize NitiAI via GitHub OAuth to fetch and analyze <strong>all 33 of your public and private repositories</strong> without API rate limits.
              </p>
            </div>

            <button
              onClick={handleOAuthConnect}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-xl text-sm transition-all shadow-lg shadow-purple-600/25 hover:scale-[1.02] cursor-pointer"
            >
              <Github className="w-5 h-5" /> 🚀 Connect GitHub Account (Public &amp; Private Repos)
            </button>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-center gap-3 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Safe OAuth2 Read Access • Private Repositories Protected</span>
            </div>
          </div>
        )}

        {/* CONDITION 2: CONNECTED STATE -> SHOW USER REPOS & ANALYSIS */}
        {githubConnected && (
          <div className="space-y-6">
            {/* Connection Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>GitHub OAuth Connected</span>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      @{username}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Scanning &amp; indexing all public and private repositories in 2-Tier Hybrid Engine.</p>
                </div>
              </div>

              <button
                onClick={handleReauthenticate}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Re-authenticate
              </button>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-200 text-xs flex items-center justify-between">
                <span>{errorMsg}</span>
                <button 
                  onClick={() => runScan(username)}
                  className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
                >
                  Retry Scan
                </button>
              </div>
            )}

            {/* Live Loading State */}
            {loading && (
              <div className="p-12 bg-slate-900/90 border border-purple-900/60 rounded-2xl text-center space-y-4 shadow-2xl">
                <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-100">Scanning &amp; Indexing Repositories for @{username}...</h3>
                  <p className="text-xs text-slate-400">Fetching public &amp; private repositories into Tier 1 In-Memory Hash Map &amp; Tier 2 Neon PostgreSQL Graph.</p>
                </div>
              </div>
            )}

            {/* Scan Results Display */}
            {scanResult && !loading && (
              <div className="space-y-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Analysis Complete</span>
                    <h2 className="text-2xl font-bold text-slate-100 mt-0.5">
                      Scanned Repositories for @{scanResult.githubUsername}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-950 border border-slate-800 text-indigo-400 text-xs px-3 py-1.5 rounded-xl font-mono font-bold">
                      {scanResult.reposCount} Repositories Indexed ({scanResult.privateReposCount || 0} Private, {scanResult.publicReposCount || scanResult.reposCount} Public)
                    </span>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs px-3 py-1.5 rounded-xl font-bold">
                      {scanResult.analysis.roleMatchScore}% Role Match
                    </span>
                  </div>
                </div>

                {/* Verdict & Skill Gaps */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-950/40 border border-purple-900/60 rounded-xl space-y-1">
                    <span className="text-xs text-purple-300 font-semibold uppercase">Role Compatibility Verdict</span>
                    <p className="text-sm text-purple-200 font-medium">{scanResult.analysis.roleFitVerdict}</p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Identified Skill Gaps for Learning Roadmap</span>
                    <p className="text-sm text-amber-300 font-medium font-mono">
                      {scanResult.analysis.missingRoleSkills ? scanResult.analysis.missingRoleSkills.join(', ') : 'None'}
                    </p>
                  </div>
                </div>

                {/* Dynamic Probing Questions & Spoken Answer Tester */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-200">
                      Role-Tailored Probing Questions ({scanResult.analysis.probingQuestions ? scanResult.analysis.probingQuestions.length : 0} Questions)
                    </h3>
                    <div className="space-y-3">
                      {scanResult.analysis.probingQuestions && scanResult.analysis.probingQuestions.map((q: any, idx: number) => {
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
