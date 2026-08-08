'use client';

import React, { useState } from 'react';
import { 
  Globe, Mic, Code2, Brain, FileText, Camera, Award, Sparkles, AudioLines, 
  CheckCircle2, RefreshCw, Volume2, Upload, AlertCircle, ChevronRight 
} from 'lucide-react';

export default function SarvamIndicStudio() {
  const [activeTab, setActiveTab] = useState<string>('job-coach');
  const [targetLang, setTargetLang] = useState<string>('hi-IN');
  const [loading, setLoading] = useState<boolean>(false);

  // States for Feature 1 (Job Coach)
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer (Node.js & React)');
  const [jobDesc, setJobDesc] = useState('Looking for an engineer experienced in building RESTful microservices, PostgreSQL query optimization, and real-time WebSockets.');
  const [jobResult, setJobResult] = useState<any>(null);

  // States for Feature 2 (STAR Coach)
  const [starQuestion, setStarQuestion] = useState('Describe a time you resolved a major production bug under high pressure.');
  const [starAnswer, setStarAnswer] = useState('During a peak sale event, our Redis cache server crashed due to out-of-memory errors. I analyzed the memory footprint, implemented LRU eviction policies, and added rate limiting in Node.js within 20 minutes to stabilize throughput.');
  const [starResult, setStarResult] = useState<any>(null);

  // States for Feature 3 (Live Code Explainer)
  const [codeSnippet, setCodeSnippet] = useState('function twoSum(nums, target) {\n  const map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    let diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}');
  const [verbalExp, setVerbalExp] = useState('Is code me hum HashMap populate kar rahe hain to avoid nested loops, isse space complexity O(N) ho jaati hai aur time complexity O(N) rehti hai.');
  const [codeExplainerResult, setCodeExplainerResult] = useState<any>(null);

  // States for Feature 4 (Socratic Tech Debate)
  const [debateTopic, setDebateTopic] = useState('PostgreSQL vs MongoDB for high-throughput transactional e-commerce checkout');
  const [candidateStance, setCandidateStance] = useState('I choose PostgreSQL because e-commerce transactions require strict ACID compliance to prevent double-spending and stock overbooking.');
  const [debateResult, setDebateResult] = useState<any>(null);

  // States for Feature 5 (Resume Skill Audit)
  const [resumeText, setResumeText] = useState('Full Stack Developer. Experienced with Node.js, Redis caching, Docker containerization, PostgreSQL indexing, and Kafka message streaming.');
  const [auditResult, setAuditResult] = useState<any>(null);

  // States for Feature 6 (Handwritten Code OCR)
  const [handwrittenResult, setHandwrittenResult] = useState<any>(null);

  // States for Feature 7 (Bilingual HR Report)
  const [candidateName, setCandidateName] = useState('Jay Sharma');
  const [dsaScore, setDsaScore] = useState(88);
  const [softSkillsScore, setSoftSkillsScore] = useState(92);
  const [transcript, setTranscript] = useState('Candidate demonstrated strong algorithm formulation, clearly verbalized time complexity trade-offs in Hinglish, and structured STAR answers effectively.');
  const [reportResult, setReportResult] = useState<any>(null);

  // Handler for Feature 1
  const handleJobMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/job-translate-and-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, description: jobDesc, targetLang, userSkills: ['Node.js', 'React', 'PostgreSQL', 'JavaScript'] })
      });
      const data = await res.json();
      setJobResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Feature 2
  const handleStarEval = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/star-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: starQuestion, candidateAnswer: starAnswer, languageCode: targetLang })
      });
      const data = await res.json();
      setStarResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

  // Handler for Feature 5
  const handleSkillAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/resume-skill-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, claimedSkills: ['Redis', 'Docker', 'PostgreSQL', 'Kafka'] })
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Feature 6
  const handleHandwrittenOCR = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/handwritten-code-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang })
      });
      const data = await res.json();
      setHandwrittenResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Feature 7
  const handleBilingualReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/bilingual-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateName, dsaScore, softSkillsScore, sessionTranscript: transcript, targetLang })
      });
      const data = await res.json();
      setReportResult(data);
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
            Multilingual Career Coaching, Code Explainer, Socratic Debates, and HR Intelligence for Indian Languages.
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
            <option value="kn-IN" className="bg-slate-900 text-white">Kannada (கன்னட)</option>
          </select>
        </div>
      </div>

      {/* Feature Tabs Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { id: 'job-coach', label: '1. Indic Job Coach', icon: Globe },
          { id: 'star-eval', label: '2. STAR Coach', icon: Award },
          { id: 'code-explainer', label: '3. Code Explainer', icon: Code2 },
          { id: 'tech-debate', label: '4. Tech Debate', icon: Brain },
          { id: 'skill-audit', label: '5. Skill Audit', icon: FileText },
          { id: 'handwritten-ocr', label: '6. Paper Code OCR', icon: Camera },
          { id: 'hr-scribe', label: '7. HR Bilingual Scribe', icon: AudioLines },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[450px]">
        {/* FEATURE 1: Indic Job Coach */}
        {activeTab === 'job-coach' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" /> Feature 1: Multilingual AI Career Coach & Job Matcher
                </h2>
                <p className="text-slate-400 text-sm">Translates English job postings into 22 Indian languages and computes match score via Sarvam 105B.</p>
              </div>
              <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full font-mono">Sarvam Translate + Sarvam 105B</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Job Title</label>
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Job Description (English)</label>
                <textarea 
                  rows={4}
                  value={jobDesc} 
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
                <button 
                  onClick={handleJobMatch}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Translate & Match via Sarvam AI
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Indic Match Report
                </h3>
                {jobResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400">AI Match Score:</span>
                      <span className="text-lg font-bold text-emerald-400">{jobResult.matchScore}%</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase">Translated Job Card ({jobResult.targetLang}):</span>
                      <p className="text-slate-300 text-xs mt-1 p-2.5 bg-slate-900 rounded-lg border border-slate-800 leading-relaxed">
                        {jobResult.translatedDescription}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase">Localized Advice:</span>
                      <p className="text-indigo-300 text-xs mt-1 p-2.5 bg-indigo-950/40 rounded-lg border border-indigo-900/50">
                        {jobResult.localizedAdvice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Click 'Translate & Match' to view Sarvam AI translated output.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 2: STAR Coach */}
        {activeTab === 'star-eval' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Feature 2: STAR Method Soft-Skills Simulator
                </h2>
                <p className="text-slate-400 text-sm">Evaluates Situation, Task, Action, Result in regional/code-mixed speech via Saaras V3 & Bulbul V3.</p>
              </div>
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-mono">Saaras V3 + Bulbul V3</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Behavioral Question</label>
                <input 
                  type="text" 
                  value={starQuestion} 
                  onChange={(e) => setStarQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <label className="text-xs font-medium text-slate-400">Spoken/Typed Answer (Hinglish / Regional)</label>
                <textarea 
                  rows={4}
                  value={starAnswer} 
                  onChange={(e) => setStarAnswer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleStarEval}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />} Evaluate STAR Response
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> STAR Evaluation Breakdown
                </h3>
                {starResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500">Situation</div>
                        <div className="text-purple-400 font-bold mt-1">{starResult.starScores.situationScore}%</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500">Task</div>
                        <div className="text-purple-400 font-bold mt-1">{starResult.starScores.taskScore}%</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500">Action</div>
                        <div className="text-purple-400 font-bold mt-1">{starResult.starScores.actionScore}%</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="text-slate-500">Result</div>
                        <div className="text-purple-400 font-bold mt-1">{starResult.starScores.resultScore}%</div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-950/40 border border-purple-900/50 rounded-lg text-xs text-purple-200">
                      <strong>AI Audio Coach Feedback:</strong> {starResult.starScores.feedback}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Submit an answer to see STAR framework scoring.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 3: Live Code Explainer */}
        {activeTab === 'code-explainer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-pink-400" /> Feature 3: Indic Live Code Audio Explainer
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
                        {codeExplainerResult.evaluation.logicMatchesCode ? '✓ Verified Alignment' : '❌ Discrepancy Found'}
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
                <label className="text-xs font-medium text-slate-400">Your Technical Stance</label>
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
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="text-slate-400">Architectural Defense Score:</span>
                      <span className="text-emerald-400 font-bold">{debateResult.debateResponse.architecturalScore}%</span>
                    </div>
                    <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-xs text-emerald-200">
                      <strong>Principal Architect Counter-Question:</strong> {debateResult.debateResponse.socraticPushback}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Submit your architectural stance to initiate debate.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 5: Resume Skill Audit */}
        {activeTab === 'skill-audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" /> Feature 5: Indic Resume Skill Gap Auditor
                </h2>
                <p className="text-slate-400 text-sm">Extracts technical claims from resumes and launches interactive voice skill probing calls.</p>
              </div>
              <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full font-mono">Sarvam 30B</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Resume Technical Content</label>
                <textarea 
                  rows={6}
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleSkillAudit}
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Audit Resume Technical Claims
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Voice Skill Audit Probing Questions
                </h3>
                {auditResult ? (
                  <div className="space-y-3 text-xs">
                    {auditResult.auditQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-cyan-400 font-semibold">
                          <span>Claimed Skill: {q.skill}</span>
                        </div>
                        <p className="text-slate-200 mt-1">{q.question}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Submit resume content to generate probing questions.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 6: Handwritten Code OCR */}
        {activeTab === 'handwritten-ocr' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" /> Feature 6: Handwritten Code OCR & Logic Evaluator
                </h2>
                <p className="text-slate-400 text-sm">Extracts paper-written code using Sarvam Vision 3B VLM and provides Indic audio evaluation.</p>
              </div>
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-full font-mono">Sarvam Vision</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center space-y-3 bg-slate-950">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                  <div className="text-xs text-slate-400">
                    Upload photo of handwritten paper code or college placement sheet
                  </div>
                  <button 
                    onClick={handleHandwrittenOCR}
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-4 rounded-xl text-sm transition-all inline-flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />} Run Sarvam Vision OCR
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" /> Extracted Code & Analysis
                </h3>
                {handwrittenResult ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Extracted Code (Sarvam Vision):</span>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 font-mono mt-1 overflow-x-auto">
                        {handwrittenResult.ocrResult.extractedText}
                      </pre>
                    </div>
                    <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-lg text-amber-200">
                      <strong>Logic & Syntax Feedback:</strong> {handwrittenResult.codeAnalysis.logicFeedback}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Upload an image to test handwritten paper code OCR.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FEATURE 7: HR Scribe */}
        {activeTab === 'hr-scribe' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <AudioLines className="w-5 h-5 text-blue-400" /> Feature 7: Indic HR Scribe & Bilingual Report Card
                </h2>
                <p className="text-slate-400 text-sm">Transcribes regional interview sessions into dual-language executive reports for recruiters.</p>
              </div>
              <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full font-mono">Sarvam Translate + 105B</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-400">Candidate Name</label>
                <input 
                  type="text" 
                  value={candidateName} 
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-400">DSA Score</label>
                    <input 
                      type="number" 
                      value={dsaScore} 
                      onChange={(e) => setDsaScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400">Soft Skills Score</label>
                    <input 
                      type="number" 
                      value={softSkillsScore} 
                      onChange={(e) => setSoftSkillsScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <label className="text-xs font-medium text-slate-400">Interview Transcript Summary</label>
                <textarea 
                  rows={4}
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
                />
                <button 
                  onClick={handleBilingualReport}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AudioLines className="w-4 h-4" />} Generate Bilingual Executive Report
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <AudioLines className="w-4 h-4 text-blue-400" /> HR Executive Scorecard
                </h3>
                {reportResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Recommendation:</span>
                      <span className="text-emerald-400 font-bold text-sm">{reportResult.report.hiringRecommendation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium uppercase">English Executive Summary:</span>
                      <p className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-200 mt-1">
                        {reportResult.report.englishSummary}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium uppercase">Indic Summary ({targetLang}):</span>
                      <p className="p-2.5 bg-indigo-950/40 rounded-lg border border-indigo-900/50 text-indigo-200 mt-1">
                        {reportResult.report.indicSummary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Generate report to view HR Executive Scorecard.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
