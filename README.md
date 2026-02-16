# ShipFast Stack

> Production-grade, Claude Code-enabled fullstack monorepo starter.

Build fullstack TypeScript apps fast with **Fastify + Expo + Drizzle ORM + PostgreSQL** — all wired together in a Turborepo monorepo with comprehensive AI-powered development guides.

## Why ShipFast Stack?

- **AI-First DX** — Every package has a `CLAUDE.md` that teaches Claude Code the patterns, conventions, and architecture of your project. Claude Code doesn't just edit files — it understands how your codebase works.
- **Production Patterns** — JWT auth with refresh token rotation, RBAC, Zod validation, type-safe database queries — not a toy starter.
- **Cross-Platform** — One codebase for iOS, Android, and Web via Expo.
- **End-to-End Type Safety** — Shared Zod schemas validated on both client and server. Drizzle ORM gives you typed database queries.

## Tech Stack

| Layer | Tech |
|-------|------|
| **API** | Fastify v5, TypeScript, JWT |
| **Mobile/Web** | Expo SDK 52, React Native, Expo Router v4 |
| **Database** | PostgreSQL 16, Drizzle ORM |
| **Data Fetching** | TanStack Query v5 |
| **Validation** | Zod (shared between client & server) |
| **Monorepo** | Turborepo, npm workspaces |
| **AI Dev** | CLAUDE.md files in every package |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/shipfast-stack.git
cd shipfast-stack
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Configure environment
cp .env.example .env

# 4. Set up database
npm run db:push

# 5. Seed demo data (optional)
npm run db:seed

# 6. Start development
npm run dev
```

API runs on `http://localhost:3000`, Expo on `http://localhost:8081`.

Demo credentials: `demo@shipfast.dev` / `password123`

## Project Structure

```
shipfast-stack/
├── CLAUDE.md                  # Root AI instructions
├── apps/
│   ├── api/                   # Fastify REST API
│   │   ├── CLAUDE.md          # API patterns & conventions
│   │   └── src/
│   │       ├── plugins/       # auth, db, cors
│   │       └── routes/        # auth, profile, items
│   └── mobile/                # Expo app (iOS/Android/Web)
│       ├── CLAUDE.md          # Mobile patterns & conventions
│       ├── app/               # File-based routing
│       ├── lib/               # api client, auth, query client
│       └── components/
├── packages/
│   ├── db/                    # Drizzle ORM + PostgreSQL
│   │   ├── CLAUDE.md          # Schema & migration conventions
│   │   └── src/schema/        # Table definitions
│   └── shared/                # Zod schemas + constants
│       ├── CLAUDE.md          # Shared code conventions
│       └── src/
├── docs/
│   ├── ARCHITECTURE.md        # Full architecture guide
│   └── CONTRIBUTING.md
├── scripts/
│   └── seed.ts
├── docker-compose.yml
└── turbo.json
```

## Using with Claude Code

This template is optimized for [Claude Code](https://claude.com/claude-code). The `CLAUDE.md` files teach Claude:

- **Root CLAUDE.md** — Project overview, monorepo conventions, key commands, feature development workflow.
- **apps/api/CLAUDE.md** — Route patterns, plugin architecture, auth flow, request validation.
- **apps/mobile/CLAUDE.md** — Expo Router conventions, TanStack Query patterns, auth flow, component patterns.
- **packages/db/CLAUDE.md** — Schema conventions, migration workflow, query patterns.
- **packages/shared/CLAUDE.md** — What belongs here, schema conventions, constant patterns.

**Try it:** Open the project in Claude Code and ask "Add a posts feature with title and content" — it will follow the established patterns automatically.

## Adding a New Feature

Follow this order (documented in root CLAUDE.md):

1. **Schema** — Add table in `packages/db/src/schema/`
2. **Migration** — `npm run db:generate && npm run db:migrate`
3. **Shared types** — Add Zod schemas in `packages/shared/src/schemas/`
4. **API route** — Create route in `apps/api/src/routes/`, register in `index.ts`
5. **Mobile screens** — Add screens in `apps/mobile/app/(tabs)/`

## What's Included

- [x] JWT authentication with refresh token rotation
- [x] Role-based access control (RBAC)
- [x] Zod validation (shared client + server)
- [x] Type-safe database queries (Drizzle ORM)
- [x] Auto token refresh on 401
- [x] File-based routing (Expo Router)
- [x] TanStack Query data fetching
- [x] Platform-aware secure storage
- [x] Docker Compose for PostgreSQL
- [x] Database seed script
- [x] Comprehensive CLAUDE.md files

## License

MIT
