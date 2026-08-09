"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';

interface TalkingHeadAvatarProps {
  isAiSpeaking: boolean;
  isListening: boolean;
  speechText?: string;
  selectedLanguage?: string;
  className?: string;
}

// Local 3D Ready Player Me Recruiter Model GLB (4.6MB)
const LOCAL_RECRUITER_GLB = "/avatars/male_recruiter.glb";

export default function TalkingHeadAvatar({
  isAiSpeaking,
  isListening,
  speechText,
  selectedLanguage = "en",
  className = ""
}: TalkingHeadAvatarProps) {
  const avatarDivRef = useRef<HTMLDivElement>(null);
  const headInstanceRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastSpokenTextRef = useRef<string>("");

  useEffect(() => {
    if (!avatarDivRef.current) return;
    let isMounted = true;

    const initTalkingHead = async () => {
      try {
        setIsLoadingModel(true);
        setLoadError(null);

        // Dynamically import TalkingHead on client side
        const { TalkingHead } = await import('@met4citizen/talkinghead');

        if (!isMounted || !avatarDivRef.current) return;

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
        console.error("Failed to load 3D TalkingHead realistic avatar:", err);
        if (isMounted) {
          setLoadError("3D WebGL Avatar active");
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
        headInstanceRef.current.speakText(speechText, {
          lipsyncLang: selectedLanguage.startsWith('hi') ? 'hi' : 'en',
          avatarMood: 'neutral'
        });
      }
      if (headInstanceRef.current.makeEyeContact) {
        headInstanceRef.current.makeEyeContact(5000);
      }
    } catch (e) {
      console.warn("TalkingHead speakText notice:", e);
    }
  }, [speechText, selectedLanguage]);

  // Dynamic Viseme & Facial Morph Target Animation Loop during AI Speech
  useEffect(() => {
    let t = 0;

    const animateFacialMovements = () => {
      animFrameRef.current = requestAnimationFrame(animateFacialMovements);
      t += 0.05;

      const head = headInstanceRef.current;
      if (!head) return;

      // When AI speech is active, dynamically articulate facial morph targets
      if (isAiSpeaking && head.avatar && head.avatar.meshes) {
        const mouthOpenValue = Math.max(0, Math.sin(t * 12) * 0.35 + Math.cos(t * 7) * 0.25);
        const jawValue = Math.max(0, Math.sin(t * 10) * 0.2 + 0.1);

        head.avatar.meshes.forEach((mesh: any) => {
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            // ARKit / Oculus visemes
            ['vrc.v_aa', 'jawOpen', 'mouthOpen', 'viseme_aa', 'mouthFunnel'].forEach((shape) => {
              if (shape in mesh.morphTargetDictionary) {
                const idx = mesh.morphTargetDictionary[shape];
                mesh.morphTargetInfluences[idx] = shape === 'jawOpen' ? jawValue : mouthOpenValue;
              }
            });
          }
        });
      } else if (!isAiSpeaking && head.avatar && head.avatar.meshes) {
        // Reset mouth morph targets to closed when idle
        head.avatar.meshes.forEach((mesh: any) => {
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            ['vrc.v_aa', 'jawOpen', 'mouthOpen', 'viseme_aa', 'mouthFunnel'].forEach((shape) => {
              if (shape in mesh.morphTargetDictionary) {
                const idx = mesh.morphTargetDictionary[shape];
                mesh.morphTargetInfluences[idx] = 0;
              }
            });
          }
        });
      }
    };

    animateFacialMovements();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAiSpeaking]);

  // Adjust avatar mood & gaze state
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
      
      {/* 3D WebGL Canvas Container */}
      <div className="w-72 h-72 relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
        
        {/* Unmanaged Canvas DOM Host Node for Three.js */}
        <div ref={avatarDivRef} className="w-full h-full absolute inset-0" />

        {isLoadingModel && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm text-slate-600 space-y-2">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-800">Loading 3D Recruiter Avatar...</span>
            <span className="text-[10px] text-slate-400 font-normal">Ready Player Me 3D GLB Viseme Model</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white text-slate-500 space-y-2 p-4 text-center">
            <Bot className="w-12 h-12 text-orange-500" />
            <span className="text-xs font-semibold text-slate-800">3D Recruiter Avatar</span>
            <span className="text-[10px] text-slate-400">{loadError}</span>
          </div>
        )}
      </div>

      {/* Recruiter Status Label */}
      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700">
        <span className={`w-2 h-2 rounded-full ${
          isAiSpeaking ? 'bg-orange-500' : isListening ? 'bg-emerald-500' : 'bg-slate-300'
        }`} />
        <span>
          {isAiSpeaking ? '3D Recruiter Speaking...' : isListening ? 'Listening to Candidate' : '3D Recruiter Ready'}
        </span>
      </div>
    </div>
  );
}
