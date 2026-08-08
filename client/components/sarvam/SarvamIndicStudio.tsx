'use client';

import React, { useState } from 'react';
import { 
  Globe, Code2, Brain, Sparkles, RefreshCw, Volume2 
} from 'lucide-react';

export default function SarvamIndicStudio() {
  const [activeTab, setActiveTab] = useState<string>('code-explainer');
  const [targetLang, setTargetLang] = useState<string>('hi-IN');
  const [loading, setLoading] = useState<boolean>(false);

  // States for Feature 3 (Live Code Explainer)
  const [codeSnippet, setCodeSnippet] = useState('function twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    let diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}');
  const [verbalExp, setVerbalExp] = useState('Is code me hum HashMap populate kar rahe hain to avoid nested loops, isse space complexity O(N) ho jaati hai aur time complexity O(N) rehti hai.');
  const [codeExplainerResult, setCodeExplainerResult] = useState<any>(null);

  // States for Feature 4 (Socratic Tech Debate)
  const [debateTopic, setDebateTopic] = useState('PostgreSQL vs MongoDB for high-throughput transactional e-commerce checkout');
  const [candidateStance, setCandidateStance] = useState('I choose PostgreSQL because e-commerce transactions require strict ACID compliance to prevent double-spending and stock overbooking.');
  const [debateResult, setDebateResult] = useState<any>(null);

  // Handler for Feature 3
  const handleCodeExplainer = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/live-code-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeSnippet, problemTitle: 'Two Sum', candidateVerbalExplanation: verbalExp, languageCode: targetLang })
      });
      const data = await res.json();
      setCodeExplainerResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Feature 4
  const handleTechDebate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/tech-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: debateTopic, candidateStance, languageCode: targetLang })
      });
      const data = await res.json();
      setDebateResult(data);
    } catch (e) {
      console.error(e);
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
            Live Code Explainer and Socratic Technical Debate Simulator for Indian Languages.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {[
          { id: 'code-explainer', label: '3. Indic Live Code Audio Explainer', icon: Code2 },
          { id: 'tech-debate', label: '4. Socratic Technical Debate', icon: Brain },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
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
                <p className="text-slate-400 text-sm">Candidates verbalize code logic in Hinglish/Tamil while typing; AI Co-Pilot checks verbal reasoning.</p>
              </div>
              <span className="text-xs bg-pink-950 text-pink-300 border border-pink-800 px-3 py-1 rounded-full font-mono">Sarvam Co-Pilot</span>
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
                <label className="text-xs font-medium text-slate-400">Verbal Thought Process (Hinglish Mic Input)</label>
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
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />} Analyze Code Reasoning
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
                    <div className="p-3 bg-pink-950/40 border border-pink-900/50 rounded-lg text-xs text-pink-200">
                      <strong>AI Audio Hint:</strong> {codeExplainerResult.evaluation.audioHintText}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Enter verbal code reasoning to get AI Co-pilot feedback.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 4: Socratic Tech Debate */}
        {activeTab === 'tech-debate' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" /> Feature 4: Socratic Technical Debate Simulator
                </h2>
                <p className="text-slate-400 text-sm">Sarvam AI acts as a Principal Architect challenging architectural trade-offs in regional languages.</p>
              </div>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-mono">Sarvam 105B</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Debate Topic</label>
                <input 
                  type="text" 
                  value={debateTopic} 
                  onChange={(e) => setDebateTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Candidate Architecture Stance</label>
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
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Challenge Stance via Socratic AI
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" /> Architect Socratic Pushback
                </h3>
                {debateResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-xs text-emerald-200">
                      <strong>Principal Architect Counter-Question:</strong> {debateResult.debateResponse.socraticPushback}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Submit your architectural stance to begin Socratic debate.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
