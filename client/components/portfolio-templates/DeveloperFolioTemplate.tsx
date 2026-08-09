'use client';

import React from 'react';
import { Github, Linkedin, Mail, ExternalLink, Star, GitFork, Code2, Sparkles, Terminal, Award, BookOpen } from 'lucide-react';

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
    experiences: Array<{
      role: string;
      company: string;
      period: string;
      desc: string;
    }>;
  };
}

export default function DeveloperFolioTemplate({ data }: TemplateProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 space-y-16">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 pt-6">
        <div className="space-y-6 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Software Engineer Portfolio
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {data.name || `@${data.username}`}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
            {data.bio || `Passionate ${data.targetRole} specializing in building high-throughput backend microservices, modern web applications, and resilient cloud architectures.`}
          </p>

          {/* Social Badges */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            {data.username && (
              <a
                href={`https://github.com/${data.username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Github className="w-4 h-4 text-purple-400" /> GitHub
              </a>
            )}
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Mail className="w-4 h-4 text-indigo-400" /> Contact Me
              </a>
            )}
          </div>
        </div>

        {/* Avatar Card */}
        <div className="relative shrink-0">
          <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
            <img
              src={data.avatarUrl || `https://github.com/${data.username || 'octocat'}.png`}
              alt={data.name}
              className="w-full h-full object-cover rounded-[22px] bg-slate-900"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack Pills */}
      <section className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" /> Skills &amp; Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {data.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl hover:border-indigo-500 transition-all cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" /> Featured Projects ({data.repos.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">Live Seeded from GitHub</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.repos.map((repo, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {repo.name}
                  </h3>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {repo.description || 'Full-stack repository showcase with automated CI/CD pipeline and clean code structure.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {repo.detectedTools.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" /> {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5 text-slate-400" /> {repo.forks}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" /> Work Experience
        </h2>
        <div className="space-y-4">
          {data.experiences.map((exp, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base font-bold text-slate-100">{exp.role} <span className="text-indigo-400">@ {exp.company}</span></h3>
                <span className="text-xs text-slate-400 font-mono">{exp.period}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{exp.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
