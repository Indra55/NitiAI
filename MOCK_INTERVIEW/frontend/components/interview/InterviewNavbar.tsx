"use client";

import React from 'react';
import { Timer, Hash, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface InterviewNavbarProps {
  roomId: string;
  phase: string;
  timeRemaining: number;
  isDarkMode?: boolean;
}

const InterviewNavbar = ({ roomId, phase, timeRemaining, isDarkMode }: InterviewNavbarProps) => {
  const router = useRouter();

  return (
    <nav className={`flex justify-between items-center px-8 py-3.5 border-b sticky top-0 z-50 font-sans transition-colors ${
      isDarkMode 
        ? 'border-slate-800 bg-slate-950 text-white' 
        : 'border-slate-200 bg-white text-slate-900'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>NITI AI</span>
        <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>•</span>
        <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mock Interview</span>
      </div>
      
      <div className={`hidden md:flex items-center gap-8 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-orange-500" />
          <span className="uppercase text-slate-400">Room</span>
          <span className={`font-semibold font-mono tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{roomId}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="uppercase text-slate-400">Phase</span>
          <span className={`font-semibold capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{phase}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <Timer className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold tracking-tight">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <Button 
          onClick={() => router.push('/')}
          variant="outline"
          className={`h-9 font-medium text-xs rounded-xl ${
            isDarkMode 
              ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-red-400 hover:bg-slate-800' 
              : 'border-slate-200 text-slate-600 hover:text-red-600 hover:bg-slate-50'
          }`}
        >
          <LogOut size={13} className="mr-1.5" /> Leave Room
        </Button>
      </div>
    </nav>
  );
};

export default InterviewNavbar;
