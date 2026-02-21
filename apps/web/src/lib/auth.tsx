import React, { createContext, useContext, useState, useEffect } from "react"
import { api } from "./api"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; name: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get("/api/auth/get-session")
      .then((session) => {
        if (session?.user) setUser(session.user)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post("/api/auth/sign-in/email", { email, password })
    if (res.user) setUser(res.user)
  }

  async function register(data: { email: string; name: string; password: string }) {
    const res = await api.post("/api/auth/sign-up/email", data)
    if (res.user) setUser(res.user)
  }

  async function logout() {
    await api.post("/api/auth/sign-out", {}).catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
