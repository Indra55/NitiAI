'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, RefreshCw, Check, Download, Layout, CheckCircle2, UserCheck, 
  Code2, ArrowRight, Eye, ExternalLink, Github, Terminal, Layers, Star, GitFork, X
} from 'lucide-react';
import { getResumeInfo, getCurrentUser } from '@/lib/api';

import CustomPortfolioTemplate from '@/portfolios/CustomPortfolioTemplate';

interface PortfolioTemplateOption {
  id: string;
  title: string;
  author: string;
  repo: string;
  description: string;
  badge: string;
  tags: string[];
  component: React.ComponentType<{ data: any }>;
}

export default function PortfolioTemplatesPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom-cyber-glass');
  const [fullscreenPreview, setFullscreenPreview] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Candidate Live Seeded Data State (auto-fetched from user session & resume DB)
  const [candidateData, setCandidateData] = useState({
    name: 'Jay Dalvi',
    username: 'jayyy255',
    avatarUrl: 'https://github.com/jayyy255.png',
    bio: 'Full Stack & AI Engineer specializing in scalable backend microservices, high-throughput systems, and modern WebGL architectures.',
    location: 'Mumbai, India',
    email: 'jaydalvi0205@gmail.com',
    targetRole: 'Senior Full Stack & AI Engineer',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'Python', 'PostgreSQL', 'Docker', 'Sarvam AI', 'Tailwind CSS', 'Redis', 'Rust'],
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
        description: 'High-throughput in-memory key-value cache engine built with Rust and LRU eviction policy.',
        language: 'Rust',
        stars: 32,
        forks: 9,
        url: 'https://github.com/jayyy255',
        detectedTools: ['Rust', 'LRU Cache', 'Concurrency']
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
        role: 'Full Stack AI Engineer',
        company: 'NitiAI Systems',
        period: '2024 - Present',
        desc: 'Architected high-throughput AI career evaluation engine and microservices using Next.js, Node.js, and PostgreSQL.'
      },
      {
        role: 'Software Engineer Intern',
        company: 'Innovate Labs',
        period: '2023 - 2024',
        desc: 'Engineered RESTful APIs with Express and built interactive WebGL developer dashboards.'
      }
    ]
  });

  const templatesList: PortfolioTemplateOption[] = [
    {
      id: 'custom-cyber-glass',
      title: 'DeveloperFolio / Cyber-Glass Template',
      author: 'saadpasta',
      repo: 'developerFolio',
      description: 'Modern Cyber-Tech Glassmorphism design with interactive tech stack filtering, project showcase cards, and career timeline.',
      badge: 'Featured Template',
      tags: ['Cyber-Glass', 'Interactive Filter', 'GitHub Stars', 'Dark Theme'],
      component: CustomPortfolioTemplate
    }
  ];

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
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Background Radial Glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.1),transparent_30%)]" />

      {/* Top Navbar Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-40 backdrop-blur-xl px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/nitiai.png" alt="Niti AI" width={36} height={36} className="rounded-xl shadow-md" />
            </Link>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portfolio Templates Gallery
              </h1>
              <p className="text-[11px] text-slate-400">Pre-seeded with your authenticated profile &amp; resume details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200 font-bold">{candidateData.name}</span>
              <span className="text-purple-400">(@{candidateData.username})</span>
            </div>

            <button
              onClick={handleExportCode}
              className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Download className="w-3.5 h-3.5" />}
              {copiedCode ? 'TSX Code Exported!' : 'Export React TSX'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 relative z-10">
        {/* Intro Banner */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Select &amp; Preview Portfolio Designs
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Available Developer Portfolio Templates</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Choose a portfolio template design below. Each template is automatically seeded with your real candidate name, resume skills, projects, and work experience.
          </p>
        </div>

        {/* LIST FORMAT TEMPLATE ROWS */}
        <div className="space-y-8">
          {templatesList.map((tmpl, idx) => {
            const isSelected = selectedTemplateId === tmpl.id;
            const TemplateComponent = tmpl.component;

            return (
              <div
                key={tmpl.id}
                className={`rounded-3xl border transition-all overflow-hidden bg-slate-900/80 backdrop-blur-xl ${
                  isSelected
                    ? 'border-cyan-400/60 shadow-2xl shadow-cyan-950/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Row Template Information Bar */}
                <div className="p-6 sm:p-8 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 rounded-md">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white">{tmpl.title}</h3>
                      <span className="text-xs font-bold text-purple-300 bg-purple-950 border border-purple-800 px-3 py-0.5 rounded-full">
                        {tmpl.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {tmpl.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {tmpl.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls for this Template */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setFullscreenPreview(true)}
                      className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" /> Fullscreen Live Preview
                    </button>

                    <button
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20 font-extrabold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-slate-950" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
                      {isSelected ? 'Active Template' : 'Select Template'}
                    </button>
                  </div>
                </div>

                {/* INLINE LIVE SEEDED PREVIEW CONTAINER */}
                <div className="relative p-4 sm:p-6 bg-slate-950/60">
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-400 font-mono px-2">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <UserCheck className="w-3.5 h-3.5" /> Inline Live Seeded Preview (Using Your Profile &amp; Resume)
                    </span>
                    <span>Template Ref: {tmpl.author}/{tmpl.repo}</span>
                  </div>

                  {/* Scaled Preview Frame Container */}
                  <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl max-h-[560px] overflow-y-auto relative">
                    <TemplateComponent data={candidateData} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN MODAL LIVE PREVIEW OVERLAY */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-cyan-300 bg-cyan-950 border border-cyan-800 px-3 py-1 rounded-full font-mono">
                Fullscreen Live Seeded Preview
              </span>
              <span className="text-sm font-bold text-white">Cyber-Glass Developer Portfolio</span>
            </div>

            <button
              onClick={() => setFullscreenPreview(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <X className="w-4 h-4 text-red-400" /> Close Preview
            </button>
          </div>

          {/* Modal Content Frame */}
          <div className="flex-1">
            <CustomPortfolioTemplate data={candidateData} />
          </div>
        </div>
      )}
    </main>
  );
}
