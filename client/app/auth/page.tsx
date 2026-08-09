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
import { Github, Mail, Lock, User, Sparkles, ShieldCheck, ArrowRight } from "lucide-react"

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5555";
    window.location.href = `${baseUrl}/api/github/auth/login${stateParam}`;
  };

  const showToast = (title: string, type: "error" | "success" | "info" = "info") => {
    try {
      toaster.create({ title, type });
    } catch (e) {
      console.log(`[${type}] ${title}`);
    }
  };

  // Normal Email/Password Signup Handler
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      showToast("Please fill in all required fields.", "error");
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
        await fetch('/api/github/save-user-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUsername: handle })
        });

        showToast("Registration successful! Redirecting to setup...", "success");
        router.push(`/github-demo?username=${encodeURIComponent(handle)}&authPrompt=true`);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      showToast(err.response?.data?.error || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Normal Email/Password Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.data) {
        if (auth?.setUser && res.data.user) {
          auth.setUser({
            ...res.data.user,
            name: res.data.user.name || res.data.user.username || "User"
          });
        }
        const userHandle = parseUsername(githubInput) || res.data.user?.username || 'Indra55';
        showToast("Login successful! Welcome back.", "success");
        router.push(`/github-demo?username=${encodeURIComponent(userHandle)}`);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      showToast(err.response?.data?.error || "Invalid credentials.", "error");
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
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image src="/nitiai.png" alt="Niti AI" width={80} height={80} className="rounded-lg" />
        </Link>
        <Link
          href="/"
          className="font-sans text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          Back to Home
        </Link>
      </nav>

      {/* Main Content Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24 md:px-12">
        <div className="w-full max-w-md">
          {authMode === "select" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center">
                <h1 className="mb-3 text-4xl font-light leading-tight text-foreground md:text-5xl">
                  <span className="text-balance">Welcome to NITI AI</span>
                </h1>
                <p className="text-lg text-foreground/70">
                  Choose how you'd like to get started on your career journey.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-full">
                  <button
                    onClick={handleGitHubOAuth}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3.5 px-6 rounded-full text-base transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Github className="w-5 h-5" />
                    <span>Continue with GitHub OAuth</span>
                  </button>
                </div>

                <div className="w-full">
                  <MagneticButton
                    size="lg"
                    variant="primary"
                    onClick={() => setAuthMode("signup")}
                    className="w-full"
                  >
                    Sign Up with Email
                  </MagneticButton>
                </div>

                <div className="w-full">
                  <MagneticButton
                    size="lg"
                    variant="secondary"
                    onClick={() => setAuthMode("login")}
                    className="w-full"
                  >
                    Log In
                  </MagneticButton>
                </div>
              </div>
            </div>
          )}

          {/* SIGNUP FORM */}
          {authMode === "signup" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-light text-foreground">Create Account</h2>
                <p className="text-sm text-foreground/70 mt-1">
                  Sign up with email or fast-track with GitHub OAuth
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={handleGitHubOAuth}
                  className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 font-medium py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-purple-400" /> Fast-Track Signup with GitHub
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-foreground/20 w-full" />
                  <span className="px-2 text-xs text-foreground/60 uppercase">Or Email</span>
                  <div className="border-t border-foreground/20 w-full" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jay Dalvi"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jay@example.com"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">GitHub Profile Link or Handle</label>
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="e.g. https://github.com/Indra55 or jayyy255"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none"
                  />
                </div>

                <MagneticButton
                  size="lg"
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Creating Account..." : "Create Account & Start Roadmap"}
                </MagneticButton>

                <div className="text-center text-xs text-foreground/70 pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-foreground font-semibold underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === "login" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-light text-foreground">Welcome Back</h2>
                <p className="text-sm text-foreground/70 mt-1">
                  Log in to your NITI AI Career Studio
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={handleGitHubOAuth}
                  className="w-full bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 font-medium py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Github className="w-4 h-4 text-purple-400" /> Log In with GitHub OAuth
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-foreground/20 w-full" />
                  <span className="px-2 text-xs text-foreground/60 uppercase">Or Email</span>
                  <div className="border-t border-foreground/20 w-full" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jay@example.com"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground/80">GitHub Profile Link or Handle (Optional)</label>
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="e.g. https://github.com/Indra55"
                    className="w-full bg-background/60 border border-foreground/20 rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none"
                  />
                </div>

                <MagneticButton
                  size="lg"
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Logging In..." : "Log In & Continue Roadmap"}
                </MagneticButton>

                <div className="text-center text-xs text-foreground/70 pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className="text-foreground font-semibold underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          )}

          {authMode !== "select" && (
            <button
              onClick={() => setAuthMode("select")}
              className="w-full text-center text-xs text-foreground/70 hover:text-foreground transition-colors pt-4 cursor-pointer"
            >
              ← Back to Auth Selection
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
