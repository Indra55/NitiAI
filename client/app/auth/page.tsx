"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthLayout from "@/components/ui/auth-layout"
import { FieldBox, CheckboxLine, AuthButton } from "@/components/ui/auth-forms"
import { SocialButton, GoogleIcon } from "@/components/ui/auth-icons"
import { register, login } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toaster } from "@/lib/toaster"

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <Link href="#" className="font-medium text-black/45 underline underline-offset-2 dark:text-white/45">
      Terms and Services
    </Link>{" "}
    and{" "}
    <Link href="#" className="font-medium text-black/45 underline underline-offset-2 dark:text-white/45">
      Privacy Policy
    </Link>
  </>
);

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup")

  return (
    <main className="relative min-h-screen w-full bg-background">
      <AuthLayout>
        {authMode === "signup" && (
          <SignUpForm onSwitchToLogin={() => setAuthMode("login")} />
        )}

        {authMode === "login" && (
          <LoginForm onSwitchToSignUp={() => setAuthMode("signup")} />
        )}
      </AuthLayout>
    </main>
  )
}

function SignUpForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required"
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      const { data: regData, error: regError } = await register({
        username: `${formData.firstName} ${formData.lastName}`,
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
        setIsLoading(false)
        return;
      }

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
        setIsLoading(false)
        onSwitchToLogin();
        return;
      }

      localStorage.setItem("user", JSON.stringify(loginData.user));
      localStorage.setItem("isAuthenticated", "true");

      toaster.create({
        title: "Welcome aboard!",
        description: "Your account has been created successfully.",
        type: "success"
      });

      window.location.href = "/journey";

    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ ...errors, form: "Network error. Please try again." });
      toaster.create({
        title: "Network Error",
        description: "Please check your connection and try again.",
        type: "error"
      });
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px]">
          Create an account
        </h1>
        <p className="mt-3 whitespace-nowrap text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl lg:text-2xl xl:text-3xl">
          Brainstorm in chat, build in cowork
        </p>
      </div>

      <div className="mt-12 grid gap-5">
        <SocialButton icon={<GoogleIcon />} label="Sign up with Google" />
      </div>

      <div className="my-10 text-center text-xl font-medium text-black/60 dark:text-white/50">
        or
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <FieldBox
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isLoading}
            />
            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <FieldBox
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isLoading}
            />
            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldBox
            label="Email"
            value={formData.email}
            type="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
        
        <div className="flex flex-col gap-1">
          <FieldBox
            label="Password"
            value={formData.password}
            type="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
        </div>

        <div className="space-y-4 pt-2 text-sm leading-5 text-black/30 dark:text-white/35 sm:text-[15px]">
          <CheckboxLine>
            I don't want to receive emails about feature updates
          </CheckboxLine>
          <CheckboxLine>{termsText}</CheckboxLine>
        </div>

        {errors.form && <div className="text-sm text-red-500 text-center">{errors.form}</div>}

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </AuthButton>
        
        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/55">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
            Log in
          </button>
        </p>
      </form>
    </div>
  )
}

function LoginForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

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

    setIsLoading(true)
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
        setIsLoading(false)
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      toaster.create({
        title: "Login Successful",
        description: "Welcome back!",
        type: "success"
      });

      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);
      setErrors({ ...errors, form: "Network error. Please try again." });
      toaster.create({
        title: "Network Error",
        description: "Please check your connection and try again.",
        type: "error"
      });
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="whitespace-nowrap text-3xl font-medium tracking-[-0.04em] sm:text-4xl lg:text-[42px] lg:leading-[1.05] xl:text-[50px]">
          Welcome Back
        </h1>
        <p className="mt-3 whitespace-nowrap text-lg leading-snug text-black/60 dark:text-white/55 sm:text-xl lg:text-2xl xl:text-3xl">
          Log in to access your dashboard
        </p>
      </div>

      <div className="mt-12 grid gap-5">
        <SocialButton icon={<GoogleIcon />} label="Log in with Google" />
      </div>

      <div className="my-10 text-center text-xl font-medium text-black/60 dark:text-white/50">
        or
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <FieldBox
            label="Email"
            value={formData.email}
            type="email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
        
        <div className="flex flex-col gap-1">
          <FieldBox
            label="Password"
            value={formData.password}
            type="password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
        </div>

        {errors.form && <div className="text-sm text-red-500 text-center">{errors.form}</div>}

        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </AuthButton>
        
        <p className="mt-4 text-center text-sm text-black/60 dark:text-white/55">
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToSignUp} className="underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
            Sign up
          </button>
        </p>
      </form>
    </div>
  )
}
