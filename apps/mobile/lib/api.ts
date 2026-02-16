import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

const API_URL = __DEV__
  ? Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://10.0.2.2:3000" // Android emulator
  : "https://your-production-url.com"

// Platform-aware token storage
const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },
  async delete(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<any> {
  const accessToken = await storage.get("accessToken")

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  // Auto-refresh on 401
  if (res.status === 401 && accessToken) {
    const refreshToken = await storage.get("refreshToken")
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (refreshRes.ok) {
        const tokens = await refreshRes.json()
        await storage.set("accessToken", tokens.accessToken)
        await storage.set("refreshToken", tokens.refreshToken)

        // Retry original request
        return fetchWithAuth(path, options)
      }
    }

    // Refresh failed — clear tokens
    await storage.delete("accessToken")
    await storage.delete("refreshToken")
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return res.json()
}

export const api = {
  get: (path: string) => fetchWithAuth(path),
  post: (path: string, data?: any) =>
    fetchWithAuth(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: (path: string, data?: any) =>
    fetchWithAuth(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: (path: string) => fetchWithAuth(path, { method: "DELETE" }),
  storage,
}
