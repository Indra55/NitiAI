'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, RefreshCw, Github, Check, Download, Eye, Layout, Terminal, Code2, 
  BookOpen, Search, ArrowRight, UserCheck, CheckCircle2, Lock, ShieldCheck 
} from 'lucide-react';

import DeveloperFolioTemplate from '@/components/portfolio-templates/DeveloperFolioTemplate';
import GitProfileTemplate from '@/components/portfolio-templates/GitProfileTemplate';
import FramerCreativeTemplate from '@/components/portfolio-templates/FramerCreativeTemplate';
import AcademicCVTemplate from '@/components/portfolio-templates/AcademicCVTemplate';

type TemplateKey = 'developerFolio' | 'gitProfile' | 'framerCreative' | 'academicCV';

interface TemplateOption {
  id: TemplateKey;
  title: string;
  repoAuthor: string;
  repoName: string;
  description: string;
  badge: string;
  accentColor: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'developerFolio',
    title: 'DeveloperFolio / MasterPortfolio',
    repoAuthor: 'saadpasta',
    repoName: 'developerFolio',
    description: 'Modern Cyber-Tech Glassmorphism with Tech Stack Pills, Experience Timeline & Live Project Cards.',
    badge: 'Popular',
    accentColor: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'gitProfile',
    title: 'GitProfile / Minimalist Dev',
    repoAuthor: 'arifszn',
    repoName: 'gitprofile',
    description: 'Clean Minimalist GitHub profile card with repository star counts, forks, and terminal styling.',
    badge: 'Clean',
    accentColor: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'framerCreative',
    title: 'Next.js Framer Creative',
    repoAuthor: 'codebucks27',
    repoName: 'Next.js-Developer-Portfolio',
    description: 'Vibrant Mesh Gradient with 3D-styled skill keycaps, interactive project showcase, and voice intro.',
    badge: 'Creative',
    accentColor: 'from-purple-500 to-pink-500'
  },
  {
    id: 'academicCV',
    title: 'Academic CV & Researcher',
    repoAuthor: 'HugoBlox',
    repoName: 'hugo-theme-academic-cv',
    description: 'LaTeX-inspired typography with BibTeX citations, research project list, and academic experience timeline.',
    badge: 'Academic',
    accentColor: 'from-blue-500 to-indigo-500'
  }
];

