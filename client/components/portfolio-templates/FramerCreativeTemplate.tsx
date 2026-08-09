'use client';

import React from 'react';
import { Sparkles, Code2, Rocket, ExternalLink, Github, Mail, Cpu, Layers, MessageSquare, Mic } from 'lucide-react';

interface TemplateProps {
  data: {
    name: string;
    username: string;
    avatarUrl: string;
    bio: string;
    location: string;
    email: string;
    targetRole: string;
    skills: string[];
    repos: Array<{
      name: string;
      description: string;
      language: string;
      stars: number;
      forks: number;
      url: string;
      detectedTools: string[];
    }>;
  };
}

export default function FramerCreativeTemplate({ data }: TemplateProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 space-y-16 relative overflow-hidden">
      {/* Dynamic Ambient Gradient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <section className="max-w-5xl mx-auto space-y-8 pt-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-700/60 text-purple-300 text-xs font-bold shadow-xl">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> Next.js &amp; Framer Motion Portfolio Design
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Crafting Digital Experiences as{' '}
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {data.targetRole || 'Software Architect'}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {data.bio || `Hello, I'm ${data.name || data.username}. I build scalable applications with modern frameworks and robust backend microservices.`}
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-purple-600/25 transition-all flex items-center gap-2"
          >
            <Github className="w-4 h-4" /> Explore GitHub Profile
          </a>
        </div>
      </section>

      {/* 3D Keycaps Skill Badges */}
      <section className="max-w-5xl mx-auto space-y-6 relative z-10">
        <h2 className="text-2xl font-black text-slate-100 text-center flex items-center justify-center gap-2">
          <Cpu className="w-6 h-6 text-pink-400" /> Interactive Skill Badges &amp; Stack
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {data.skills.map((skill, idx) => (
            <div
              key={idx}
              className="px-4 py-2 bg-slate-900/90 border border-purple-900/50 rounded-2xl text-slate-200 text-xs font-bold shadow-lg hover:scale-105 hover:border-pink-500 transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              {skill}
            </div>
          ))}
        </div>
      </section>

      {/* Creative Project Showcase */}
      <section className="max-w-5xl mx-auto space-y-8 relative z-10">
        <h2 className="text-2xl font-black text-slate-100 text-center flex items-center justify-center gap-2">
          <Rocket className="w-6 h-6 text-purple-400" /> Seeding Live GitHub Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.repos.map((repo, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-purple-900/40 rounded-3xl p-6 space-y-4 hover:border-purple-500 transition-all shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-pink-400 font-mono font-bold">0{idx + 1}. Project</span>
                  <a href={repo.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <h3 className="text-xl font-extrabold text-slate-100">{repo.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{repo.description || 'Modern repository engineered with clean architecture.'}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                {repo.detectedTools.map((t, i) => (
                  <span key={i} className="text-[10px] bg-purple-950/80 border border-purple-800 text-purple-300 px-2.5 py-1 rounded-full font-mono font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
