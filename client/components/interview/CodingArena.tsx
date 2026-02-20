"use client";

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, Layout, Terminal, Moon, Sun, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AIChatModal from './AIChatModal';
import { executeCode, DSAQuestion } from '@/lib/dsa-service';
import { Badge } from '@/components/ui/badge';

interface CodingArenaProps {
  problems: DSAQuestion[];
  initialIsDarkMode?: boolean;
  onFinishCoding?: (code: string) => void;
}

const BOILERPLATES: Record<string, string> = {
  javascript: `function solution(nums, target) {\n  // Write your code here\n  \n}`,
  python: `def solution(nums, target):\n    # Write your code here\n    pass`,
  cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`
};

const CodingArena = ({ problems = [], initialIsDarkMode = false, onFinishCoding }: CodingArenaProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const problem = problems[currentIdx];
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(initialIsDarkMode);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(problem?.boilerplates?.['javascript'] || BOILERPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // Sync code when problem or language changes
  useEffect(() => {
     if (problem) {
         const newCode = problem.boilerplates?.[language as keyof typeof problem.boilerplates] || BOILERPLATES[language] || "";
         setCode(newCode);
         setOutput('');
         setIsSolved(false);
     }
  }, [currentIdx, language, problem]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
  };

  const handleRunCode = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setOutput("Compiling and running against test cases...");

    try {
      const result = await executeCode(code, language, problem?.testCases || []);

      let consoleLogs = result.compilerOutput ? `[Compiler Output]\n${result.compilerOutput}\n\n` : "";

        if (result.results && result.results.length > 0) {
            consoleLogs += result.results.map((res: any, i: number) => {
            let log = `> Test Case ${i + 1}: ${res.passed ? '✅ PASS' : '❌ FAIL'}\n  Input: ${res.input}\n  Expected: ${res.expected}\n  Output: ${res.actual}`;
            if (res.stdout) {
                log += `\n  Stdout: ${res.stdout}`;
            }
            return log;
            }).join('\n\n');
        } else {
            consoleLogs += result.success ? "All tests passed!" : (result.error || "Execution failed.");
        }

      setOutput(consoleLogs);
      setIsSolved(result.success);

      if (result.success) {
        toast({
            title: "Tests Passed!",
            description: "Your solution passed all sample cases.",
            variant: "default",
            className: "bg-green-500 text-white border-none"
        });
      } else {
        toast({
            title: "Tests Failed",
            description: "Check the console for errors.",
            variant: "destructive"
        });
      }

    } catch (err: any) {
      console.error(err);
      setOutput(`Error: ${err.message || "Failed to contact code runner service."}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(prev => prev + 1);
      toast({
        title: `Question ${currentIdx + 2}`,
        description: "Moving to the next challenge.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!isSolved) {
      toast({
        title: "Incomplete Solution",
        description: "You must pass the tests before submitting.",
        variant: "destructive"
      });
      return;
    }

    toast({
        title: "Submission Successful",
        description: "Proceeding to next step...",
        className: "bg-green-500 text-white border-none"
    });

    if (onFinishCoding) onFinishCoding(code);
  };

  if (!problem) return <div className="p-8 text-center">Loading problem...</div>;

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-background text-foreground'}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Problem Panel */}
        <div className={`w-1/3 p-6 overflow-y-auto border-r transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-border/40 bg-card/50'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-primary/10' : 'bg-primary/10'}`}>
                <Layout className={`w-5 h-5 text-primary`} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">{problem.title}</h2>
            </div>
            <Badge variant="outline" className={
                problem.difficulty === "Easy" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" :
                problem.difficulty === "Medium" ? "text-amber-500 border-amber-500/20 bg-amber-500/10" :
                "text-red-500 border-red-500/20 bg-red-500/10"
            }>
                {problem.difficulty}
            </Badge>
          </div>

          <div className={`space-y-6 text-sm leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
            <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-foreground'}`}>{problem.description}</p>

            <div className={`p-5 rounded-xl border font-mono text-xs transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-muted/30 border-border/50'
              }`}>
              <span className="text-primary font-bold tracking-widest uppercase block mb-2 opacity-70">Example</span>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="opacity-50">Input:</span>
                  <code className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-foreground'}`}>{problem.example.input}</code>
                </div>
                <div className="flex gap-2">
                  <span className="opacity-50">Output:</span>
                  <code className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-foreground'}`}>{problem.example.output}</code>
                </div>
              </div>
            </div>

            {problem.testCases && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">Sample Test Cases</h3>
                <div className="space-y-3">
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className={`p-4 rounded-xl border font-mono text-[11px] transition-colors ${isDarkMode ? 'bg-gray-900/30 border-gray-800/50' : 'bg-card border-border/50 shadow-sm'
                      }`}>
                      <div className="flex gap-2 mb-1">
                        <span className="opacity-40">IN:</span>
                        <span className="">{tc.input}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-40 text-primary">OUT:</span>
                        <span className="text-primary font-bold">{tc.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className={`w-2/3 flex flex-col ${isDarkMode ? 'bg-black' : 'bg-muted/10'}`}>
          {/* Header */}
          <div className={`h-14 border-b flex items-center justify-between px-4 transition-colors ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-background border-border/40'}`}>
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`bg-transparent text-sm font-bold uppercase tracking-wide border-none focus:ring-0 cursor-pointer transition-colors outline-none ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAIModalOpen(true)}
                className={`gap-2 font-semibold ${isDarkMode ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-400/10' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'}`}
              >
                <Sparkles size={14} /> AI Help
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRunCode}
                variant="outline"
                disabled={isEvaluating}
                size="sm"
                className="font-bold border-primary/20 hover:border-primary/50 text-foreground"
              >
                {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2 text-primary" />} Run
              </Button>

              {currentIdx < problems.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isSolved || isEvaluating}
                  size="sm"
                  className="font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isSolved || isEvaluating}
                  size="sm"
                  className="font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />} Submit
                </Button>
              )}
            </div>
          </div>

          <div className={`flex-1 relative border-b transition-colors ${isDarkMode ? 'border-gray-800' : 'border-border/40 bg-background'}`}>
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
                padding: { top: 24, bottom: 24 },
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                renderLineHighlight: 'none',
                hideCursorInOverviewRuler: true,
                bracketPairColorization: { enabled: true },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                },
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: "allDocuments",
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                parameterHints: { enabled: true },
              }}
            />
          </div>

          {/* Console */}
          <div className={`h-1/3 overflow-hidden flex flex-col transition-colors ${isDarkMode ? 'bg-gray-950' : 'bg-muted/5'}`}>
            <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-500 border-gray-800' : 'text-muted-foreground border-border/40'
              }`}>
              <Terminal size={12} className="text-primary" />
              Console Output
            </div>
            <div className={`flex-1 p-4 font-mono text-sm font-medium overflow-y-auto transition-colors ${isDarkMode ? 'bg-black text-emerald-400/90' : 'bg-background text-foreground'
              }`}>
              <pre>{output || "Click 'Run' to execute test cases against your code..."}</pre>
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
