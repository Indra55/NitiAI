"use client"

import * as React from "react"
import { getCurrentUser, logout as apiLogout, type User as ApiUser } from "./api"

type UserRole = "admin" | "student"

type User = {
  id: string
  name: string
  username: string
  email: string
  role?: UserRole
  avatar?: string
  phone?: string
  location?: string
  age?: number
  proficiency_level?: string
  preferred_work_mode?: string
  availability_timeline?: string
  career_goal_short?: string
  career_goal_long?: string
  onboarding_completed?: boolean
  onboarding_step?: number
}

type AuthContextType = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refreshUser = React.useCallback(async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      setUserState(null)
      setLoading(false)
      return
    }

    try {
      const result = await getCurrentUser()

      if (result.data?.user) {
        const apiUser = result.data.user
        setUserState({
          id: apiUser.id,
          name: apiUser.name || apiUser.username,
          username: apiUser.username,
          email: apiUser.email,
          phone: apiUser.phone,
          location: apiUser.location,
          age: apiUser.age,
          proficiency_level: apiUser.proficiency_level,
          preferred_work_mode: apiUser.preferred_work_mode,
          availability_timeline: apiUser.availability_timeline,
          career_goal_short: apiUser.career_goal_short,
          career_goal_long: apiUser.career_goal_long,
          onboarding_completed: apiUser.onboarding_completed,
          onboarding_step: apiUser.onboarding_step,
          role: "student",
        })
      } else {
        // Token invalid or user not found
        localStorage.removeItem("token")
        setUserState(null)
      }
    } catch (e) {
      console.error("Error fetching user:", e)
      localStorage.removeItem("token")
      setUserState(null)
    }

    setLoading(false)
  }, [])

  React.useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const setUser = React.useCallback((user: User | null) => {
    setUserState(user)
    if (!user) {
      localStorage.removeItem("token")
    }
  }, [])

  const logout = React.useCallback(async () => {
    try {
      await apiLogout()
    } catch (e) {
      console.error("Logout error:", e)
    }
    localStorage.removeItem("token")
    setUserState(null)
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