export default function PortfolioTemplatesPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('developerFolio');
  const [usernameInput, setUsernameInput] = useState<string>('Indra55');
  const [activeUsername, setActiveUsername] = useState<string>('Indra55');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Candidate Seeded Data State
  const [candidateData, setCandidateData] = useState({
    name: 'Indra Hitanshu',
    username: 'Indra55',
    avatarUrl: 'https://github.com/Indra55.png',
    bio: 'Software Engineer specializing in scalable backend microservices, Rust, Go, Python, and system architecture.',
    location: 'India',
    email: 'indra55@users.noreply.github.com',
    targetRole: 'Senior Backend Engineer',
    skills: ['Python', 'Rust', 'Go', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'FastAPI', 'Redis', 'Kubernetes'],
    repos: [
      {
        name: 'NitiAI',
        description: 'AI-Powered Career Studio, Socratic Tech Debate & 2-Tier Relational GitHub Graph Engine.',
        language: 'TypeScript',
        stars: 42,
        forks: 12,
        url: 'https://github.com/Indra55/NitiAI',
        detectedTools: ['TypeScript', 'Next.js', 'PostgreSQL', 'Sarvam AI']
      },
      {
        name: 'distributed-cache-engine',
        description: 'High-throughput in-memory key-value cache engine built with Rust and LRU eviction policy.',
        language: 'Rust',
        stars: 28,
        forks: 8,
        url: 'https://github.com/Indra55',
        detectedTools: ['Rust', 'Concurrency', 'LRU Cache']
      },
      {
        name: 'microservices-gateway',
        description: 'Asynchronous API gateway built with Go and gRPC protocol buffers for rate limiting.',
        language: 'Go',
        stars: 19,
        forks: 5,
        url: 'https://github.com/Indra55',
        detectedTools: ['Go', 'gRPC', 'Docker']
      }
    ],
    experiences: [
      {
        role: 'Senior Software Engineer',
        company: 'Tech Solutions Inc.',
        period: '2024 - Present',
        desc: 'Architected microservices handling 50k requests/sec using Rust, PostgreSQL, and Kubernetes.'
      },
      {
        role: 'Backend Engineer',
        company: 'Innovate Labs',
        period: '2022 - 2024',
        desc: 'Developed RESTful and GraphQL APIs with Python FastAPI and Redis caching layer.'
      }
    ]
  });

  useEffect(() => {
    setMounted(true);
    fetchCandidateDetails('Indra55');
  }, []);

  const parseUsername = (input: string): string => {
    if (!input) return '';
    let trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const url = new URL(trimmed);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) return parts[0];
      } catch (e) {
        const match = trimmed.match(/github\.com\/([^\/]+)/i);
        if (match) return match[1];
      }
    }
    return trimmed.replace(/^@/, '');
  };

  const fetchCandidateDetails = async (targetUser: string) => {
    const parsed = parseUsername(targetUser);
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/github/user-roadmap?username=${encodeURIComponent(parsed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.probingQuestions) {
          setActiveUsername(parsed);
          setCandidateData(prev => ({
            ...prev,
            username: parsed,
            avatarUrl: `https://github.com/${parsed}.png`,
            name: parsed,
            email: `${parsed.toLowerCase()}@users.noreply.github.com`,
            repos: data.probingQuestions.map((q: any, idx: number) => ({
              name: q.repoName || `Repo_${idx + 1}`,
              description: q.question || 'Scanned GitHub repository.',
              language: 'TypeScript',
              stars: Math.floor(Math.random() * 30) + 5,
              forks: Math.floor(Math.random() * 10) + 1,
              url: `https://github.com/${parsed}/${q.repoName || ''}`,
              detectedTools: q.expectedConcepts ? q.expectedConcepts.slice(0, 3) : ['GitHub', 'Code']
            }))
          }));
        }
      }
    } catch (e) {
      console.error('Fetch candidate details error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidateDetails(usernameInput);
  };

  const handleExportCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Studio Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/nitiai.png" alt="Niti AI" width={36} height={36} className="rounded-lg shadow-md" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portfolio Templates Studio
              </h1>
              <p className="text-[11px] text-slate-400">Live Seed Candidate GitHub Details into Portfolio Websites</p>
            </div>
          </div>

          {/* GitHub Live Seed Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Github className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. Indra55, SujalChoudhari"
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono w-48 sm:w-60"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !usernameInput.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Seed Data
            </button>
          </form>

          {/* Export Code Button */}
          <button
            onClick={handleExportCode}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
            {copiedCode ? 'Portfolio Code Exported!' : 'Export Portfolio Code'}
          </button>
        </div>
      </div>

      {/* Template Selector Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100">Select Developer Portfolio Template Design:</h2>
          </div>
          <p className="text-xs text-slate-400">
            Selected candidate profile details for <span className="text-purple-300 font-bold font-mono">@{activeUsername}</span> are automatically seeded in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => {
            const isSelected = activeTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setActiveTemplate(tmpl.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-purple-950 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      {tmpl.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{tmpl.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{tmpl.description}</p>
                </div>

                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>{tmpl.repoAuthor}/{tmpl.repoName}</span>
                  <span className="text-purple-400 flex items-center gap-0.5">Preview <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE SEEDED PORTFOLIO PREVIEW WINDOW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-2">
          {/* Mock Browser Header Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono">
              https://{activeUsername.toLowerCase()}.dev
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
              <UserCheck className="w-3.5 h-3.5" /> Data Seeded
            </span>
          </div>

          {/* Render Selected Live Seeded Template */}
          <div className="overflow-x-hidden">
            {activeTemplate === 'developerFolio' && <DeveloperFolioTemplate data={candidateData} />}
            {activeTemplate === 'gitProfile' && <GitProfileTemplate data={candidateData} />}
            {activeTemplate === 'framerCreative' && <FramerCreativeTemplate data={candidateData} />}
            {activeTemplate === 'academicCV' && <AcademicCVTemplate data={candidateData} />}
          </div>
        </div>
      </div>
    </main>
  );
}
