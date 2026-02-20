"use client"

import * as React from "react"

type UserRole = "admin" | "student"

type User = {
  name: string
  email: string
  role: UserRole
  avatar?: string
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(null)
  const [isInitialized, setIsInitialized] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("research-platform-user")
    if (stored) {
      setUserState(JSON.parse(stored))
    }
    setIsInitialized(true)
  }, [])

  const setUser = React.useCallback((user: User | null) => {
    setUserState(user)
    if (user) {
      localStorage.setItem("research-platform-user", JSON.stringify(user))
    } else {
      localStorage.removeItem("research-platform-user")
    }
  }, [])

  const logout = React.useCallback(() => {
    setUser(null)
  }, [setUser])

  if (!isInitialized) return null

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
