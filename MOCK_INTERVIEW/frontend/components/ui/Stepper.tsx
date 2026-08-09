"use client";

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = "" }: StepperProps) {
  return (
    <div className={`w-full flex items-center justify-between gap-4 py-2 ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-orange-500 text-white'
                    : isCompleted
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-medium truncate ${
                    isCurrent
                      ? 'text-slate-900 font-semibold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
