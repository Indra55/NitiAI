"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import { register, login } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toaster } from "@/lib/toaster"
import { Github, Mail, Lock, User, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react"

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"select" | "signup" | "login">("select")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const auth = useAuth()

  // Form State
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [githubInput, setGithubInput] = useState<string>('')

  // Helper to parse username handle from input
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

  // Direct GitHub OAuth Login Handler
  const handleGitHubOAuth = () => {
    const parsedHandle = parseUsername(githubInput) || '';
    const stateParam = parsedHandle ? `?username=${encodeURIComponent(parsedHandle)}` : '';
    window.location.href = `http://localhost:5000/api/github/auth/login${stateParam}`;
  };

  // Normal Email/Password Signup Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toaster.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const handle = parseUsername(githubInput) || email.split('@')[0];
      const res = await register({
        username: handle,
        name,
        email,
        password
      });

      if (res.data) {
        // Save GitHub username for user personalization
        await fetch('/api/github/save-user-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUsername: handle })
        });

        toaster.success("Registration successful! Redirecting to setup...");
        router.push(`/github-demo?username=${encodeURIComponent(handle)}&authPrompt=true`);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      toaster.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Normal Email/Password Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toaster.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.data) {
        if (auth.setAuthData) {
          auth.setAuthData(res.data.token, res.data.user);
        }
        const userHandle = parseUsername(githubInput) || res.data.user?.username || 'Indra55';
        toaster.success("Login successful! Welcome back.");
        router.push(`/github-demo?username=${encodeURIComponent(userHandle)}`);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toaster.error(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div className="fixed inset-0 z-0" style={{ contain: "strict" }}>
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.6}
            detail={0.7}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image src="/nitiai.png" alt="Niti AI" width={80} height={80} className="rounded-lg shadow-xl" />
        </Link>
        <Link
          href="/"
          className="font-sans text-xs font-semibold text-foreground/80 transition-colors hover:text-foreground bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-md"
        >
          Back to Home
        </Link>
      </nav>

      {/* Main Content Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24 md:px-12">
        <div className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-800 px-3 py-1 rounded-full text-[11px] font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> NitiAI Career Intelligence &amp; Studio
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {authMode === "select" ? "Welcome to NITI AI" : authMode === "signup" ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-xs text-foreground/70 leading-relaxed">
              {authMode === "select" 
                ? "Choose your login method to personalize your GitHub roadmap & interview simulation." 
                : authMode === "signup" 
                ? "Enter your details to generate your personal GitHub technical roadmap." 
                : "Log in to access your portfolio roadmap and mock interview simulator."}
            </p>
          </div>

          {/* MODE SELECT SCREEN */}
          {authMode === "select" && (
            <div className="space-y-4 pt-2">
              {/* PRIMARY METHOD: GITHUB OAUTH LOGIN */}
              <button
                onClick={handleGitHubOAuth}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-purple-600/25 flex items-center justify-center gap-3 cursor-pointer border border-purple-400/30"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub OAuth (Pre-fill Profile)</span>
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-950 px-3 text-[11px] font-mono text-slate-400 uppercase shrink-0">
                  Or Email Login
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAuthMode("signup")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-indigo-400" /> Sign Up
                </button>

                <button
                  onClick={() => setAuthMode("login")}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-400" /> Log In
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>GitHub OAuth pre-seeds database and pre-fills your profile answers automatically.</span>
              </div>
            </div>
          )}

          {/* SIGNUP FORM */}
          {authMode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* GitHub Fast Track Button */}
              <button
                type="button"
                onClick={handleGitHubOAuth}
                className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Github className="w-4 h-4 text-purple-400" /> Fast-Track Signup with GitHub (Auto Pre-fill)
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-950 px-2 text-[10px] text-slate-500 uppercase">Or Manual Signup</span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jay Dalvi"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jay@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">GitHub Profile Link or Handle</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="e.g. https://github.com/Indra55 or jayyy255"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Used to fetch public repositories for roadmap analysis. You can optionally authorize GitHub OAuth for private repos.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account & Start Roadmap"} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* LOGIN FORM */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <button
                type="button"
                onClick={handleGitHubOAuth}
                className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Github className="w-4 h-4 text-purple-400" /> Log In with GitHub OAuth
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-950 px-2 text-[10px] text-slate-500 uppercase">Or Email Login</span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jay@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">GitHub Profile Link or Handle (Optional)</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="e.g. https://github.com/Indra55"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Logging In..." : "Log In & Continue Roadmap"} <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {authMode !== "select" && (
            <button
              onClick={() => setAuthMode("select")}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors pt-2 cursor-pointer"
            >
              ← Back to Auth Method Selection
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
