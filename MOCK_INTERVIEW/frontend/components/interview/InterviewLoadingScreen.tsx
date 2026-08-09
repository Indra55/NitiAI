"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewLoadingScreenProps {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}

export default function InterviewLoadingScreen({
  title = "Preparing Your Interview Arena",
  subtitle = "AI is crafting your custom technical questions and voice evaluation setup...",
  onRetry
}: InterviewLoadingScreenProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(stepTimer);
  }, []);

  const steps = [
    { label: "Parsing candidate profile & resume context", desc: "Reviewing your experience, skills, and selected interview rounds." },
    { label: "Crafting technical viva & behavioral scenarios", desc: "Building questions calibrated to your target difficulty." },
    { label: "Warming up Sarvam 105B voice engine", desc: "Preparing speech and evaluation models." }
  ];
  const progress = Math.min(92, 28 + activeStep * 32);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-white flex flex-col items-center justify-center p-8 text-slate-900 font-sans">
      <div className="w-full max-w-lg space-y-10">
        
        {/* Minimal Clean Header (No Logo, No Animations) */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest">Initialization</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-sm text-slate-500 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Setup Progress</span>
            <span className="text-slate-900 font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Spaced List of Steps */}
        <div className="space-y-4 pt-2">
          {steps.map((step, idx) => {
            const isDone = idx < activeStep;
            const isActive = idx === activeStep;

            return (
              <div 
                key={idx}
                className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                  isDone 
                    ? 'border-slate-200 bg-white text-slate-900' 
                    : isActive 
                    ? 'border-orange-500 bg-white text-slate-900 shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-xs text-slate-300">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${isActive ? 'text-slate-900' : isDone ? 'text-slate-800' : 'text-slate-300'}`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs ${isActive || isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Retry */}
        {onRetry && (
          <div className="pt-4">
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl h-11"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2 text-slate-400" /> Force Retry AI
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
