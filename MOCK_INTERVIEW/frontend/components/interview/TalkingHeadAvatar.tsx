"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Bot } from 'lucide-react';

interface TalkingHeadAvatarProps {
  speechText?: string;
  isAiSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
}

const LOCAL_RECRUITER_GLB = "/avatars/male_recruiter.glb";

export default function TalkingHeadAvatar({
  speechText = "",
  isAiSpeaking = false,
  isListening = false,
  className = ""
}: TalkingHeadAvatarProps) {
  const avatarDivRef = useRef<HTMLDivElement>(null);
  const headInstanceRef = useRef<any>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastSpokenTextRef = useRef<string>("");
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!avatarDivRef.current) return;
    let isMounted = true;

    const initTalkingHead = async () => {
      try {
        setIsLoadingModel(true);
        setLoadError(null);

        // Dynamically import TalkingHead on client side with fallback
        let TalkingHeadModule: any = null;
        try {
          // @ts-ignore
          TalkingHeadModule = await import('@met4citizen/talkinghead');
        } catch (importErr) {
          console.warn("3D TalkingHead module not installed on host — rendering AI Recruiter mode.");
        }

        if (!isMounted || !avatarDivRef.current) return;

        if (!TalkingHeadModule || !TalkingHeadModule.TalkingHead) {
          setLoadError("Executive AI Recruiter");
          setIsLoadingModel(false);
          return;
        }

        const { TalkingHead } = TalkingHeadModule;

        // Instantiate 3D TalkingHead with executive camera view
        const head = new TalkingHead(avatarDivRef.current, {
          ttsEndpoint: null,
          cameraView: "head",
          cameraDistance: 0,
          cameraX: 0,
          cameraY: 0,
          lightAmbientColor: 0xffffff,
          lightAmbientIntensity: 1.8,
          lightDirectColor: 0xfff5ea,
          lightDirectIntensity: 2.5,
          avatarMood: "neutral",
          avatarIdleEyeContact: 0.8,
          avatarSpeakingEyeContact: 0.95,
          avatarListeningEyeContact: 0.95,
          lipsyncModules: ["en"],
          dracoEnabled: false,
        });

        headInstanceRef.current = head;

        // Load local 3D recruiter avatar model
        await head.showAvatar({
          url: LOCAL_RECRUITER_GLB,
          body: "F",
          avatarMood: "neutral",
          lipsyncLang: "en",
        });

        if (isMounted) {
          setIsLoadingModel(false);
          if (head.makeEyeContact) head.makeEyeContact(10000);
        }
      } catch (err: any) {
        console.warn("3D TalkingHead notice:", err.message || err);
        if (isMounted) {
          setLoadError("Executive AI Recruiter");
          setIsLoadingModel(false);
        }
      }
    };

    initTalkingHead();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (headInstanceRef.current) {
        try {
          if (headInstanceRef.current.stop) headInstanceRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (avatarDivRef.current) {
        while (avatarDivRef.current.firstChild) {
          avatarDivRef.current.removeChild(avatarDivRef.current.firstChild);
        }
      }
    };
  }, []);

  // Speak text via TalkingHead viseme processor when speech text updates
  useEffect(() => {
    if (!headInstanceRef.current || !speechText || speechText === lastSpokenTextRef.current) return;

    try {
      lastSpokenTextRef.current = speechText;

      if (headInstanceRef.current.speakText) {
        headInstanceRef.current.speakText(speechText);
      }
    } catch (err) {
      console.warn("Avatar speech synthesis warning:", err);
    }
  }, [speechText]);

  // Adjust avatar mood when listening vs speaking
  useEffect(() => {
    if (!headInstanceRef.current) return;
    try {
      if (isListening && headInstanceRef.current.setMood) {
        headInstanceRef.current.setMood('neutral');
        if (headInstanceRef.current.makeEyeContact) {
          headInstanceRef.current.makeEyeContact(10000);
        }
      } else if (isAiSpeaking && headInstanceRef.current.setMood) {
        headInstanceRef.current.setMood('happy');
      }
    } catch (e) {
      // ignore
    }
  }, [isListening, isAiSpeaking]);

  return (
    <div className={`relative flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm ${className}`}>
      
      {/* 3D Canvas / Avatar Container */}
      <div className="w-72 h-72 relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border border-slate-800 shadow-inner">
        
        {/* Unmanaged Canvas DOM Host Node for Three.js */}
        <div ref={avatarDivRef} className="w-full h-full absolute inset-0" />

        {isLoadingModel && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm text-slate-300 space-y-2">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">Loading AI Recruiter Avatar...</span>
            <span className="text-[10px] text-slate-400 font-mono">3D Viseme Model</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-300 space-y-3 p-4 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bot className="w-10 h-10 text-white" />
              </div>
              {isAiSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                </span>
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-100 block">Executive AI Recruiter</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Socratic Technical Interviewer</span>
            </div>
          </div>
        )}
      </div>

      {/* Recruiter Status Label */}
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700">
        <span className={`w-2 h-2 rounded-full ${
          isAiSpeaking ? 'bg-orange-500 animate-pulse' : isListening ? 'bg-emerald-500' : 'bg-slate-400'
        }`} />
        <span>
          {isAiSpeaking ? 'AI Recruiter Speaking...' : isListening ? 'Listening to Candidate' : 'AI Recruiter Ready'}
        </span>
      </div>
    </div>
  );
}
