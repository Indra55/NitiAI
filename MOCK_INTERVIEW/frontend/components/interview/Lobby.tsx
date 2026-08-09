"use client";

import React, { useState } from 'react';
import { 
  UserCheck, 
  Users,
  Copy,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isReady: boolean;
}

const Lobby = ({ roomId, participants, onReady }: { roomId: string, participants: Participant[], onReady: (status: boolean) => void }) => {
  const [isReady, setIsReady] = useState(false);
  const readyCount = participants.filter(p => p.isReady).length;

  const toggleReady = () => {
    const nextStatus = !isReady;
    setIsReady(nextStatus);
    onReady(nextStatus);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-white text-slate-900 p-8 font-sans">
      <div className="max-w-5xl w-full space-y-8">
        
        {/* Header & Status */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Session Lobby</h1>
            <p className="text-xs text-slate-500 font-normal">Wait for participants to signal ready before launching.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
            <span className="text-orange-600 font-bold">{readyCount}</span> of <span className="font-bold text-slate-900">{participants.length}</span> Ready
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Guidelines & Ready CTA */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-6">
              <h2 className="text-base font-semibold text-slate-900 uppercase tracking-wider">
                Interview Guidelines
              </h2>
              <div className="space-y-5 text-slate-600 text-xs font-normal leading-relaxed">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-white text-xs font-semibold">1</div>
                  <p>The timer begins immediately upon entering the coding arena. Solve the problems systematically.</p>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-white text-xs font-semibold">2</div>
                  <p>Following coding, Sarvam AI will evaluate your approach through verbal viva questions.</p>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 shrink-0 flex items-center justify-center text-white text-xs font-semibold">3</div>
                  <p>Ensure your microphone is active. Verbal explanations count towards your overall score.</p>
                </div>
              </div>
            </div>

            <button
              onClick={toggleReady}
              className={`w-full py-4 rounded-xl font-medium text-sm transition-colors ${
                isReady 
                ? 'bg-slate-900 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isReady ? 'Ready (Waiting for Others...)' : 'Signal Ready'}
            </button>
          </div>

          {/* Right: Room Members & Invites */}
          <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  Room Members ({participants.length})
                </h3>
              </div>
              
              <div className="space-y-3 max-h-55 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        {p.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-slate-900">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{p.isReady ? 'Ready' : 'In Lobby'}</span>
                      </div>
                    </div>
                    {p.isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Links */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Invite Participants</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    const btn = document.getElementById('copy-btn-text');
                    if (btn) btn.innerText = 'Copied!';
                    setTimeout(() => { if (btn) btn.innerText = 'Copy Link'; }, 2000);
                  }}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={14} className="text-slate-400" />
                  <span id="copy-btn-text">Copy Link</span>
                </button>
                <button 
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent("Join my mock interview room on Niti AI:");
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-xs text-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Lobby;
