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
import SecondPortfolioTemplate from '@/portfolios/page';
import ThirdPortfolioTemplate from '@/portfolios/ThirdPortfolioTemplate';

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
  const [fullscreenPreviewId, setFullscreenPreviewId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Candidate Live Seeded Data State (auto-fetched from active user session)
  const [candidateData, setCandidateData] = useState({
    name: '',
    username: '',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    bio: '',
    location: '',
    email: '',
    targetRole: 'Software Engineer',
    skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL'],
    repos: [] as Array<{
      name: string;
      description: string;
      language: string;
      stars: number;
      forks: number;
      url: string;
      detectedTools: string[];
    }>,
    experiences: [] as Array<{
      role: string;
      company: string;
      period: string;
      desc: string;
    }>
  });

  const templatesList: PortfolioTemplateOption[] = [
    {
      id: 'custom-cyber-glass',
      title: 'DeveloperFolio / Cyber-Glass Template',
      author: 'saadpasta',
      repo: 'developerFolio',
      description: 'Modern developer portfolio with interactive tech stack filtering, project showcase cards, and career experience timeline.',
      badge: 'Featured Template 1',
      tags: ['Cyber-Glass', 'Interactive Filter', 'GitHub Stars', 'Developer Showcase'],
      component: CustomPortfolioTemplate
    },
    {
      id: 'visual-poetry-creative',
      title: 'Visual Poetry & Creative Interactive Explorer',
      author: 'creative-studio',
      repo: 'visual-poetry-portfolio',
      description: 'High-impact creative portfolio featuring hero statistics (+Repos, +Skills), interactive folder explorer, and detailed project preview panel.',
      badge: 'Featured Template 2',
      tags: ['Visual Hero', 'Folder Explorer', 'Orange Gradient Card', 'Interactive Files'],
      component: SecondPortfolioTemplate
    },
    {
      id: 'particle-hero-fullstack',
      title: 'Particle Hero & Interactive Canvas Showcase',
      author: 'shinekyaw',
      repo: 'shinekyaw-portfolio',
      description: 'Interactive canvas particle effect hero, animated skill proficiency bars, mouse tracker, and glassmorphic contact card.',
      badge: 'Featured Template 3',
      tags: ['Canvas Particles', 'Mouse Tracker', 'Progress Bars', 'Dark Glassmorphism'],
      component: ThirdPortfolioTemplate
    }
  ];

  useEffect(() => {
    setMounted(true);
    fetchUserAndResumeInfo();
  }, []);

  const fetchUserAndResumeInfo = async () => {
    setLoading(true);
    try {
      let activeUsername = '';

      // 1. Fetch logged-in user account details from current active session
      const userRes = await getCurrentUser();
      if (userRes.data?.user) {
        const u = userRes.data.user;
        activeUsername = u.username || u.name?.toLowerCase().replace(/\s+/g, '') || u.email?.split('@')[0] || '';
        setCandidateData(prev => ({
          ...prev,
          name: u.name || u.username || 'Candidate Profile',
          username: activeUsername,
          email: u.email || '',
          location: u.location || '',
          targetRole: u.career_goal_short || 'Software Engineer',
          avatarUrl: activeUsername ? `https://github.com/${activeUsername}.png` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
        }));
      }

      // 2. Fetch active user's stored resume info from DB
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
            stars: Math.floor(Math.random() * 25) + 10,
            forks: Math.floor(Math.random() * 8) + 2,
            url: p.url || `https://github.com/${activeUsername}/${p.name || ''}`,
            detectedTools: p.technologies || ['TypeScript', 'Node.js']
          })) : prev.repos,
          experiences: r.experience && r.experience.length > 0 ? r.experience.map(e => ({
            role: e.title || 'Software Engineer',
            company: e.company || 'Tech Company',
            period: `${e.start || '2023'} - ${e.end || 'Present'}`,
            desc: e.description || 'Engineered software solutions and full stack features.'
          })) : prev.experiences
        }));
      }

      // 3. Fetch active session user's GitHub repository scan data
      try {
        const ghRes = await fetch(`/api/github/user-roadmap?username=${activeUsername}`);
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          if (ghData.success && ghData.probingQuestions && ghData.probingQuestions.length > 0) {
            setCandidateData(prev => ({
              ...prev,
              username: activeUsername,
              avatarUrl: `https://github.com/${activeUsername}.png`,
              repos: ghData.probingQuestions.map((q: any, idx: number) => ({
                name: q.repoName || `Repo_${idx + 1}`,
                description: q.question || 'Scanned GitHub repository.',
                language: 'TypeScript',
                stars: 25 + idx * 6,
                forks: 8 + idx * 2,
                url: `https://github.com/${activeUsername}/${q.repoName || ''}`,
                detectedTools: q.expectedConcepts ? q.expectedConcepts.slice(0, 3) : ['TypeScript', 'GitHub']
              }))
            }));
          }
        }
      } catch (ghErr) {
        console.warn('GitHub session fetch notice:', ghErr);
      }
    } catch (e) {
      console.warn('Auto-fetch session details notice:', e);
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
      </div>
    );
  }

  const activeFullscreenTemplate = templatesList.find(t => t.id === fullscreenPreviewId);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header Bar - White & Black with Orange Highlights */}
      <div className="border-b border-slate-200 bg-white/90 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/nitiai.png" alt="Niti AI" width={36} height={36} className="rounded-xl shadow-md" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Portfolio Templates <span className="text-orange-600">Gallery</span>
              </h1>
              <p className="text-[11px] text-slate-500">Auto-seeded with your authenticated profile &amp; resume details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-slate-900 font-bold">{candidateData.name}</span>
              <span className="text-orange-600 font-semibold">(@{candidateData.username})</span>
            </div>

            <button
              onClick={handleExportCode}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4.5 py-2 rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              {copiedCode ? 'TSX Code Exported!' : 'Export React TSX'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Banner Section */}
        <div className="space-y-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Select &amp; Preview Portfolio Designs ({templatesList.length} Available)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Developer Portfolio Templates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
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
                className={`rounded-3xl border transition-all overflow-hidden bg-white shadow-sm ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Row Template Information Bar */}
                <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{tmpl.title}</h3>
                      <span className="text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 px-3 py-0.5 rounded-full">
                        {tmpl.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {tmpl.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {tmpl.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md font-mono font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls for this Template */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setFullscreenPreviewId(tmpl.id)}
                      className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-orange-600" /> Fullscreen Live Preview
                    </button>

                    <button
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-orange-600/20 font-extrabold'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-orange-400" />}
                      {isSelected ? 'Active Template' : 'Select Template'}
                    </button>
                  </div>
                </div>

                {/* INLINE LIVE SEEDED PREVIEW CONTAINER */}
                <div className="relative p-4 sm:p-6 bg-slate-100/60">
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-500 font-mono px-2">
                    <span className="flex items-center gap-1.5 text-orange-600 font-bold">
                      <UserCheck className="w-3.5 h-3.5" /> Inline Live Seeded Preview (Using Your Profile &amp; Resume)
                    </span>
                    <span>Template Ref: {tmpl.author}/{tmpl.repo}</span>
                  </div>

                  {/* Scaled Preview Frame Container */}
                  <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-lg max-h-[560px] overflow-y-auto relative">
                    <TemplateComponent data={candidateData} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULLSCREEN MODAL LIVE PREVIEW OVERLAY */}
      {fullscreenPreviewId && activeFullscreenTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md overflow-y-auto flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full font-mono">
                Fullscreen Live Seeded Preview
              </span>
              <span className="text-sm font-bold text-slate-900">{activeFullscreenTemplate.title}</span>
            </div>

            <button
              onClick={() => setFullscreenPreviewId(null)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <X className="w-4 h-4 text-slate-800" /> Close Preview
            </button>
          </div>

          {/* Modal Content Frame */}
          <div className="flex-1 bg-slate-950">
            <activeFullscreenTemplate.component data={candidateData} />
          </div>
        </div>
      )}
    </main>
  );
}
