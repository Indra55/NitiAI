"use client";

import React, { useState, useEffect, use, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import InterviewNavbar from '@/components/interview/InterviewNavbar';
import Lobby from '@/components/interview/Lobby';
import CodingArena from '@/components/interview/CodingArena';
import VoiceArena from '@/components/interview/VoiceArena';
import InterviewLoadingScreen from '@/components/interview/InterviewLoadingScreen';
import { generateInterviewContent, InterviewContent } from '@/lib/ai-generator';
import { toaster } from '@/components/ui/toaster';
import { Brain } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function InterviewPage({ params: paramsPromise }: { params: Promise<{ roomId: string }> }) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId;
  const username = searchParams.get('username') || `Candidate_${Math.floor(Math.random() * 1000)}`;

  const [socket, setSocket] = useState<any>(null);
  const [phase, setPhase] = useState<'lobby' | 'coding' | 'voice' | 'results'>('lobby');
  const [participants, setParticipants] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins
  const [content, setContent] = useState<InterviewContent | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isGeneratingState, setIsGeneratingState] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    const configStr = searchParams.get('config');
    let initialConfig = null;
    try {
      initialConfig = configStr ? JSON.parse(decodeURIComponent(configStr)) : null;
    } catch (err) {
      console.error("Error parsing config from URL:", err);
    }

    newSocket.emit('join-room', { roomId, username, config: initialConfig });
    console.log("Joined room:", { roomId, username, hasConfig: !!initialConfig });

    newSocket.on('room-update', (room: any) => {
      console.log("Room Update received:", room);
      setParticipants(room.participants);
      setPhase(room.status);
      
      if (room.config && room.config.duration) {
        let totalSeconds = 1800; // Default 30m
        if (room.config.duration === 'auto') {
          const dsaTime = (room.config.includeDSA !== false ? (room.config.dsaCount || 1) : 0) * 15;
          const voiceTime = (room.config.vivaCount || 2) * 5;
          totalSeconds = (dsaTime + voiceTime) * 60;
        } else {
          totalSeconds = parseInt(room.config.duration) * 60;
        }
        setTimeRemaining(totalSeconds);
      }

      if (room.content) {
        console.log("Content found in room, updating state.");
        setContent(room.content);
      } else if (room.config && initialConfig && !generatingRef.current) {
        console.log("Conditions met for creator generation. Starting AI trigger...");
        triggerGeneration(newSocket, room.config);
      } else {
        console.log("Generation conditions not met:", { 
          hasRoomConfig: !!room.config, 
          difficulty: room.config?.difficulty,
          isCreator: !!initialConfig, 
          isAlreadyGenerating: generatingRef.current 
        });
      }
    });

    newSocket.on('start-interview', (room) => {
      setParticipants(room.participants);
      setPhase(room.status);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (phase === 'coding' && content && timeRemaining > 0) {
      const timer = setInterval(() => setTimeRemaining(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase, content, timeRemaining]);

  const triggerGeneration = async (socketInstance: any, config: any) => {
    if (generatingRef.current) {
        console.log("Generation already in progress, skipping trigger.");
        return;
    }
    
    generatingRef.current = true;
    setIsGeneratingState(true);
    console.log(">>> AI Generation START:", { config, roomId });
    
    toaster.create({
      title: "Generating Level...",
      description: "AI is crafting your custom interview challenges.",
      type: "info"
    });

    try {
      console.log("Calling generateInterviewContent...");
      const generatedContent = await generateInterviewContent({
        difficulty: config.difficulty || 'Medium',
        dsaCount: (config.includeDSA !== false) ? (config.dsaCount || 1) : 0,
        vivaCount: config.vivaCount || 2,
        type: config.type || 'technical',
        rounds: config.rounds || ['technical', 'behavioral', 'cultural'],
        resumeContext: config.resumeText || config.resumeContext || ''
      });
      
      console.log("AI returned content successfully:", generatedContent);
      
      setContent(generatedContent);
      socketInstance.emit('update-room-content', { roomId, content: generatedContent });
      console.log("Content synced via socket.");
      
      toaster.create({
        title: "Challenges Ready!",
        description: "Your custom interview has been generated.",
        type: "success"
      });
    } catch (error: any) {
      console.error("!!! Generation Failed:", error);
      
      // FALLBACK CONTENT
      console.log("Using fallback content due to error.");
      const fallbackContent: InterviewContent = {
        dsa: config.includeDSA !== false ? [{
          title: "Two Sum",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          difficulty: "Easy",
          example: { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
          testCases: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
          ]
        }] : [],
        voice: [{
          question: "Explain the time complexity of your solution.",
          answer: "The time complexity is O(n) using a hash map.",
          round: "technical"
        }]
      };
      
      setContent(fallbackContent);
      socketInstance.emit('update-room-content', { roomId, content: fallbackContent });
      console.log("Fallback content synced.");

      toaster.create({
        title: "AI Timeout / Error",
        description: "The AI is busy. Using standard mode instead.",
        type: "error"
      });
    } finally {
      console.log(">>> AI Generation FINISHED (Resetting state)");
      generatingRef.current = false;
      setIsGeneratingState(false);
    }
  };

  const handleReady = (status: boolean) => {
    if (socket) {
      socket.emit('player-ready', { roomId, isReady: status });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <InterviewNavbar 
        roomId={roomId} 
        phase={phase} 
        timeRemaining={timeRemaining} 
        isDarkMode={isDarkMode && phase === 'coding'}
      />
      
      <main className="animate-in fade-in duration-500">
        {phase === 'lobby' && (
           <Lobby 
             roomId={roomId} 
             participants={participants} 
             onReady={handleReady} 
           />
        )}
        {phase === 'coding' && content && (
          <CodingArena 
            problems={content.dsa} 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onFinishCoding={(finalCode) => {
              console.log("Solution submitted:", finalCode);
              const configStr = searchParams.get('config');
              let cfg: any = null;
              try { cfg = configStr ? JSON.parse(decodeURIComponent(configStr)) : null; } catch {}
              const isCodingOnly = cfg?.type === 'coding' || (!cfg?.rounds || cfg.rounds.length === 0);

              if (isCodingOnly) {
                if (socket) socket.emit('update-room-status', { roomId, status: 'results' });
                setPhase('results');
                router.push(`/interview/${roomId}/results`);
              } else {
                if (socket) socket.emit('update-room-status', { roomId, status: 'voice' });
                setPhase('voice');
              }
            }}
          />
        )}
        {phase === 'coding' && !content && (
          <InterviewLoadingScreen 
            title="Crafting Technical Challenges"
            subtitle="Synthesizing custom DSA problems and test cases..."
            onRetry={() => {
              const configStr = searchParams.get('config');
              const config = configStr ? JSON.parse(decodeURIComponent(configStr)) : null;
              if (config && socket) triggerGeneration(socket, config);
              else toaster.create({ title: "Retry Unavailable", description: "Config missing in URL.", type: "error" });
            }}
          />
        )}
        {phase === 'voice' && content && (
          <VoiceArena 
            questions={content.voice} 
            onFinish={() => {
              if (socket) {
                socket.emit('update-room-status', { roomId, status: 'results' });
              }
              setPhase('results');
              router.push(`/interview/${roomId}/results`);
            }}
          />
        )}
        {phase === 'voice' && !content && (
          <InterviewLoadingScreen 
            title="Preparing Sarvam Voice Arena"
            subtitle="Configuring voice evaluation protocol & multilingual models..."
          />
        )}
      </main>
    </div>
  );
}
