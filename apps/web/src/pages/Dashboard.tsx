import { useAuth } from "../lib/auth"

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold">ShipFast</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name ?? user?.email}!</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="font-semibold">Getting Started</h3>
            <p className="mt-2 text-sm text-gray-600">Check CLAUDE.md for conventions and patterns.</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="font-semibold">API Health</h3>
            <p className="mt-2 text-sm text-gray-600">GET /api/health to verify the API is running.</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="font-semibold">Documentation</h3>
            <p className="mt-2 text-sm text-gray-600">See docs/PATTERNS.md for development recipes.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
