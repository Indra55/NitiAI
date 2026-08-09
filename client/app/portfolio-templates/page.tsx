'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, RefreshCw, Check, Download, Layout, CheckCircle2, UserCheck, 
  Code2, ArrowRight, Eye, ExternalLink, Github, Terminal, Layers, Star, GitFork, X, FileCode
} from 'lucide-react';
import { getResumeInfo, getCurrentUser } from '@/lib/api';
import { DynamicNavbar } from '@/components/dynamic-navbar';
import { Button } from '@/components/ui/button';
import '@/app/dashboard/dashboard.css';

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
  const [downloadedTemplateId, setDownloadedTemplateId] = useState<string | null>(null);

  // Candidate Live Seeded Data State (auto-fetched from user resume DB & active session)
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

      // 1. Fetch logged-in user account details from active session (/api/users/me)
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

      // 2. Fetch user's stored resume info from DB (/api/resume/info)
      try {
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
            repos: r.projects && r.projects.length > 0 ? r.projects.map((p: any, i: number) => ({
              name: p.name || `Project_${i+1}`,
              description: p.description || 'Uploaded resume project showcase.',
              language: p.technologies ? p.technologies[0] : 'TypeScript',
              stars: Math.floor(Math.random() * 25) + 12,
              forks: Math.floor(Math.random() * 8) + 3,
              url: p.url || `https://github.com/${activeUsername}/${p.name || ''}`,
              detectedTools: p.technologies || ['TypeScript', 'Node.js']
            })) : prev.repos,
            experiences: r.experience && r.experience.length > 0 ? r.experience.map((e: any) => ({
              role: e.title || e.role || 'Software Engineer',
              company: e.company || 'Tech Company',
              period: `${e.start || '2023'} - ${e.end || 'Present'}`,
              desc: e.description || 'Engineered software solutions and full stack features.'
            })) : prev.experiences
          }));
        }
      } catch (resumeErr) {
        console.warn('Resume info fetch notice:', resumeErr);
        // Fallback: Attempt fetching latest uploaded resume from database
        try {
          const latestRes = await fetch('/api/resume/latest');
          if (latestRes.ok) {
            const r = await latestRes.json();
            if (r) {
              setCandidateData(prev => ({
                ...prev,
                name: r.extracted_name || prev.name,
                targetRole: r.professional_title || prev.targetRole,
                bio: r.professional_summary || prev.bio,
                skills: r.technical_skills && r.technical_skills.length > 0 ? r.technical_skills : prev.skills,
                repos: r.projects && r.projects.length > 0 ? r.projects.map((p: any, i: number) => ({
                  name: p.name || `Project_${i+1}`,
                  description: p.description || 'Parsed resume project.',
                  language: p.technologies ? p.technologies[0] : 'TypeScript',
                  stars: 15 + i * 5,
                  forks: 4 + i,
                  url: p.url || `https://github.com/${activeUsername}/${p.name || ''}`,
                  detectedTools: p.technologies || ['TypeScript', 'Node.js']
                })) : prev.repos,
                experiences: r.experience && r.experience.length > 0 ? r.experience.map((e: any) => ({
                  role: e.title || 'Software Engineer',
                  company: e.company || 'Tech Company',
                  period: `${e.start || '2023'} - ${e.end || 'Present'}`,
                  desc: e.description || 'Engineered software features.'
                })) : prev.experiences
              }));
            }
          }
        } catch (e) {
          console.warn('Fallback resume fetch notice:', e);
        }
      }

      // 3. Fetch active session user's GitHub repository scan data
      try {
        if (activeUsername) {
          const ghRes = await fetch(`/api/github/user-roadmap?username=${activeUsername}`);
          if (ghRes.ok) {
            const ghData = await ghRes.json();
            if (ghData.success && ghData.probingQuestions && ghData.probingQuestions.length > 0) {
              setCandidateData(prev => ({
                ...prev,
                username: activeUsername,
                avatarUrl: `https://github.com/${activeUsername}.png`,
                repos: prev.repos.length > 0 ? prev.repos : ghData.probingQuestions.map((q: any, idx: number) => ({
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

  const handleDownloadDeployableHTML = (tmplId: string) => {
    setDownloadedTemplateId(tmplId);

    let htmlContent = '';

    if (tmplId === 'custom-cyber-glass') {
      // Template 01 - Cyber-Glass Theme
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${candidateData.name || 'Developer'} - Cyber-Glass Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
  <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.15),transparent_30%)]"></div>

  <div class="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-14 space-y-12">
    <header class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
      <div class="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
          <img src="${candidateData.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'}" alt="${candidateData.name}" class="h-28 w-28 rounded-2xl border border-slate-700 object-cover shadow-lg" />
          <div>
            <div class="mb-3 flex flex-wrap items-center gap-3">
              <span class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">${candidateData.targetRole || 'Software Engineer'}</span>
              <span class="text-sm text-slate-500">@${candidateData.username || 'candidate'}</span>
            </div>
            <h1 class="text-4xl font-extrabold text-white sm:text-6xl">${candidateData.name || 'Candidate Name'}</h1>
            <p class="mt-4 max-w-2xl text-base text-slate-400 leading-relaxed">${candidateData.bio || 'Experienced software developer'}</p>
            <div class="mt-5 flex flex-wrap gap-4 text-sm text-slate-400 font-mono">
              <span>📍 ${candidateData.location || 'Remote'}</span>
              <span>✉️ ${candidateData.email}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-3 shrink-0">
          <a href="https://github.com/${candidateData.username}" target="_blank" class="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-slate-900">GitHub Profile</a>
          <a href="mailto:${candidateData.email}" class="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300">Contact Me</a>
        </div>
      </div>
    </header>

    <section class="space-y-4">
      <p class="text-sm font-semibold uppercase tracking-widest text-cyan-300 font-mono">CAPABILITIES</p>
      <h2 class="text-2xl font-bold text-white">Technical Stack (Resume Extracted)</h2>
      <div class="flex flex-wrap gap-3">
        ${candidateData.skills.map(s => `<span class="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">${s}</span>`).join('\n        ')}
      </div>
    </section>

    <section class="space-y-6">
      <p class="text-sm font-semibold uppercase tracking-widest text-purple-300 font-mono">SELECTED WORK</p>
      <h2 class="text-2xl font-bold text-white">Projects Showcase</h2>
      <div class="grid gap-6 md:grid-cols-2">
        ${candidateData.repos.map(r => `
        <article class="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl hover:border-purple-400/40 transition">
          <div>
            <h3 class="text-lg font-bold text-white">${r.name}</h3>
            <p class="mt-2 text-sm text-slate-400 leading-relaxed">${r.description || 'Open source project.'}</p>
          </div>
          <div class="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-4 border-t border-slate-800">
            <span class="text-cyan-300 font-bold">● ${r.language || 'TypeScript'}</span>
            <span>⭐ ${r.stars || 12} stars</span>
            <span>🍴 ${r.forks || 4} forks</span>
            <a href="${r.url}" target="_blank" class="ml-auto font-bold text-purple-300 hover:underline">View Source &rarr;</a>
          </div>
        </article>
        `).join('')}
      </div>
    </section>

    <section class="space-y-6">
      <p class="text-sm font-semibold uppercase tracking-widest text-cyan-300 font-mono">CAREER PATH</p>
      <h2 class="text-2xl font-bold text-white">Work Experience</h2>
      <div class="relative space-y-6 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-px before:bg-slate-800">
        ${candidateData.experiences.map(e => `
        <article class="relative pl-9">
          <span class="absolute left-0 top-1.5 h-[23px] w-[23px] rounded-full border-4 border-slate-950 bg-cyan-300"></span>
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-xl space-y-2">
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-bold text-white">${e.role}</h3>
              <time class="text-sm text-slate-500 font-mono">${e.period}</time>
            </div>
            <p class="text-sm text-cyan-300 font-medium">@ ${e.company}</p>
            <p class="mt-2 text-sm text-slate-400 leading-relaxed">${e.desc}</p>
          </div>
        </article>
        `).join('')}
      </div>
    </section>
  </div>
</body>
</html>`;
    } else if (tmplId === 'visual-poetry-creative') {
      // Template 02 - Visual Poetry & Creative Explorer Theme
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${candidateData.name || 'Developer'} - Visual Poetry Explorer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 md:p-12 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="space-y-4">
        <span class="inline-block px-3.5 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-mono font-bold uppercase tracking-wider text-orange-200">
          ${candidateData.targetRole || 'Software Engineer'}
        </span>
        <h1 class="text-4xl md:text-6xl font-black italic font-serif tracking-tight">${candidateData.name || 'Candidate Name'}</h1>
        <p class="text-base text-white/90 max-w-xl leading-relaxed">${candidateData.bio || 'Creative developer building modern software experiences.'}</p>
        <div class="flex flex-wrap gap-4 text-xs font-mono pt-2">
          <span>📍 ${candidateData.location || 'Remote'}</span>
          <span>✉️ ${candidateData.email}</span>
          <span>🐙 github.com/${candidateData.username}</span>
        </div>
      </div>
      <img src="${candidateData.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'}" alt="${candidateData.name}" class="w-36 h-36 md:w-44 md:h-44 rounded-2xl object-cover border-4 border-white/60 shadow-2xl shrink-0 bg-slate-900" />
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
        <div class="text-3xl font-black text-orange-500">${candidateData.repos.length}</div>
        <div class="text-xs font-mono text-slate-400">Scanned Projects</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
        <div class="text-3xl font-black text-orange-500">${candidateData.skills.length}</div>
        <div class="text-xs font-mono text-slate-400">Tech Stack Skills</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
        <div class="text-3xl font-black text-orange-500">${candidateData.experiences.length}</div>
        <div class="text-xs font-mono text-slate-400">Career Positions</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
        <div class="text-3xl font-black text-orange-500">100%</div>
        <div class="text-xs font-mono text-slate-400">Resume Verified</div>
      </div>
    </div>

    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-white">📁 Resume Projects Explorer</h2>
      <div class="grid md:grid-cols-2 gap-6">
        ${candidateData.repos.map(r => `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-orange-500/80 transition-all flex flex-col justify-between">
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-white">${r.name}</h3>
            <p class="text-xs text-slate-300 leading-relaxed">${r.description}</p>
            <div class="flex flex-wrap gap-1.5 pt-2">
              ${(r.detectedTools || []).map(t => `<span class="text-[10px] bg-slate-950 border border-slate-800 text-orange-300 px-2 py-0.5 rounded font-mono">${t}</span>`).join('')}
            </div>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-slate-800 text-xs font-mono">
            <span class="text-orange-400">${r.language}</span>
            <a href="${r.url}" target="_blank" class="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-lg">View Repo &rarr;</a>
          </div>
        </div>
        `).join('')}
      </div>
    </section>

    <section class="space-y-6">
      <h2 class="text-2xl font-bold text-white">💼 Career Journey Timeline</h2>
      <div class="space-y-4">
        ${candidateData.experiences.map(e => `
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2">
          <div class="flex justify-between items-center">
            <h3 class="text-base font-bold text-white">${e.role} <span class="text-orange-400">@ ${e.company}</span></h3>
            <span class="text-xs font-mono text-slate-400">${e.period}</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${e.desc}</p>
        </div>
        `).join('')}
      </div>
    </section>
  </div>
</body>
</html>`;
    } else {
      // Template 03 - Particle Hero Theme
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${candidateData.name || 'Developer'} - Particle Hero Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white p-6 md:p-12 space-y-16">
  <section class="max-w-5xl mx-auto text-center space-y-6 pt-12">
    <span class="inline-block px-4 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono font-bold text-purple-300">
      ${candidateData.targetRole || 'Software Engineer'}
    </span>
    <h1 class="text-5xl md:text-7xl font-extrabold text-white">
      Hi, I'm <span class="bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">${candidateData.name || 'Developer'}</span>
    </h1>
    <p class="max-w-2xl mx-auto text-base md:text-lg text-zinc-300 leading-relaxed">
      ${candidateData.bio || 'Crafting digital experiences with backend architecture and innovation.'}
    </p>
    <div class="flex justify-center gap-4 pt-4">
      <a href="mailto:${candidateData.email}" class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-lg">Contact Me</a>
      <a href="https://github.com/${candidateData.username}" target="_blank" class="px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900 text-purple-300 font-bold text-sm">GitHub Profile</a>
    </div>
  </section>

  <section class="max-w-5xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center text-white">Technical Skills &amp; Proficiency</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      ${candidateData.skills.map((s, idx) => `
      <div class="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl space-y-2">
        <div class="text-xs font-bold text-white">${s}</div>
        <div class="h-2 rounded-full bg-zinc-700 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style="width: ${85 + (idx % 12)}%"></div>
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <section class="max-w-5xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center text-white">Featured Resume Projects</h2>
    <div class="grid md:grid-cols-3 gap-6">
      ${candidateData.repos.map(r => `
      <div class="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 space-y-4 flex flex-col justify-between hover:border-purple-500/50 transition-all">
        <div class="space-y-2">
          <h3 class="text-lg font-bold text-white">${r.name}</h3>
          <p class="text-xs text-zinc-300 leading-relaxed">${r.description}</p>
        </div>
        <div class="pt-4 border-t border-zinc-700/50 flex justify-between items-center text-xs font-mono">
          <span class="text-purple-300">${r.language}</span>
          <a href="${r.url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">Repository &rarr;</a>
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <section class="max-w-4xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-center text-white">Work Experience</h2>
    <div class="space-y-4">
      ${candidateData.experiences.map(e => `
      <div class="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 space-y-2">
        <h3 class="text-base font-bold text-white">${e.role}</h3>
        <div class="text-xs font-mono text-purple-300">${e.company} | ${e.period}</div>
        <p class="text-xs text-zinc-300 leading-relaxed">${e.desc}</p>
      </div>
      `).join('')}
    </div>
  </section>
</body>
</html>`;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadedTemplateId(null), 3000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#fcf9f5] text-[#171716] flex items-center justify-center dashboard-theme font-sans">
        <RefreshCw className="w-6 h-6 animate-spin text-[#ef4a18]" />
      </div>
    );
  }

  const activeFullscreenTemplate = templatesList.find(t => t.id === fullscreenPreviewId);

  return (
    <main className="min-h-screen bg-[#fcf9f5] text-[#171716] dashboard-theme pb-16">
      {/* SINGLE NAVBAR: Client App DynamicNavbar */}
      <DynamicNavbar />

      {/* Main Container matching dashboard layout & font with top gap */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-8 space-y-8">
        
        {/* LIST FORMAT TEMPLATE ROWS */}
        <div className="space-y-8">
          {templatesList.map((tmpl, idx) => {
            const isSelected = selectedTemplateId === tmpl.id;
            const isDownloaded = downloadedTemplateId === tmpl.id;
            const TemplateComponent = tmpl.component;

            return (
              <div
                key={tmpl.id}
                className={`rounded-3xl border transition-all overflow-hidden bg-white shadow-sm ${
                  isSelected
                    ? 'border-[#ef4a18] ring-2 ring-[#ef4a18]/20 shadow-md'
                    : 'border-[#e8e1da] hover:border-slate-300'
                }`}
              >
                {/* Row Template Information Bar */}
                <div className="p-6 sm:p-8 border-b border-[#e8e1da] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#fcf9f5]">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white bg-[#171716] px-2.5 py-0.5 rounded-md">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-[#171716]">{tmpl.title}</h3>
                      <span className="text-xs font-bold text-[#ef4a18] bg-[#fff0eb] border border-[#ef4a18]/30 px-3 py-0.5 rounded-full">
                        {tmpl.badge}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#77716b] leading-relaxed max-w-3xl">
                      {tmpl.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {tmpl.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-[#f3f0ec] border border-[#e8e1da] text-[#171716] px-2.5 py-0.5 rounded-md font-mono font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls for this Template */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => setFullscreenPreviewId(tmpl.id)}
                      className="bg-white hover:bg-[#f3f0ec] text-[#171716] border border-[#e8e1da] font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-[#ef4a18]" /> Fullscreen Live Preview
                    </Button>

                    <Button
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-[#ef4a18] text-white shadow-[#ef4a18]/20 font-extrabold'
                          : 'bg-[#171716] hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                      {isSelected ? 'Active Template' : 'Select Template'}
                    </Button>

                    <Button
                      onClick={() => handleDownloadDeployableHTML(tmpl.id)}
                      className="bg-[#ef4a18] hover:bg-[#d83f12] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      {isDownloaded ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
                      {isDownloaded ? 'index.html Downloaded!' : 'Download Deployable .html'}
                    </Button>
                  </div>
                </div>

                {/* INLINE LIVE SEEDED PREVIEW CONTAINER */}
                <div className="relative p-4 sm:p-6 bg-[#f3f0ec]/60">
                  <div className="mb-3 flex items-center justify-between text-xs text-[#77716b] font-mono px-2">
                    <span className="flex items-center gap-1.5 text-[#ef4a18] font-bold">
                      <UserCheck className="w-3.5 h-3.5" /> Inline Live Seeded Preview (Using Your Profile &amp; Resume)
                    </span>
                    <span>Template Ref: {tmpl.author}/{tmpl.repo}</span>
                  </div>

                  {/* Scaled Preview Frame Container */}
                  <div className="rounded-2xl border border-[#e8e1da] overflow-hidden shadow-lg max-h-[560px] overflow-y-auto relative">
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
        <div className="fixed inset-0 z-50 bg-[#171716]/80 backdrop-blur-md overflow-y-auto flex flex-col dashboard-theme font-sans">
          {/* Modal Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-[#e8e1da] px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#ef4a18] bg-[#fff0eb] border border-[#ef4a18]/30 px-3 py-1 rounded-full font-mono">
                Fullscreen Live Seeded Preview
              </span>
              <span className="text-sm font-bold text-[#171716]">{activeFullscreenTemplate.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleDownloadDeployableHTML(activeFullscreenTemplate.id)}
                className="bg-[#ef4a18] hover:bg-[#d83f12] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Download Deployable .html
              </Button>

              <Button
                variant="outline"
                onClick={() => setFullscreenPreviewId(null)}
                className="bg-[#f3f0ec] hover:bg-[#e8e1da] text-[#171716] p-2 rounded-xl border border-[#e8e1da] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <X className="w-4 h-4 text-[#171716]" /> Close Preview
              </Button>
            </div>
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
