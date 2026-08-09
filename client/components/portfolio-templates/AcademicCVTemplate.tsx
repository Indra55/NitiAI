'use client';

import React from 'react';
import { BookOpen, GraduationCap, Award, Mail, Github, MapPin, FileText, ExternalLink, Bookmark } from 'lucide-react';

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

export default function AcademicCVTemplate({ data }: TemplateProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-serif p-6 sm:p-12 space-y-12">
      {/* Academic Header */}
      <header className="max-w-4xl mx-auto border-b border-slate-800 pb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-slate-100">
              {data.name || data.username}
            </h1>
            <p className="text-sm text-indigo-400 font-mono font-medium">
              Research Focus: {data.targetRole || 'Computer Science & Software Systems'}
            </p>
            <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
              {data.bio || `Academic & Researcher working on software architecture, systems engineering, and open-source software.`}
            </p>
          </div>

          <img
            src={data.avatarUrl || `https://github.com/${data.username || 'octocat'}.png`}
            alt={data.name}
            className="w-24 h-24 rounded-2xl border border-slate-800 object-cover shrink-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
          {data.email && (
            <a href={`mailto:${data.email}`} className="flex items-center gap-1.5 hover:text-indigo-400">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {data.email}
            </a>
          )}
          {data.username && (
            <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-indigo-400">
              <Github className="w-3.5 h-3.5 text-indigo-400" /> github.com/{data.username}
            </a>
          )}
          {data.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {data.location}
            </span>
          )}
        </div>
      </header>

      {/* Publications / Research Projects */}
      <section className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-lg font-bold font-sans text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <BookOpen className="w-4 h-4 text-indigo-400" /> Selected Research &amp; Open Source Software ({data.repos.length})
        </h2>

        <div className="space-y-6 font-sans">
          {data.repos.map((repo, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-indigo-900 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" /> [{idx + 1}] {repo.name}
                </h3>
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-400 text-xs flex items-center gap-1">
                  BibTeX / Repo <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                {repo.description || 'Open source software implementation and research codebase.'}
              </p>

              <div className="flex items-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
                <span>Language: {repo.language || 'Software'}</span>
                <span>Citations/Stars: {repo.stars}</span>
                <span>Tools: {repo.detectedTools.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Competencies */}
      <section className="max-w-4xl mx-auto space-y-4 font-sans">
        <h2 className="text-lg font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" /> Technical Competencies &amp; Methods
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
