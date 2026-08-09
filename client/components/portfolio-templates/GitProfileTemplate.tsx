'use client';

import React from 'react';
import { Github, FolderGit2, Star, GitFork, MapPin, Mail, ExternalLink, Terminal, ShieldCheck, Activity } from 'lucide-react';

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

export default function GitProfileTemplate({ data }: TemplateProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono p-6 sm:p-10 space-y-8">
      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={data.avatarUrl || `https://github.com/${data.username || 'octocat'}.png`}
            alt={data.name}
            className="w-28 h-28 rounded-full border-2 border-emerald-500/80 p-1"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-slate-100">{data.name || data.username}</h1>
              <span className="text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 px-2.5 py-0.5 rounded-full">
                @{data.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
              {data.bio || `Software Engineer focused on ${data.targetRole}.`}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              {data.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {data.location}
                </span>
              )}
              {data.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {data.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* GitHub Live Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Repositories</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{data.repos.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Stars</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">
              {data.repos.reduce((acc, r) => acc + (r.stars || 0), 0)}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Forks</span>
            <span className="text-xl font-bold text-indigo-400 mt-0.5 block">
              {data.repos.reduce((acc, r) => acc + (r.forks || 0), 0)}
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
            <span className="text-xs font-bold text-emerald-400 mt-1 block flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Tech Stack List */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> Primary Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-slate-950 border border-slate-800 text-emerald-300 text-xs rounded-lg"
            >
              $ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-emerald-400" /> Pinned GitHub Repositories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.repos.map((repo, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between">
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-emerald-400 hover:underline flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4" /> {repo.name}
                </a>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed line-clamp-2">
                {repo.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                <span className="text-indigo-300">{repo.language || 'Code'}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> {repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3 text-slate-400" /> {repo.forks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
