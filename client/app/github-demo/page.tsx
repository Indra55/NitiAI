'use client';

import React, { useState, useEffect } from 'react';
import { 
  Github, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, Layers, Target, 
  Code2, Database, Cpu, ArrowRight, Lock, ExternalLink, Award
} from 'lucide-react';

export default function GitHubDemoPage() {
  const [githubConnected, setGithubConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('jaydalvi');
  const [targetRole, setTargetRole] = useState<string>('Senior Backend & Systems Engineer');
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Parse URL query params on redirect from GitHub OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isConnected = urlParams.get('githubConnected') === 'true';
      const userParam = urlParams.get('username');

      if (isConnected) {
        setGithubConnected(true);
        if (userParam) setUsername(userParam);
        // Automatically run scan for connected OAuth user
        runScan(userParam || username);
      }
    }
  }, []);

  const runScan = async (userToScan: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUsername: userToScan, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data);
      }
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-4 py-1.5 rounded-full text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" /> NitiAI GitHub OAuth & 2-Tier Indexing Engine
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            GitHub Repository Analysis Live Demo
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Connect your GitHub account via NitiAI OAuth to scan 100% of your public and private repositories, build a 2-Tier Hybrid Relational Graph, and generate dynamic role-tailored probing questions.
          </p>
        </div>

        {/* OAuth Connect & Scan Controls */}
        <div className="grid md:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Github className="w-5 h-5 text-purple-400" /> Step 1: Connect GitHub OAuth
              </h2>
              {githubConnected ? (
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OAuth Connected
                </span>
              ) : (
                <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[11px] px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Public Repos Only
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Authorizing NitiAI via GitHub OAuth grants read access to fetch <strong>all public & private repositories</strong> without API rate limits.
            </p>

            <a
              href="http://localhost:5000/api/github/auth/login"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Github className="w-5 h-5" /> 🚀 Connect GitHub Account (Public & Private Repos)
            </a>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-400 block">Or Test Public Scan Directly by Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Indra55, SujalChoudhari, jayyy255"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <button
                  onClick={() => runScan(username)}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Scan Now
                </button>
              </div>
            </div>
          </div>

          {/* Applied Target Role Input */}
          <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Step 2: Target Applied Role
            </h3>
            <p className="text-xs text-slate-400">
              NitiAI compares the candidate's scanned repository tools against the target role requirements to identify roadmap skill gaps.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Target Role Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-indigo-300 font-medium focus:outline-none"
              />
            </div>

            <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-1 text-xs text-indigo-200">
              <div className="font-semibold text-indigo-300">2-Tier Hybrid Indexing Engine:</div>
              <div>• Tier 1: In-Memory SHA Cache &amp; Inverted Map (&lt; 10ms lookup)</div>
              <div>• Tier 2: Neon PostgreSQL Relational Property Graph (&lt; 2ms traversal)</div>
            </div>
          </div>
        </div>

        {/* Live Scan Results Section */}
        {scanResult && (
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
                  {scanResult.reposCount} Repositories Indexed
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

            {/* Dynamic Probing Questions Range */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span>Dynamic Probing Questions Generated from Relational Graph ({scanResult.analysis.probingQuestions ? scanResult.analysis.probingQuestions.length : 0} Questions):</span>
                <span className="text-xs text-slate-500 font-normal">Zero Sarvam API Credits Used</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {scanResult.analysis.probingQuestions && scanResult.analysis.probingQuestions.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition-all">
                    <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
                      <span>Q{idx + 1}. {q.toolComparison || 'Repo Probing'}</span>
                      <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{q.repoName}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{q.question}</p>
                    <div className="text-[11px] text-slate-400">
                      <strong>Expected Concepts:</strong> {q.expectedConcepts ? q.expectedConcepts.join(', ') : 'Architecture depth'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
