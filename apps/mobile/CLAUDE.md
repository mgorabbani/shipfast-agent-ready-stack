# Mobile App (@shipfast/mobile)

Expo SDK 52 app with file-based routing, TanStack Query, and JWT auth.

## Architecture

```
app/
├── _layout.tsx              # Root: QueryClient + AuthProvider + AuthGuard
├── (auth)/
│   ├── _layout.tsx          # Auth layout (no tabs)
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/
    ├── _layout.tsx          # Tab navigation
    ├── dashboard/
    │   └── index.tsx
    └── items/
        └── index.tsx        # CRUD example screen

lib/
├── api.ts                   # Fetch wrapper with auto token refresh
├── auth.tsx                 # AuthContext + useAuth hook
└── query-client.ts          # TanStack Query config

components/
└── PageContainer.tsx        # Consistent layout wrapper
```

## Routing Conventions

- **Expo Router v4** — file-based routing.
- `(auth)/` group — unauthenticated screens.
- `(tabs)/` group — authenticated screens with bottom tabs.
- Use `_layout.tsx` in each group for navigation config.
- Deep link format: `/dashboard`, `/items`.

## Data Fetching Pattern

Use TanStack Query for all API calls:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: () => api.get("/api/items"),
})
```

Mutations with cache invalidation:
```typescript
const mutation = useMutation({
  mutationFn: (data) => api.post("/api/items", data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
})
```

## API Client (`lib/api.ts`)

- Auto-attaches JWT to all requests.
- Auto-refreshes on 401 responses.
- Platform-aware storage (SecureStore on native, localStorage on web).
- Base URL configurable via environment.

## Auth Flow

1. `AuthContext` wraps the app, provides `useAuth()` hook.
2. On mount, checks stored tokens and restores session.
3. Login/register store tokens and set user state.
4. `AuthGuard` in root layout redirects to login if unauthenticated.

## Adding a New Screen

1. Create file in `app/(tabs)/my-feature/index.tsx`.
2. Add tab in `app/(tabs)/_layout.tsx`.
3. Use `useQuery` for data fetching.
4. Use `useMutation` for create/update/delete.

## Component Conventions

- Use `PageContainer` wrapper for consistent padding.
- Use React Native's built-in components (View, Text, Pressable).
- Keep screen files focused — extract reusable components to `components/`.
- Platform-specific code: use `Platform.OS` checks sparingly, prefer responsive design.
