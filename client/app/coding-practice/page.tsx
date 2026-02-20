"use client"

import { useState, useEffect } from "react"
import { DynamicNavbar } from "@/components/dynamic-navbar"
import { ProtectedRoute } from "@/components/protected-route"
import CodingArena from "@/components/interview/CodingArena"
import { generateCodingQuestions, DSAQuestion } from "@/lib/dsa-service"
import { Spinner } from "@/components/ui/spinner"
import "@/app/dashboard/dashboard.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CodingPracticePage() {
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    // Initial load logic could go here if we wanted to pre-fetch
    setLoading(false);
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
        // Generate a fresh set of questions
        const newQuestions = await generateCodingQuestions("Medium");
        if (newQuestions && newQuestions.length > 0) {
            setQuestions(newQuestions);
            setSessionStarted(true);
        } else {
            console.error("No questions generated");
        }
    } catch (error) {
        console.error("Failed to start session:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="dashboard-theme min-h-screen bg-background flex flex-col">
        <DynamicNavbar />
        
        <main className="flex-1 pt-20 pb-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto w-full h-[calc(100vh-80px)]">
           {!sessionStarted ? (
             <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <Card className="max-w-md w-full p-8 text-center border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-8 h-8 text-primary"
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Ready to Practice?</h1>
                    <p className="text-muted-foreground mb-8">
                        Start an AI-powered coding session. We'll generate a unique problem tailored to challenge your skills.
                    </p>
                    
                    <Button 
                        size="lg" 
                        className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={startSession}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Generating Content...
                            </>
                        ) : (
                            "Start New Session"
                        )}
                    </Button>
                </Card>
             </div>
           ) : (
               /* Coding Arena Container */
               <div className="h-full rounded-xl overflow-hidden border border-border/40 shadow-2xl bg-card">
                   <CodingArena 
                     problems={questions} 
                     initialIsDarkMode={false}
                     onFinishCoding={(code) => {
                        console.log("Finished:", code);
                        // Future: Save submission
                     }}
                   />
               </div>
           )}
        </main>
      </div>
    </ProtectedRoute>
  )
}

