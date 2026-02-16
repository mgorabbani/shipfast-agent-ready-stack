# ShipFast Stack

Production-grade, Claude Code-enabled fullstack monorepo starter.

## Project Overview

This is a **Turborepo monorepo** with:
- `apps/api` — Fastify v5 REST API (TypeScript)
- `apps/mobile` — Expo SDK 52 mobile app (iOS/Android/Web)
- `packages/db` — Drizzle ORM, PostgreSQL schema & migrations
- `packages/shared` — Shared Zod schemas, types & constants

## Architecture

```
shipfast-stack/
├── apps/
│   ├── api/          → Fastify v5, JWT auth, RBAC
│   └── mobile/       → Expo Router v4, TanStack Query
├── packages/
│   ├── db/           → Drizzle ORM, PostgreSQL
│   └── shared/       → Zod schemas, shared types
├── docker-compose.yml
└── turbo.json
```

## Core Conventions

### Package References
- Import from `@shipfast/db` and `@shipfast/shared` — never use relative paths across packages.
- All shared types and validation schemas live in `packages/shared`.
- Database schema and queries live in `packages/db`.

### TypeScript
- Strict mode enabled everywhere.
- Use `type` imports when importing only types: `import type { User } from "@shipfast/db"`.
- Prefer `interface` for object shapes, `type` for unions/intersections.

### Code Style
- No semicolons (Prettier default for this project).
- 2-space indentation.
- Prefer `const` over `let`. Never use `var`.
- Use arrow functions for callbacks, regular functions for top-level declarations.

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Keep the first line under 72 characters.
- Reference issue numbers when applicable.

### Error Handling
- API routes: throw Fastify errors with proper HTTP status codes.
- Never silently swallow errors. Log or re-throw.
- Use Zod for all input validation at API boundaries.

## Key Commands

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev --filter=api # Start only the API

# Database
npm run db:generate      # Generate migration from schema changes
npm run db:migrate       # Run pending migrations
npm run db:push          # Push schema directly (dev only)
npm run db:seed          # Seed database with sample data

# Build
npm run build            # Build all packages
npm run typecheck        # Type-check all packages
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for access tokens
- `JWT_REFRESH_SECRET` — Secret for refresh tokens

## Adding a New Feature

When adding a new feature (e.g., "posts"), follow this order:

1. **Schema** — Add table in `packages/db/src/schema/`, export from index.
2. **Migration** — Run `npm run db:generate` then `npm run db:migrate`.
3. **Shared types** — Add Zod schemas in `packages/shared/src/schemas/`.
4. **API route** — Create route file in `apps/api/src/routes/`, register in `index.ts`.
5. **Mobile screens** — Add screens in `apps/mobile/app/(tabs)/`.

## Auth System

- JWT access tokens (15 min) + refresh tokens (7 days).
- Refresh token rotation on each refresh.
- RBAC with permission-based access control.
- Protected routes use `fastify.authenticate` preHandler.
- Permission checks use `fastify.requirePermission()`.

## Testing

- API: Use Vitest (configured but tests are yours to write).
- Mobile: Use Jest + React Native Testing Library.
- Always co-locate test files next to source: `auth.test.ts` beside `auth.ts`.
