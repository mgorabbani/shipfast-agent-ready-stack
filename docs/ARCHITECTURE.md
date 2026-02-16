# Architecture Guide

## Overview

ShipFast Stack is a **Turborepo monorepo** with four packages:

| Package | Purpose | Tech |
|---------|---------|------|
| `apps/api` | REST API | Fastify v5, JWT, RBAC |
| `apps/mobile` | Mobile + Web app | Expo SDK 52, Expo Router v4 |
| `packages/db` | Database layer | Drizzle ORM, PostgreSQL |
| `packages/shared` | Shared code | Zod schemas, constants |

## Data Flow

```
Mobile App (Expo)
  ↓ HTTP (JWT in Authorization header)
API (Fastify)
  ↓ Drizzle ORM queries
PostgreSQL
```

## Package Dependencies

```
@shipfast/mobile → @shipfast/shared (Zod schemas, types)
@shipfast/api   → @shipfast/shared (validation)
                → @shipfast/db (database queries)
@shipfast/db    → (standalone, no internal deps)
@shipfast/shared → (standalone, no internal deps)
```

## Authentication Architecture

### Token Strategy
- **Access Token**: JWT, 15-minute expiry. Sent in `Authorization: Bearer <token>` header.
- **Refresh Token**: UUID, 7-day expiry. Stored in database. Rotated on each refresh.

### Flow
1. User logs in → API returns access + refresh tokens.
2. Mobile stores tokens (SecureStore on native, localStorage on web).
3. API client auto-attaches access token to all requests.
4. On 401 → client auto-refreshes using refresh token.
5. On refresh failure → redirect to login.

### RBAC
- Roles defined in DB schema (`user`, `admin`).
- `fastify.authenticate` — verifies JWT, rejects if invalid.
- `fastify.requireRole("admin")` — checks role after authentication.

## Database Architecture

### ORM: Drizzle
- Type-safe schema definitions in TypeScript.
- SQL-like query builder (no magic, predictable queries).
- Generated SQL migrations (reviewable before applying).

### Schema Organization
One file per domain. All exported from `schema/index.ts`.

### Naming Conventions
- Tables: `snake_case` plural (e.g., `users`, `items`).
- Columns: `snake_case` (e.g., `created_at`, `user_id`).
- TypeScript properties: `camelCase` (Drizzle maps automatically).

## Mobile Architecture

### Routing (Expo Router v4)
File-based routing. Directory structure = URL structure.
- `(auth)/` — unauthenticated group.
- `(tabs)/` — authenticated group with bottom tab navigation.

### State Management
- **Server state**: TanStack Query (queries + mutations + cache).
- **Auth state**: React Context (`AuthProvider`).
- **No global state library** needed for most apps. Add Zustand if you need complex client state.

### API Client
`lib/api.ts` provides `api.get()`, `api.post()`, `api.put()`, `api.delete()` with:
- Auto JWT attachment.
- Auto refresh on 401.
- Platform-aware token storage.

## Build System

Turborepo handles:
- Parallel builds across packages.
- Dependency-aware task ordering (`^build` means build deps first).
- Caching (except for `dev`, `db:*` tasks).
