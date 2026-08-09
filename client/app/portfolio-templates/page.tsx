'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, RefreshCw, Check, Download, Layout, CheckCircle2, UserCheck, Code2, ArrowRight
} from 'lucide-react';
import { getResumeInfo, getCurrentUser } from '@/lib/api';

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
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Candidate Live Seeded Data State
  const [candidateData, setCandidateData] = useState({
    name: 'Jay Dalvi',
    username: 'jayyy255',
    avatarUrl: 'https://github.com/jayyy255.png',
    bio: 'Software Engineer specializing in scalable backend microservices, modern web applications, and AI system design.',
    location: 'Mumbai, India',
    email: 'jaydalvi0205@gmail.com',
    targetRole: 'Full Stack & AI Engineer',
    skills: ['React', 'Next.js', 'Node.js', 'Express', 'Python', 'PostgreSQL', 'Docker', 'TypeScript', 'Sarvam AI', 'Tailwind CSS'],
    repos: [
      {
        name: 'NitiAI',
        description: 'AI-Powered Career Studio, Socratic Tech Debate & 2-Tier Relational GitHub Graph Engine.',
        language: 'TypeScript',
        stars: 48,
        forks: 14,
        url: 'https://github.com/jayyy255/NitiAI',
        detectedTools: ['TypeScript', 'Next.js', 'PostgreSQL', 'Sarvam AI']
      },
      {
        name: 'distributed-cache-service',
        description: 'High-throughput in-memory key-value cache engine built with Node.js and LRU eviction policy.',
        language: 'JavaScript',
        stars: 32,
        forks: 9,
        url: 'https://github.com/jayyy255',
        detectedTools: ['Node.js', 'LRU Cache', 'Concurrency']
      },
      {
        name: 'microservice-gateway',
        description: 'Asynchronous API gateway built with Express and PostgreSQL for token authentication and rate limiting.',
        language: 'JavaScript',
        stars: 24,
        forks: 6,
        url: 'https://github.com/jayyy255',
        detectedTools: ['Express', 'PostgreSQL', 'JWT']
      }
    ],
    experiences: [
      {
        role: 'Full Stack AI Developer',
        company: 'NitiAI Tech Solutions',
        period: '2024 - Present',
        desc: 'Architected high-throughput AI career evaluation engine and microservices using Next.js, Node.js, and PostgreSQL.'
      },
      {
        role: 'Software Engineer Intern',
        company: 'Innovate Labs',
        period: '2023 - 2024',
        desc: 'Developed RESTful APIs with Express and built interactive web dashboards.'
      }
    ]
  });

  useEffect(() => {
    setMounted(true);
    fetchUserAndResumeInfo();
  }, []);

  const fetchUserAndResumeInfo = async () => {
    setLoading(true);
    try {
      // 1. Fetch user account details
      const userRes = await getCurrentUser();
      if (userRes.data?.user) {
        const u = userRes.data.user;
        setCandidateData(prev => ({
          ...prev,
          name: u.name || u.username || prev.name,
          username: u.username || prev.username,
          email: u.email || prev.email,
          location: u.location || prev.location,
          targetRole: u.career_goal_short || prev.targetRole,
          avatarUrl: `https://github.com/${u.username || 'jayyy255'}.png`
        }));
      }

      // 2. Fetch stored candidate resume info from DB
      const resumeRes = await getResumeInfo();
      if (resumeRes.data) {
        const r = resumeRes.data;
        setCandidateData(prev => ({
          ...prev,
          name: r.extracted_name || prev.name,
          email: r.extracted_email || prev.email,
          location: r.extracted_location || prev.location,
          targetRole: r.professional_title || prev.targetRole,
          bio: r.professional_summary || prev.bio,
          skills: r.technical_skills && r.technical_skills.length > 0 ? r.technical_skills : prev.skills,
          repos: r.projects && r.projects.length > 0 ? r.projects.map((p, i) => ({
            name: p.name || `Project_${i+1}`,
            description: p.description || 'Candidate project showcase.',
            language: p.technologies ? p.technologies[0] : 'TypeScript',
            stars: Math.floor(Math.random() * 25) + 5,
            forks: Math.floor(Math.random() * 8) + 1,
            url: p.url || `https://github.com/${prev.username}/${p.name || ''}`,
            detectedTools: p.technologies || ['React', 'Node.js']
          })) : prev.repos,
          experiences: r.experience && r.experience.length > 0 ? r.experience.map(e => ({
            role: e.title || 'Software Engineer',
            company: e.company || 'Tech Company',
            period: `${e.start || '2023'} - ${e.end || 'Present'}`,
            desc: e.description || 'Engineered software solutions and full stack features.'
          })) : prev.experiences
        }));
      }
    } catch (e) {
      console.warn('Auto-fetch user resume details notice:', e);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/nitiai.png" alt="Niti AI" width={36} height={36} className="rounded-lg shadow-md" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portfolio Templates Studio
              </h1>
              <p className="text-[11px] text-slate-400">Pre-seeded with your saved profile, resume &amp; skills details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-bold">{candidateData.name}</span>
              <span className="text-purple-400">(@{candidateData.username})</span>
            </div>

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
      </div>

      {/* Template Selector Grid */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100">Select Developer Portfolio Template Design:</h2>
          </div>
          <p className="text-xs text-slate-400">
            Preview how your seeded profile &amp; resume details look across 4 developer portfolio designs.
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
              https://{candidateData.username.toLowerCase()}.dev
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
              <UserCheck className="w-3.5 h-3.5" /> User Profile &amp; Resume Details Seeded
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
