"use client";

import { useState } from 'react';

export interface LanguageEvalResult {
  clarityScore: number;
  grammarScore: number;
  relevanceScore: number;
  logicalCoherenceScore: number;
  totalScore: number; // out of 20
  requiresBridge: boolean; // true if totalScore < 24 (out of 40)
  explanation: string;
  grammarIssues: string[];
  suggestions: string[];
}

export function useLanguageEval() {
  const [evalResult, setEvalResult] = useState<LanguageEvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);

  const evaluateAnswer = async (
    userAnswer: string,
    questionContext: string = "Technical Question",
    nativeLanguage: string = "hi-IN"
  ) => {
    if (!userAnswer || userAnswer.trim().length === 0) return null;

    setIsEvaluating(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

    try {
      const res = await fetch(`${backendUrl}/api/language-eval/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAnswer,
          questionContext,
          nativeLanguage
        })
      });

      if (res.ok) {
        const data: LanguageEvalResult = await res.json();
        setEvalResult(data);

        // Threshold check: if totalScore < 8 (out of 20), trigger bridge modal
        if (data.requiresBridge || data.totalScore < 24) {
          setIsBridgeModalOpen(true);
        }
        return data;
      }
    } catch (err) {
      console.warn("Async language evaluation call error:", err);
    } finally {
      setIsEvaluating(false);
    }
    return null;
  };

  const closeBridgeModal = () => setIsBridgeModalOpen(false);

  return {
    evalResult,
    isEvaluating,
    isBridgeModalOpen,
    evaluateAnswer,
    closeBridgeModal,
    setIsBridgeModalOpen
  };
}
