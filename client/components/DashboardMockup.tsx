import React from 'react';
import { LayoutDashboard, FileText, Users, ArrowUpRight, Plus, RefreshCcw, Layout, Sparkles, RefreshCw, CheckCircle2, GraduationCap, Briefcase, Rocket, Calendar, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const DashboardMockup = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-5 relative z-20 animate-fade-up [animation-delay:580ms]">
      <div className="rounded-xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col h-[650px]">
        
        {/* Window Header (macOS style) */}
        <div className="h-10 bg-background border-b border-border flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="text-muted-foreground text-xs font-medium flex items-center gap-2 bg-foreground/5 px-3 py-1 rounded-md">
            <LayoutDashboard className="w-3 h-3" />
            niti.ai
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCcw className="w-3.5 h-3.5" />
            <Plus className="w-4 h-4" />
            <Layout className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Window Body */}
        <div className="flex flex-1 overflow-hidden bg-background">
          
          {/* Main Content mimicking the real dashboard */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                  Welcome, Alex
                </h1>
                <p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-powered career insights tailored just for you
                </p>
              </div>
              <div className="flex gap-2">
                <button className="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center text-foreground">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="h-9 px-4 rounded-md bg-primary hover:bg-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                  Refresh Insights
                </button>
              </div>
            </div>

            {/* Bento Grid Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              
              {/* Radial Chart Mockup (Completeness) */}
              <div className="lg:col-span-1 bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[280px]">
                <h3 className="text-lg font-bold text-foreground mb-6 self-start w-full">Completeness</h3>
                
                {/* CSS based static radial chart mockup */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {/* Outer rings */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="70" className="drop-shadow-sm" strokeLinecap="round" />
                    
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#ec4899" strokeWidth="8" strokeDasharray="219.9" strokeDashoffset="40" className="drop-shadow-sm" strokeLinecap="round" />
                    
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted opacity-20" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="157.1" strokeDashoffset="20" className="drop-shadow-sm" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-black text-foreground">85%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center w-full">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f97316]"></span><span className="text-[10px] text-muted-foreground">Basic Info</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ec4899]"></span><span className="text-[10px] text-muted-foreground">Resume</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span><span className="text-[10px] text-muted-foreground">Skills</span></div>
                </div>
              </div>

              {/* Stats Grid (2x2) */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                
                {/* Resume Score */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-sm p-5 rounded-xl relative overflow-hidden group flex flex-col justify-between border-none">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Resume Score</h3>
                  </div>
                  <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-5xl font-black text-foreground tracking-tighter">94</span>
                      <span className="text-lg font-medium text-muted-foreground">/100</span>
                    </div>
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">ATS Optimized</p>
                  </div>
                </div>

                {/* Level */}
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm p-5 rounded-xl relative overflow-hidden group flex flex-col justify-between border-none">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GraduationCap className="w-20 h-20 text-orange-500 rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-orange-500/20">
                      <GraduationCap className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Level</h3>
                  </div>
                  <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                    <p className="text-4xl font-black text-foreground tracking-tight">Senior</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm p-5 rounded-xl relative overflow-hidden group flex flex-col justify-between border-none">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase className="w-20 h-20 text-blue-500 rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Experience</h3>
                  </div>
                  <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                    <p className="text-4xl font-black text-foreground tracking-tighter">5<span className="text-xl font-bold text-muted-foreground ml-1">Yrs</span></p>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm p-5 rounded-xl relative overflow-hidden group flex flex-col justify-between border-none">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-20 h-20 text-purple-500 rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    </div>
                    <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Skills</h3>
                  </div>
                  <div className="relative z-10 mt-auto ml-auto text-right pr-2">
                    <p className="text-4xl font-black text-foreground tracking-tighter">24<span className="text-xl font-bold text-muted-foreground ml-1">Total</span></p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Row - Career Trajectory */}
            <div className="flex flex-col mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Your Career Trajectory</h2>
              </div>
              
              <div className="p-6 bg-card/50 backdrop-blur-sm rounded-xl relative overflow-hidden border border-border shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-50" />
                
                <div className="flex items-center justify-between w-full relative pt-2">
                   <div className="absolute left-10 right-10 top-7 h-0.5 bg-border -z-10" />
                   
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md text-orange-500 bg-orange-500/10">
                       <Clock className="w-4 h-4" />
                     </div>
                     <div className="text-center">
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 mb-1 inline-block">Short Term</span>
                       <p className="text-xs font-semibold text-foreground">Senior React Dev</p>
                     </div>
                   </div>

                   <div className="flex flex-col items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md text-amber-500 bg-amber-500/10">
                       <TrendingUp className="w-4 h-4" />
                     </div>
                     <div className="text-center">
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 mb-1 inline-block">Medium Term</span>
                       <p className="text-xs font-semibold text-foreground">Tech Lead</p>
                     </div>
                   </div>

                   <div className="flex flex-col items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shadow-md text-yellow-500 bg-yellow-500/10">
                       <Rocket className="w-4 h-4" />
                     </div>
                     <div className="text-center">
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 mb-1 inline-block">Long Term</span>
                       <p className="text-xs font-semibold text-foreground">Staff Engineer</p>
                     </div>
                   </div>

                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
