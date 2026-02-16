import React, { createContext, useContext, useState, useEffect } from "react"
import { api } from "./api"

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; username: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const token = await api.storage.get("accessToken")
      if (token) {
        const profile = await api.get("/api/profile")
        setUser(profile)
      }
    } catch {
      await api.storage.delete("accessToken")
      await api.storage.delete("refreshToken")
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post("/api/auth/login", { email, password })
    await api.storage.set("accessToken", res.accessToken)
    await api.storage.set("refreshToken", res.refreshToken)
    setUser(res.user)
  }

  async function register(data: { email: string; username: string; password: string; firstName: string; lastName: string }) {
    const res = await api.post("/api/auth/register", data)
    await api.storage.set("accessToken", res.accessToken)
    await api.storage.set("refreshToken", res.refreshToken)
    setUser(res.user)
  }

  async function logout() {
    const refreshToken = await api.storage.get("refreshToken")
    if (refreshToken) {
      await api.post("/api/auth/logout", { refreshToken }).catch(() => {})
    }
    await api.storage.delete("accessToken")
    await api.storage.delete("refreshToken")
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
