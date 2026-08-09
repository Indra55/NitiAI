"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, Layout, Terminal, Moon, Sun, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import AIChatModal from './AIChatModal';
import { evaluateCode } from '@/lib/ai-generator';

interface CodingArenaProps {
  problems: any[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onFinishCoding?: (code: string) => void;
}

const BOILERPLATES: Record<string, string> = {
  javascript: `function solution(nums, target) {\n  // Write your solution here\n  \n}`,
  python: `def solution(nums, target):\n    # Write your solution here\n    pass`,
  cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`
};

const CodingArena = ({ problems = [], isDarkMode, setIsDarkMode, onFinishCoding }: CodingArenaProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const problem = problems[currentIdx];

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(problems[0]?.boilerplates?.['javascript'] || BOILERPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    const newCode = problem?.boilerplates?.[newLang] || BOILERPLATES[newLang] || "";
    setCode(newCode);
    setIsSolved(false);
  };

  const handleRunCode = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setOutput("Compiling code against test cases...");

    try {
      const result = await evaluateCode({
        code,
        language,
        testCases: problem?.testCases || [],
        problemTitle: problem?.title || "Unknown Problem"
      });

      let consoleLogs = result.compilerOutput ? `[Compiler Output]\n${result.compilerOutput}\n\n` : "";

      if (result.results && result.results.length > 0) {
        consoleLogs += result.results.map((res: any, i: number) => {
          let log = `> Test Case ${i + 1}: ${res.passed ? 'PASSED' : 'FAILED'}\n  Input: ${res.input}\n  Expected: ${res.expected}\n  Output: ${res.actual}`;
          if (res.stdout) {
            log += `\n  Stdout: ${res.stdout}`;
          }
          return log;
        }).join('\n\n');
      } else {
        consoleLogs += result.success ? "All test cases passed." : "Test suite did not produce detailed logs.";
      }

      setOutput(consoleLogs);
      setIsSolved(result.success);

      toaster.create({
        title: result.success ? "Test Cases Passed" : "Tests Failed",
        description: result.success ? "Your code passed all validation tests." : "Check the output console for details.",
        type: result.success ? "success" : "error",
      });
    } catch (err: any) {
      console.error(err);
      setOutput(`Error: ${err.message || "Execution service unavailable."}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(prev => prev + 1);
      const nextProblem = problems[currentIdx + 1];
      setCode(nextProblem?.boilerplates?.[language] || BOILERPLATES[language] || BOILERPLATES.javascript);
      setOutput("");
      setIsSolved(false);
    }
  };

  const handleSubmit = async () => {
    if (!isSolved) {
      toaster.create({
        title: "Validation Required",
        description: "Please run and pass all test cases before submitting.",
        type: "warning"
      });
      return;
    }

    setIsEvaluating(true);
    try {
      toaster.create({
        title: "Solutions Submitted",
        description: "Code saved. Advancing to Voice Viva.",
        type: "success",
      });

      if (onFinishCoding) onFinishCoding(code);
    } catch (err) {
      toaster.create({ title: "Submission Error", type: "error" });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Problem Description Panel */}
        <div className={`w-1/3 p-8 overflow-y-auto border-r ${isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5">
              <Layout className="w-5 h-5 text-orange-500" />
              <h2 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {problem?.title || "Loading Problem..."}
              </h2>
            </div>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
              isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}>
              {problem?.difficulty || "Medium"}
            </span>
          </div>

          <div className={`space-y-6 text-sm leading-relaxed font-normal ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            <p className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              {problem?.description || "Find two numbers in an array that add up to the specified target value."}
            </p>

            {/* Example Box */}
            <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
              isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-800'
            }`}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Example</span>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <span className="text-slate-400">Input:</span>
                  <code className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{problem?.example?.input || "nums = [2,7,11,15], target = 9"}</code>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-400">Output:</span>
                  <code className="font-semibold text-orange-500">{problem?.example?.output || "[0,1]"}</code>
                </div>
              </div>
            </div>

            {/* Test Cases */}
            {problem?.testCases && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sample Cases</h3>
                <div className="space-y-2">
                  {problem.testCases.map((tc: any, i: number) => (
                    <div key={i} className={`p-3.5 rounded-xl border font-mono text-xs space-y-1 ${
                      isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-800'
                    }`}>
                      <div className="flex gap-2">
                        <span className="text-slate-400">In:</span>
                        <span>{tc.input}</span>
                      </div>
                      <div className="flex gap-2 text-orange-500 font-semibold">
                        <span className="text-slate-400">Out:</span>
                        <span>{tc.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor & Console */}
        <div className={`w-2/3 flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          
          {/* Header Controls */}
          <div className={`h-14 border-b flex items-center justify-between px-6 ${
            isDarkMode ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
          }`}>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`bg-transparent text-xs font-semibold uppercase tracking-wider border-none outline-none cursor-pointer ${
                  isDarkMode ? 'text-white bg-slate-900' : 'text-slate-900 bg-white'
                }`}
              >
                <option value="javascript" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>JavaScript</option>
                <option value="python" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Python</option>
                <option value="cpp" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>C++</option>
              </select>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <Button
                onClick={() => setIsAIModalOpen(true)}
                variant="outline"
                className={`h-9 px-3.5 rounded-xl font-medium text-xs gap-1.5 ${
                  isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles size={14} className="text-orange-500" /> AI Assistant
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleRunCode}
                disabled={isEvaluating}
                variant="outline"
                className={`h-9 px-4 font-medium text-xs rounded-xl ${
                  isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2 text-slate-400" />} Run Code
              </Button>

              {currentIdx < problems.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isSolved || isEvaluating}
                  className="h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs rounded-xl transition-colors disabled:opacity-40"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isSolved || isEvaluating}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-colors disabled:opacity-40"
                >
                  {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />} Submit Solution
                </Button>
              )}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className={`flex-1 relative border-b ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
            <Editor
              key={language}
              height="100%"
              path={`file:///main.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}`}
              language={language}
              theme={isDarkMode ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                renderLineHighlight: 'none',
              }}
            />
          </div>

          {/* Output Console */}
          <div className={`h-1/3 flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-900'}`}>
            <div className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider border-b flex items-center gap-2 ${
              isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-900' : 'border-slate-200 text-slate-500 bg-white'
            }`}>
              <Terminal size={13} className="text-orange-500" />
              Console Output
            </div>
            <div className={`flex-1 p-5 font-mono text-xs overflow-y-auto ${
              isDarkMode ? 'bg-slate-950 text-orange-400' : 'bg-slate-50 text-slate-800'
            }`}>
              <pre className="whitespace-pre-wrap">{output || "Click 'Run Code' to test your solution..."}</pre>
            </div>
          </div>

        </div>
      </div>

      <AIChatModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentCode={code}
        problem={problem}
      />
    </div>
  );
};

export default CodingArena;
