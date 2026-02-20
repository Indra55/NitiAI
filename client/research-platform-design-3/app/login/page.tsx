"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit, User, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"admin" | "student" | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRole && name && email) {
      setUser({
        name,
        email,
        role: selectedRole,
      })
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 gradient-overlay pointer-events-none" />

      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md glass-strong border shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-3xl">Welcome to Eidos</CardTitle>
          <CardDescription className="text-base">Research Intelligence Platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedRole ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">Select your role to continue</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole("admin")}
                  className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary p-6 transition-all duration-200 hover:scale-105 bg-card"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-serif font-semibold text-lg">Admin</div>
                      <div className="text-xs text-muted-foreground">Full Access</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedRole("student")}
                  className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary p-6 transition-all duration-200 hover:scale-105 bg-card"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-serif font-semibold text-lg">Student</div>
                      <div className="text-xs text-muted-foreground">Researcher</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedRole === "admin" ? (
                    <Shield className="w-5 h-5 text-primary" />
                  ) : (
                    <User className="w-5 h-5 text-primary" />
                  )}
                  <span className="font-serif font-semibold capitalize">{selectedRole} Login</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRole(null)}>
                  Change
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane.smith@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
