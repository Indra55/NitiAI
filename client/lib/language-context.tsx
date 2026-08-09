"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, Sparkles, Languages } from 'lucide-react';

export interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (langCode: string) => Promise<void>;
  translateText: (text: string) => Promise<string>;
  isPageTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: async () => {},
  translateText: async (t) => t,
  isPageTranslating: false,
});

export const SUPPORTED_SITE_LANGUAGES = [
  { code: 'en', label: 'English (Default)' },
  { code: 'hi-IN', label: 'Hindi (हिंदी)' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)' },
  { code: 'kn-IN', label: 'Kannada (कन्नड)' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
  { code: 'or-IN', label: 'Odia (ଓଡ଼ିଆ)' }
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isPageTranslating, setIsPageTranslating] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('site_language');
    if (saved) setCurrentLanguage(saved);
  }, []);

  // ─── Pre-Render Sarvam AI Page Translator ────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || currentLanguage === 'en') {
      setIsPageTranslating(false);
      return;
    }

    let isSubscribed = true;

    const translateDOMPreRender = async () => {
      setIsPageTranslating(true);
      
      // Wait for React DOM elements to mount
      await new Promise(r => setTimeout(r, 150));
      if (!isSubscribed) return;

      try {
        // Use TreeWalker to capture 100% of all leaf text nodes across the entire page
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName.toLowerCase();
              if (['script', 'style', 'noscript', 'code', 'pre', 'svg'].includes(tag)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (parent.getAttribute('data-sarvam-translated')) {
                return NodeFilter.FILTER_REJECT;
              }
              const text = node.nodeValue?.trim();
              if (text && text.length >= 2 && text.length <= 250 && /[a-zA-Z]/.test(text)) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_SKIP;
            }
          }
        );

        let currentNode: Node | null = walker.nextNode();
        while (currentNode) {
          textNodes.push(currentNode as Text);
          currentNode = walker.nextNode();
        }

        if (textNodes.length > 0) {
          const batchSize = 30;
          for (let i = 0; i < textNodes.length; i += batchSize) {
            if (!isSubscribed) break;
            const batchNodes = textNodes.slice(i, i + batchSize);
            const rawTexts = batchNodes.map(node => node.nodeValue?.trim() || '');

            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await fetch(`${backendUrl}/api/sarvam/translate-batch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: rawTexts, targetLanguage: currentLanguage })
            });

            const data = await res.json();
            if (data.translations && Array.isArray(data.translations)) {
              batchNodes.forEach((node, idx) => {
                if (data.translations[idx] && node.parentElement) {
                  node.nodeValue = data.translations[idx];
                  node.parentElement.setAttribute('data-sarvam-translated', 'true');
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn('Sarvam AI pre-render translation error:', e);
      } finally {
        if (isSubscribed) setIsPageTranslating(false);
      }
    };

    translateDOMPreRender();

    return () => {
      isSubscribed = false;
    };
  }, [currentLanguage, pathname]);

  const changeLanguage = async (langCode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('site_language', langCode);
    }
    setCurrentLanguage(langCode);

    // Save to user profile in database async with Bearer token
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
      fetch(`${backendUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ native_language: langCode })
      }).catch(() => {});
    } catch (e) {}
  };

  const translateText = async (text: string): Promise<string> => {
    if (!text || currentLanguage === 'en') return text;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
      const res = await fetch(`${backendUrl}/api/sarvam/translate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [text], targetLanguage: currentLanguage })
      });
      const data = await res.json();
      return (data.translations && data.translations[0]) || text;
    } catch (e) {
      return text;
    }
  };

  const selectedLangLabel = SUPPORTED_SITE_LANGUAGES.find(l => l.code === currentLanguage)?.label || currentLanguage;

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, translateText, isPageTranslating }}>
      
      {/* Pre-Render Translation Overlay */}
      {isPageTranslating && (
        <div className="fixed inset-0 z-100 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200">
          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200/80 shadow-md flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-orange-600 animate-pulse" />
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-center gap-2">
              <Languages className="w-4 h-4 text-orange-600" />
              Sarvam AI Translating Page...
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Translating UI strings to <span className="font-bold text-orange-700">{selectedLangLabel}</span> while preserving technical terms.
            </p>
          </div>
        </div>
      )}

      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
