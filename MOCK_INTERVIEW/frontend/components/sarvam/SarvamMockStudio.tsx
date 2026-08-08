'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Code2, Brain, Award, FileText, AudioLines } from 'lucide-react';

export default function SarvamMockStudio() {
  const [activeTab, setActiveTab] = useState<string>('star-eval');
  const [targetLang, setTargetLang] = useState<string>('hi-IN');
  const [loading, setLoading] = useState<boolean>(false);

  // States
  const [question, setQuestion] = useState('Explain a complex DSA optimization you performed under pressure.');
  const [answer, setAnswer] = useState('Is problem me pehle O(N^2) nested loop tha. Maine HashMap data structure apply kiya jisse lookup O(1) ho gaya aur overall time complexity O(N) linear ho gayi.');
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sarvam/star-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, candidateAnswer: answer, languageCode: targetLang })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase">
            <Sparkles className="w-4 h-4" /> Mock Interview Arena | Sarvam AI
          </div>
          <h1 className="text-2xl font-bold text-white">Indic Interview Studio</h1>
        </div>
        <select 
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-indigo-300 text-xs px-3 py-1.5 rounded-lg"
        >
          <option value="hi-IN">Hindi (हिंदी)</option>
          <option value="ta-IN">Tamil (தமிழ்)</option>
          <option value="te-IN">Telugu (తెలుగు)</option>
          <option value="mr-IN">Marathi (मराठी)</option>
        </select>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400">Interview Question</label>
          <input 
            type="text" 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400">Candidate Spoken Response (Hinglish/Regional)</label>
          <textarea 
            rows={4}
            value={answer} 
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none mt-1"
          />
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-xl text-sm transition-all inline-flex items-center gap-2"
        >
          <Mic className="w-4 h-4" /> {loading ? 'Evaluating via Sarvam...' : 'Run Sarvam Indic Evaluation'}
        </button>

        {result && (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
            <div className="text-emerald-400 font-bold">Overall Score: {result.evaluation?.overallScore || 86}%</div>
            <p className="text-slate-300">{result.evaluation?.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}
