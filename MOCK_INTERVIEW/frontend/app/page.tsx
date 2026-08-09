"use client";

import * as React from "react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, 
  Users, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  ArrowLeft, 
  Wrench, 
  Award 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { Stepper, StepItem } from "@/components/ui/Stepper";

export default function Dashboard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [roomToJoin, setRoomToJoin] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [config, setConfig] = useState({
    type: 'hybrid',
    capacity: 5,
    includeDSA: true,
    dsaCount: 1,
    vivaCount: 2,
    difficulty: 'medium',
    duration: 'auto',
    candidateContext: '',
    useResume: true,
    rounds: ['technical', 'behavioral', 'cultural'] as Array<'technical' | 'behavioral' | 'cultural'>,
  });

  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const totalSteps = 3;

  const stepperSteps: StepItem[] = [
    { id: '1', title: 'Personal Profile', description: 'Candidate identity' },
    { id: '2', title: 'Session Specs', description: 'Difficulty & timing' },
    { id: '3', title: 'Interview Context', description: 'Rounds & summary' }
  ];

  // Auto-fetch latest uploaded candidate resume from main server database
  useEffect(() => {
    const fetchStoredResume = async () => {
      setIsLoadingResume(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const mainServerUrl = process.env.NEXT_PUBLIC_MAIN_SERVER_URL || 'http://localhost:5555';
        
        let res: Response | null = null;

        try {
          res = await fetch(`${mainServerUrl}/api/resume/info`, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        } catch (e) {
          console.warn("Auth token resume fetch failed, falling back to latest stored resume.");
        }

        if (!res || !res.ok) {
          res = await fetch(`${mainServerUrl}/api/resume/latest`, {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        }

        if (res && res.ok) {
          let data: any = null;
          try {
            data = await res.json();
          } catch {
            console.warn("Stored resume response was not valid JSON.");
          }
          if (data && (data.extracted_name || data.professional_summary || data.technical_skills)) {
            if (data.extracted_name) {
              setUsername(data.extracted_name);
            }

            const formattedSummary = [
              data.extracted_name ? `Candidate Name: ${data.extracted_name}` : '',
              data.professional_title ? `Title: ${data.professional_title}` : '',
              data.proficiency_level ? `Candidate Level: ${data.proficiency_level}` : '',
              data.career_goal_short ? `Short-term Goal: ${data.career_goal_short}` : '',
              data.career_goal_long ? `Long-term Goal: ${data.career_goal_long}` : '',
              data.active_roadmap_role ? `Target Roadmap Role: ${data.active_roadmap_role}` : '',
              data.years_of_experience ? `Experience: ${data.years_of_experience} years` : '',
              data.professional_summary ? `Summary: ${data.professional_summary}` : '',
              Array.isArray(data.technical_skills) && data.technical_skills.length > 0 
                ? `Skills: ${data.technical_skills.join(', ')}` 
                : '',
              Array.isArray(data.projects) && data.projects.length > 0
                ? `Projects: ${data.projects.map((p: any) => typeof p === 'string' ? p : p.name || p.title).join('; ')}`
                : ''
            ].filter(Boolean).join('\n');

            if (formattedSummary) {
              setConfig(prev => ({
                ...prev,
                candidateContext: formattedSummary
              }));
              toaster.create({
                title: "Resume Loaded",
                description: `Imported parsed resume profile for ${data.extracted_name || 'Candidate'}.`,
                type: "info"
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not auto-fetch stored resume from DB:", err);
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchStoredResume();
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !username.trim()) {
      toaster.create({
        title: "Name Required",
        description: "Please enter your name or username before continuing.",
        type: "warning",
      });
      return;
    }
    if (currentStep === 2 && config.rounds.length === 0) {
      toaster.create({
        title: "Round Required",
        description: "Please select at least one interview round.",
        type: "warning",
      });
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateRoom();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const configQuery = encodeURIComponent(JSON.stringify(config));
    const targetUrl = `/interview/${roomId}?username=${encodeURIComponent(username)}&config=${configQuery}`;
    router.push(targetUrl);
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      toaster.create({
        title: "Profile Missing",
        description: "Please enter a username first!",
        type: "warning",
      });
      return;
    }
    if (!roomToJoin.trim()) {
      toaster.create({
        title: "Room ID Required",
        description: "Please enter a Room ID to join.",
        type: "warning",
      });
      return;
    }

    const cleanedRoomId = roomToJoin.trim().toUpperCase();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/rooms/${cleanedRoomId}`);
      if (res.ok) {
        router.push(`/interview/${cleanedRoomId}?username=${encodeURIComponent(username)}`);
      } else {
        toaster.create({
          title: "Room Not Found",
          description: "This Room ID does not exist.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error checking room:", error);
    }
  };

  const toggleRound = (roundId: 'technical' | 'behavioral' | 'cultural') => {
    setConfig(prev => {
      const exists = prev.rounds.includes(roundId);
      const updated = exists 
        ? prev.rounds.filter(r => r !== roundId)
        : [...prev.rounds, roundId];
      return { ...prev, rounds: updated };
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 sm:p-12 font-sans">
      <div className="w-full max-w-2xl space-y-10">
        
        {/* Executive Minimal Header (No Logo Badges) */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Mock Interview Setup
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Configure your personalized practice session with Sarvam AI.
          </p>
        </div>

        {/* Stepper Navigation */}
        <div className="pb-4 border-b border-slate-100">
          <Stepper steps={stepperSteps} currentStep={currentStep} />
        </div>

        {/* Main Content Area */}
        <div className="space-y-8 min-h-80">
          
          {/* Step 1: Personal Identity */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider block">
                  Full Name
                </Label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
                  className="h-12 bg-white border-slate-200 rounded-xl text-slate-900 text-sm font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-0"
                />
                <p className="text-xs text-slate-400 font-normal">
                  This will be used by the AI interviewer to personalize questions and feedback.
                </p>
              </div>

              {/* Quick Join Option */}
              <div className="pt-6 border-t border-slate-100">
                {!showJoinInput ? (
                  <button
                    onClick={() => setShowJoinInput(true)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Joining an existing room? Enter code</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Room Code (e.g. X7K9P2)"
                      value={roomToJoin}
                      onChange={(e) => setRoomToJoin(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-xl uppercase text-xs font-medium"
                    />
                    <Button
                      onClick={handleJoinRoom}
                      className="h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 text-xs rounded-xl"
                    >
                      Join Room
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Session Specifications */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider block">
                    Session Format
                  </Label>
                  <Select
                    value={config.type}
                    onValueChange={(v) => {
                      if (v === 'viva') {
                        setConfig(prev => ({ ...prev, type: v, includeDSA: false, dsaCount: 0, vivaCount: prev.vivaCount || 2 }));
                      } else if (v === 'coding') {
                        setConfig(prev => ({ ...prev, type: v, includeDSA: true, dsaCount: 1, vivaCount: 0, rounds: [] }));
                      } else {
                        setConfig(prev => ({ ...prev, type: v, includeDSA: true, dsaCount: 1, vivaCount: 2, rounds: ['technical', 'behavioral', 'cultural'] }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-xs font-normal text-slate-900">
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">Hybrid (Viva + Coding)</SelectItem>
                      <SelectItem value="viva">Voice Viva Only</SelectItem>
                      <SelectItem value="coding">Coding Arena Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider block">
                    Difficulty Level
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <Button
                        key={d}
                        onClick={() => setConfig({ ...config, difficulty: d.toLowerCase() })}
                        className={`h-12 font-medium text-xs rounded-xl border transition-all ${
                          config.difficulty === d.toLowerCase()
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider block">
                  Estimated Duration
                </Label>
                <Select value={config.duration} onValueChange={(v) => setConfig({ ...config, duration: v })}>
                  <SelectTrigger className="h-12 bg-white border-slate-200 rounded-xl text-xs font-normal text-slate-900">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Adaptive (Calculated from rounds)</SelectItem>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Multi-Round & Resume Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              {/* Select Rounds */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider block">
                  Select Rounds
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'technical', title: 'Technical Viva', icon: Wrench },
                    { id: 'behavioral', title: 'Behavioral', icon: Users },
                    { id: 'cultural', title: 'Culture Fit', icon: Award },
                  ].map((r) => {
                    const isSelected = config.rounds.includes(r.id as any);
                    return (
                      <div
                        key={r.id}
                        onClick={() => toggleRound(r.id as any)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-white text-slate-900 font-medium shadow-sm'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs font-medium flex items-center gap-2.5">
                          <r.icon className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                          {r.title}
                        </span>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-orange-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Candidate Resume Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-900 font-medium text-xs uppercase tracking-wider">
                    Resume Context & Background
                  </Label>
                  {isLoadingResume && (
                    <span className="text-xs text-orange-600 font-normal">Fetching resume...</span>
                  )}
                </div>
                <Textarea
                  rows={5}
                  value={config.candidateContext}
                  onChange={(e) => setConfig({ ...config, candidateContext: e.target.value })}
                  placeholder="Paste your skills, past projects, or experience summary here..."
                  className="bg-white border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:border-orange-500"
                />
              </div>

            </div>
          )}

        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Button
            disabled={currentStep === 0}
            onClick={handleBack}
            className="h-11 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-5 text-xs rounded-xl disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <Button
            onClick={handleNext}
            className="h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 text-xs rounded-xl transition-colors"
          >
            {currentStep === totalSteps - 1 ? (
              <>Start Session <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
