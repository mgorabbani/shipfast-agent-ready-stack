# ShipFast Stack

Production-grade, AI-native fullstack monorepo starter with CLI scaffolder.

## Project Overview

This is a **Turborepo monorepo** with:
- `apps/api` — Fastify v5 REST API (TypeScript, Better Auth, RBAC)
- `apps/mobile` — Expo SDK 52 mobile app (iOS/Android/Web)
- `apps/web` — Vite + React + TailwindCSS web app (optional)
- `packages/cli` — `shipstack-agent` CLI scaffolder
- `packages/db` — Drizzle ORM, PostgreSQL schema & migrations
- `packages/shared` — Shared Zod schemas, types & constants
- `.claude/skills/` — Claude Code skills (image generation, etc.)

## Architecture

```
shipfast-stack/
├── apps/
│   ├── api/          → Fastify v5, Better Auth, RBAC
│   ├── mobile/       → Expo Router v4, TanStack Query
│   └── web/          → Vite + React + TailwindCSS (optional)
├── packages/
│   ├── cli/          → shipstack-agent CLI scaffolder
│   ├── db/           → Drizzle ORM, PostgreSQL
│   └── shared/       → Zod schemas, shared types
├── docker-compose.yml
└── turbo.json
```

## CLI Scaffolder (`packages/cli/`)

The `shipstack-agent` CLI scaffolds new projects from this template:

```bash
npx shipstack-agent init       # Interactive project setup
npx shipstack-agent docs       # Regenerate AI docs
```

### How the scaffold engine works:
1. Clones this template via degit
2. Prompts for frontend (Expo or Vite+React) and services
3. Guides API key onboarding with browser integration
4. Prunes unselected service files and patches imports
5. Writes `.env` with collected keys
6. Generates dynamic CLAUDE.md, PATTERNS.md, and downloads llms.txt

### CLI structure:
- `src/commands/` — init and docs commands
- `src/prompts/` — interactive CLI prompts (project, frontend, services)
- `src/onboarding/` — guided API key collection per service
- `src/scaffold/` — clone, prune, patch engine
- `src/docs/` — CLAUDE.md, PATTERNS.md, llms.txt generators

## Available Services

| Service | Plugin | Routes | DB Schema |
|---------|--------|--------|-----------|
| Auth (Better Auth) | `plugins/auth.ts` | `/api/auth/*` (auto) | users, sessions, accounts |
| Payments (Stripe) | `plugins/stripe.ts` | `/api/payments/*` | subscriptions, payments |
| Payments (RevenueCat) | `plugins/revenuecat.ts` | `/api/subscriptions/*` | subscriptions |
| Email (Resend) | `plugins/email.ts` | — (service) | — |
| Storage (S3/R2) | `plugins/storage.ts` | `/api/files/*` | files |
| AI (OpenAI/Fal.ai) | `plugins/ai.ts` | `/api/ai/*` | — |
| Cron Jobs | `plugins/cron.ts` | — | — |
| Webhooks (outbound) | — | `/api/webhook-endpoints/*` | webhook_endpoints |
| Rate Limiting | `plugins/rateLimit.ts` | — | — |

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

# CLI
cd packages/cli && npx tsx src/index.ts init   # Test CLI locally
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Secret for Better Auth sessions

## Adding a New Feature

When adding a new feature (e.g., "posts"), follow this order:

1. **Schema** — Add table in `packages/db/src/schema/`, export from index.
2. **Migration** — Run `npm run db:generate` then `npm run db:migrate`.
3. **Shared types** — Add Zod schemas in `packages/shared/src/schemas/`.
4. **API route** — Create route file in `apps/api/src/routes/`, register in `index.ts`.
5. **Frontend** — Add screens in `apps/mobile/` or `apps/web/`.

## Auth System

- Better Auth with session-based authentication.
- Social providers: Google, GitHub (configurable via env vars).
- Protected routes use `fastify.authenticate` preHandler.
- `request.user` contains `{ id, email, role }` after authentication.

## Testing

- API: Use Vitest (configured but tests are yours to write).
- Mobile: Use Jest + React Native Testing Library.
- Always co-locate test files next to source: `auth.test.ts` beside `auth.ts`.
