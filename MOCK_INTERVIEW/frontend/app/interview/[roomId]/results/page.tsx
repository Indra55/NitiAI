"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DiscussionChat from '@/components/interview/DiscussionChat';
import EvaluationModal from '@/components/interview/EvaluationModal';
import DetailedEvaluationDisplay from '@/components/interview/DetailedEvaluationDisplay';
import { Trophy, Award, BarChart3, ChevronRight, Home, ArrowDown, Users, CheckCircle2, TrendingUp, RotateCcw, Share2, Code2, Handshake, Scale } from 'lucide-react';
import InterviewLoadingScreen from '@/components/interview/InterviewLoadingScreen';
import { Button } from '@/components/ui/button';
import { io } from 'socket.io-client';
import { generateEvaluationPDF } from '@/lib/pdf-generator';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function ResultsPage({ params: paramsPromise }: { params: Promise<{ roomId: string }> }) {
  const params = use(paramsPromise);
  const roomId = params.roomId;
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || "You";


  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ name: string, score: number } | null>(null);

  const handleOpenDetails = (candidate: any) => {
    setSelectedCandidate({ name: candidate.name, score: candidate.score });
    setIsModalOpen(true);
  };

  // Generate evaluation when participant data is available
  useEffect(() => {
    if (!currentUser || evaluation) return;
    
    console.log('Current user data:', currentUser);
    console.log('DSA Submissions:', currentUser.dsaSubmissions);
    console.log('Voice Answers:', currentUser.voiceAnswers);
    console.log('Penalties:', currentUser.penalties);
    
    const generateEvaluation = async () => {
      try {
        setIsLoadingEvaluation(true);
        
        // Use mock data if no real submissions exist (for testing)
        const hasMockData = (!currentUser.dsaSubmissions || currentUser.dsaSubmissions.length === 0) &&
                           (!currentUser.voiceAnswers || currentUser.voiceAnswers.length === 0);
        
        // Prepare participant data for evaluation
        const participantData = {
          name: currentUser.name,
          dsaScores: hasMockData ? [
            {
              questionId: 0,
              questionTitle: "Sample DSA Question",
              testCaseScore: 3,
              qualityScore: 2,
              styleScore: 2,
              timeBonus: 1,
              revealCodeUsed: false,
              revealPenalty: 0,
              hintsUsed: 0,
              hintPenalty: 0,
              submissionAttempts: 1,
              submissionPenalty: 0,
              totalScore: 8,
              maxScore: 10,
              timeSpent: 300,
              codeSubmitted: '// Sample code',
              testResults: [
                { passed: true, input: 'test1', expected: 'out1', actual: 'out1' },
                { passed: true, input: 'test2', expected: 'out2', actual: 'out2' },
                { passed: true, input: 'test3', expected: 'out3', actual: 'out3' }
              ]
            }
          ] : (currentUser.dsaSubmissions || []).map((sub: any, idx: number) => ({
            questionId: sub.questionId,
            questionTitle: `Question ${idx + 1}`,
            testCaseScore: sub.lastTestResults ? 
              (sub.lastTestResults.filter((t: any) => t.passed).length / sub.lastTestResults.length) * 4 : 0,
            qualityScore: sub.lastTestResults?.every((t: any) => t.passed) ? 3 : 1,
            styleScore: 2,
            timeBonus: sub.timeSpent < 600 ? 1 : 0,
            revealCodeUsed: sub.revealCodeUsed || false,
            revealPenalty: sub.revealCodeUsed ? -5 : 0,
            hintsUsed: sub.hintsUsed || 0,
            hintPenalty: (sub.hintsUsed || 0) * -1,
            submissionAttempts: sub.attempts || 1,
            submissionPenalty: sub.attempts > 2 ? (sub.attempts - 2) * -0.5 : 0,
            totalScore: 0,
            maxScore: 10,
            timeSpent: sub.timeSpent || 0,
            codeSubmitted: sub.lastCode || '',
            testResults: sub.lastTestResults || []
          })),
          voiceScores: hasMockData ? [
            {
              questionId: 0,
              question: "Sample Voice Question",
              expectedAnswer: "Sample expected answer",
              transcript: "Sample transcript of user answer",
              duration: 60,
              accuracyScore: 4,
              completenessScore: 2,
              communicationScore: 2,
              totalScore: 8,
              maxScore: 10
            }
          ] : (currentUser.voiceAnswers || []).map((ans: any, idx: number) => ({
            questionId: ans.questionId,
            question: `Voice Question ${idx + 1}`,
            expectedAnswer: '',
            transcript: ans.transcript || '',
            duration: ans.duration || 0,
            accuracyScore: 4,
            completenessScore: 2,
            communicationScore: 2,
            totalScore: 8,
            maxScore: 10
          })),
          penalties: currentUser.penalties || { revealCode: 0, hints: 0, submissions: 0 }
        };

        // Calculate total scores
        participantData.dsaScores.forEach((q: any) => {
          q.totalScore = Math.max(0, 
            q.testCaseScore + q.qualityScore + q.styleScore + q.timeBonus +
            q.revealPenalty + q.hintPenalty + q.submissionPenalty
          );
        });

        const dsaTotalScore = participantData.dsaScores.reduce((sum: number, q: any) => sum + q.totalScore, 0);
        const voiceTotalScore = participantData.voiceScores.reduce((sum: number, q: any) => sum + q.totalScore, 0);
        const finalScore = dsaTotalScore + voiceTotalScore;
        const maxPossibleScore = (participantData.dsaScores.length * 10) + (participantData.voiceScores.length * 10);
        const percentage = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;

        console.log('Calculated scores:', {
          dsaTotalScore,
          voiceTotalScore,
          finalScore,
          maxPossibleScore,
          percentage
        });

        const fullData = {
          ...participantData,
          dsaTotalScore,
          voiceTotalScore,
          finalScore,
          maxPossibleScore,
          percentage
        };

        // Call backend for detailed AI evaluation
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/evaluate/detailed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantData: fullData })
        });

        if (response.ok) {
          const text = await response.text();
          let result: any = null;
          try { result = JSON.parse(text); } catch (e) {}
          if (result && result.evaluation) {
            console.log('Evaluation result:', result);
            setEvaluation(result.evaluation);
          } else {
            setEvaluation(fullData);
          }
        } else {
          // Fallback to basic evaluation
          console.warn('API call failed, using basic evaluation');
          setEvaluation(fullData);
        }
      } catch (error) {
        console.error('Evaluation generation error:', error);
        // Use basic scores as fallback
        setEvaluation({
          name: currentUser.name,
          finalScore: 75,
          maxPossibleScore: 100,
          percentage: 75
        });
      } finally {
        setIsLoadingEvaluation(false);
      }
    };

    generateEvaluation();
  }, [currentUser, evaluation]);


  useEffect(() => {
    const socket = io(SOCKET_URL);
    
    // Join room just to get status updates (no config needed here)
    socket.emit('join-room', { roomId, username });

    socket.on('room-update', (room: any) => {
       // Filter out duplicates if logic in backend allows multiple joins for same name
       const uniqueParticipants = room.participants; 
       setParticipants(uniqueParticipants);
       const me = uniqueParticipants.find((p: any) => p.name === username) || { name: username };
       setCurrentUser(me);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username]);

  const myScore = evaluation ? Math.round(evaluation.percentage) : 0;
  const myRank = 1; // Can calculate from all participants if needed
  const scoreRingStyle = { background: `conic-gradient(#f97316 ${myScore * 3.6}deg, #f1f5f9 0deg)` };
  const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
  const technicalScore = typeof evaluation?.technicalScore === 'number'
    ? evaluation.technicalScore
    : evaluation?.dsaTotalScore
      ? (evaluation.dsaTotalScore / Math.max(1, (evaluation.dsaScores?.length || 1) * 10)) * 100
      : myScore;
  const roundScores = [
    { title: 'Technical', icon: Code2, score: clampScore(technicalScore), detail: 'Code efficiency, edge cases & system viva' },
    { title: 'Behavioral', icon: Handshake, score: clampScore(evaluation?.behavioralScore ?? Math.max(0, myScore - 4)), detail: 'STAR structure & communication clarity' },
    { title: 'Cultural fit', icon: Scale, score: clampScore(evaluation?.culturalScore ?? Math.max(0, myScore - 7)), detail: 'Values alignment, ethics & collaboration' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 lg:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Results Area */}
        <div className="lg:col-span-2 space-y-10">
          <header className="flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluation Report</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
               Session Results & Feedback
             </h1>
             <p className="text-slate-500 text-sm font-normal">
               Comprehensive performance breakdown and roadmap recommendations for <span className="font-semibold text-slate-900">{username}</span>.
             </p>
          </header>

          {/* Performance Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel border border-orange-100 p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-orange-100/40">
               <div className="text-slate-400 font-black uppercase tracking-[0.18em] text-[10px] mb-5">Overall match score</div>
               <div className="grid size-44 place-items-center rounded-full p-2 shadow-inner" style={scoreRingStyle}><div className="grid size-full place-items-center rounded-full bg-white"><div className="text-center"><div className="text-5xl font-black tracking-tighter text-slate-900">{myScore}<span className="text-xl text-orange-500">%</span></div><p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Candidate match</p></div></div></div>
               <div className="mt-5 bg-orange-50 px-4 py-2 rounded-full text-orange-600 font-black text-xs flex items-center gap-2 border border-orange-100"><Award size={14} /> {myScore >= 80 ? 'STRONG MATCH' : 'GROWTH TRACK'}</div>
            </div>

            <div className="bg-white border border-gray-100 p-10 rounded-4xl space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
               <h3 className="text-black font-black flex items-center justify-between">
                  <span className="flex items-center gap-2">
                     <BarChart3 size={20} className="text-orange-400" /> Score Weights
                  </span>
                  <div className="flex gap-1">
                     {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-orange-100 rounded-full" />)}
                  </div>
               </h3>
               <div className="space-y-6">
                  {[
                    { label: 'Technical Accuracy', val: 95, color: 'bg-orange-500' },
                    { label: 'Conceptual Clarity', val: 82, color: 'bg-orange-300' },
                    { label: 'Soft Skills', val: 78, color: 'bg-black' }
                  ].map((s) => (
                    <div key={s.label}>
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                          <span className="text-black/30">{s.label}</span>
                          <span className="text-black">{s.val}%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden p-0.5">
                          <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.val}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Round-by-round</p><h2 className="mt-1 text-2xl font-black tracking-tight">Performance breakdown</h2></div><span className="hidden text-xs font-semibold text-slate-400 sm:block">Scores reflect completed rounds</span></div>
            <div className="grid gap-4 md:grid-cols-3">{roundScores.map((round) => <article key={round.title} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50"><div className="flex items-start justify-between">{React.createElement(round.icon, { className: 'size-5 text-orange-500' })}<span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">{round.score}%</span></div><h3 className="mt-6 font-black text-slate-900">{round.title}</h3><p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{round.detail}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${round.score}%` }} /></div></article>)}</div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6"><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="size-5" /><h2 className="font-black">Key strengths</h2></div><ul className="mt-4 space-y-3 text-sm font-medium text-slate-600"><li>• Clear technical foundations and problem framing.</li><li>• Consistent, structured responses under pressure.</li><li>• Strong readiness to collaborate with a team.</li></ul></div>
            <div className="rounded-3xl border border-orange-100 bg-orange-50/50 p-6"><div className="flex items-center gap-2 text-orange-600"><TrendingUp className="size-5" /><h2 className="font-black">Growth areas</h2></div><ul className="mt-4 space-y-3 text-sm font-medium text-slate-600"><li>• Narrate edge cases before writing implementation.</li><li>• Make STAR outcomes more measurable and specific.</li><li>• Reserve a final minute to summarise trade-offs.</li></ul></div>
          </section>

          {/* Leaderboard Table */}
          <section className="bg-white border border-gray-100 rounded-4xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.02)]">
             <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                   <Users className="w-5 h-5 text-orange-500" />
                   Your Performance
                </h3>
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">Real-time Evaluation</span>
             </div>
             <div className="divide-y divide-gray-50">
                 {!evaluation || isLoadingEvaluation ? (
                     <div className="py-6">
                         <InterviewLoadingScreen 
                           title="Generating Detailed Evaluation"
                           subtitle="Analyzing code efficiency, penalties, and Youtube learning recommendations..."
                         />
                     </div>
                 ) : (
                    <div className="px-10 py-8 flex items-center justify-between hover:bg-orange-50/20 transition-all cursor-default group">
                        <div className="flex items-center gap-8">
                            <span className="text-3xl font-black w-8 text-orange-500">01</span>
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-orange-500 shadow-lg shadow-orange-100 flex items-center justify-center text-xl font-black text-orange-500">
                                {username[0]?.toUpperCase()}
                                </div>
                                <div>
                                <div className="font-black text-xl text-black flex items-center gap-2">
                                    {username}
                                    <span className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-full">YOU</span>
                                </div>
                                <div className="text-[10px] text-black/30 font-black uppercase tracking-[0.2em] mt-1">Completed</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-3xl font-black mb-1 text-black">{myScore} <span className="text-[10px] text-black/20 font-black tracking-widest ml-1">POINTS</span></div>
                            <button 
                                onClick={() => handleOpenDetails({ name: username, score: myScore })}
                                className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-orange-600 transition-colors"
                            >
                            Details <ChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
             </div>
          </section>

          {/* Detailed AI Evaluation */}
          {evaluation && evaluation.detailedEvaluation && (
            <DetailedEvaluationDisplay evaluation={evaluation} />
          )}
        </div>

        {/* Sidebar: Chat & Feedback */}
        <aside className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
           <div className="bg-orange-500 p-10 rounded-4xl relative overflow-hidden group shadow-2xl shadow-orange-200">
              <div className="relative z-10">
                 <h3 className="text-3xl font-black text-white mb-3 tracking-tighter">AI FEEDBACK</h3>
                 <p className="text-orange-100 text-sm mb-8 font-black leading-relaxed">Download your comprehensive technical evaluation and improvement path.</p>
                 <button 
                    onClick={() => currentUser && evaluation && generateEvaluationPDF(currentUser.name, myScore, evaluation)}
                    className="w-full py-5 bg-white text-orange-600 font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                 >
                    <ArrowDown size={20} /> GET FULL REPORT
                 </button>
              </div>

              <div className="absolute -bottom-12 -right-12 text-white/10 group-hover:scale-110 transition-transform rotate-12">
                 <Award size={240} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3"><Link href="/" className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-700 transition-all hover:border-orange-300 hover:text-orange-600"><RotateCcw className="size-4" /> Re-try</Link><button onClick={() => navigator.share?.({ title: 'NITI AI interview result', text: `I scored ${myScore}% on my NITI AI mock interview.` })} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black text-white transition-all hover:bg-orange-500"><Share2 className="size-4" /> Share</button></div>

           <DiscussionChat />

           <Link href="/" className="w-full h-20 flex items-center justify-center gap-2 text-black/30 font-black uppercase tracking-widest border-4 border-dashed border-gray-100 rounded-4xl hover:border-orange-200 hover:text-orange-600 transition-all group">
              <Home size={20} className="group-hover:-translate-y-0.5 transition-transform" /> 
              Back home
           </Link>
        </aside>
      </div>

      <EvaluationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        candidateName={selectedCandidate?.name || ''} 
        score={selectedCandidate?.score || 0} 
        evaluationData={evaluation}
      />
    </div>
  );
}
