import { Slot, useRouter, useSegments } from "expo-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "../lib/query-client"
import { AuthProvider, useAuth } from "../lib/auth"
import { useEffect } from "react"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    const inAuthGroup = segments[0] === "(auth)"

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login")
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)/dashboard")
    }
  }, [user, isLoading, segments])

  if (isLoading) return null

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Slot />
        </AuthGuard>
      </AuthProvider>
    </QueryClientProvider>
  )
}
