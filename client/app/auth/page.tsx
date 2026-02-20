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

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"select" | "signup" | "login">("select")

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

      {/* Main Content */}
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
                  <MagneticButton
                    size="lg"
                    variant="primary"
                    onClick={() => setAuthMode("signup")}
                    className="w-full"
                  >
                    Sign Up
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

          {authMode === "signup" && (
            <SignUpForm
              onBack={() => setAuthMode("select")}
              onSwitchToLogin={() => setAuthMode("login")}
            />
          )}

          {authMode === "login" && (
            <LoginForm onBack={() => setAuthMode("select")} />
          )}
        </div>
      </div>
    </main>
  )
}

function SignUpForm({ onBack, onSwitchToLogin }: { onBack: () => void, onSwitchToLogin: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Register user
      const { data: regData, error: regError } = await register({
        username: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (regError || !regData) {
        setErrors({ ...errors, form: regError || "Registration failed" });
        toaster.create({
          title: "Registration Failed",
          description: regError || "Please try again.",
          type: "error"
        });
        return;
      }

      // Auto-login after registration
      const { data: loginData, error: loginError } = await login({
        email: formData.email,
        password: formData.password
      });

      if (loginError || !loginData) {
        toaster.create({
          title: "Auto-login failed",
          description: "Please log in manually.",
          type: "warning"
        });
        onSwitchToLogin(); // Redirect to login form
        return;
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(loginData.user));
      localStorage.setItem("isAuthenticated", "true");

      toaster.create({
        title: "Welcome aboard!",
        description: "Your account has been created successfully.",
        type: "success"
      });

      // Redirect to onboarding
      window.location.href = "/journey";

    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ ...errors, form: "Network error. Please try again." });
      toaster.create({
        title: "Network Error",
        description: "Please check your connection and try again.",
        type: "error"
      });
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h2 className="mb-3 text-3xl font-light leading-tight text-foreground md:text-4xl">
          Create Your Account
        </h2>
        <p className="text-foreground/70">Fill in your details to begin your journey.</p>
      </div>



      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.name ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="John Doe"
            disabled={isLoading}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.email ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="john@example.com"
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.password ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="At least 8 characters"
            disabled={isLoading}
          />
          {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.confirmPassword ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="Re-enter your password"
            disabled={isLoading}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>

        <div className="w-full">
          <MagneticButton type="submit" size="lg" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Continue to Onboarding"}
          </MagneticButton>
        </div>
      </form>
    </div>
  )
}

function LoginForm({ onBack }: { onBack: () => void }) {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const { data, error } = await login({
        email: formData.email,
        password: formData.password
      });

      if (error || !data) {
        setErrors({ ...errors, form: error || "Login failed" });
        toaster.create({
          title: "Login Failed",
          description: error || "Check your credentials.",
          type: "error"
        });
        return;
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      toaster.create({
        title: "Login Successful",
        description: "Welcome back!",
        type: "success"
      });

      // Redirect to dashboard
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);
      setErrors({ ...errors, form: "Network error. Please try again." });
      toaster.create({
        title: "Network Error",
        description: "Please check your connection and try again.",
        type: "error"
      });
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="mb-6 text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h2 className="mb-3 text-3xl font-light leading-tight text-foreground md:text-4xl">
          Welcome Back
        </h2>
        <p className="text-foreground/70">Log in to access your dashboard.</p>
      </div>



      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-foreground">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.email ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="john@example.com"
            disabled={isLoading}
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full rounded-xl border bg-foreground/5 px-4 py-3 text-foreground backdrop-blur-sm transition-all placeholder:text-foreground/40 focus:border-accent focus:outline-none ${errors.password ? "border-destructive" : "border-foreground/20"
              }`}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="w-full">
          <MagneticButton type="submit" size="lg" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </MagneticButton>
        </div>
      </form>
    </div>
  )
}
