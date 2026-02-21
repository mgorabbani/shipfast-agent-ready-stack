<p align="center">
  <h1 align="center">ShipFast Stack</h1>
  <p align="center">
    <strong>The fullstack starter that actually ships.</strong><br/>
    Production-grade. AI-powered. Claude Code-ready. Fork it. Build it. Ship it.
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#cli-scaffolder">CLI Scaffolder</a> · <a href="#whats-inside">What's Inside</a> · <a href="#ai-superpowers">AI Superpowers</a>
  </p>
</p>

---

> **Stop scaffolding. Start building.** ShipFast Stack gives you a battle-tested monorepo with auth, payments, email, storage, AI, and more — so you can focus on what makes your app unique.

## Quick Start

### Option A: Interactive CLI (Recommended)

```bash
npx shipstack-agent init my-app
```

The CLI will guide you through:
1. Choose frontend (Expo mobile or Vite+React web)
2. Pick services (payments, email, storage, AI, etc.)
3. Set up API keys with guided browser walkthroughs
4. Scaffold a project with only what you selected

### Option B: Clone and Configure

```bash
git clone https://github.com/mgorabbani/shipfast-agent-ready-stack.git my-app
cd my-app
npm install
cp .env.example .env
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

## CLI Scaffolder

The `shipstack-agent` CLI scaffolds projects from this template, removing services you don't need and wiring up everything automatically.

```bash
npx shipstack-agent init       # Interactive project setup
npx shipstack-agent docs       # Regenerate CLAUDE.md, PATTERNS.md, llms.txt
```

### What it does:
- Prompts for frontend choice (Expo or Vite+React)
- Lets you pick services: payments, email, storage, AI, cron, webhooks, rate limiting
- Opens each service's dashboard in your browser for API key setup
- Removes unused service files and patches imports
- Writes `.env` with your collected keys
- Generates dynamic AI documentation (CLAUDE.md, PATTERNS.md)
- Downloads provider llms.txt files for AI-assisted development

## What's Inside

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

## Available Services

| Service | Description |
|---------|-------------|
| **Auth** (always on) | Better Auth with email/password, Google, GitHub, magic link, 2FA |
| **Database** (always on) | Drizzle ORM + PostgreSQL (Neon, Railway, Docker, or custom) |
| **Payments** | Stripe (web) or RevenueCat (mobile) — checkout, subscriptions, webhooks |
| **Email** | Resend — transactional email with HTML templates |
| **Storage** | S3 or Cloudflare R2 — presigned upload/download URLs |
| **AI** | OpenAI or Fal.ai — text completion and image generation |
| **Cron Jobs** | Scheduled tasks with node-cron |
| **Webhooks** | Outbound webhook delivery with HMAC signatures |
| **Rate Limiting** | @fastify/rate-limit — 100 req/min default |

## Tech Stack

| Layer | What You Get |
|-------|-------------|
| **API** | Fastify v5 · Better Auth · RBAC · Zod validation |
| **Mobile** | Expo SDK 52 · React Native · Expo Router v4 |
| **Web** | Vite · React · TailwindCSS · React Router |
| **Database** | PostgreSQL 16 · Drizzle ORM · Type-safe migrations |
| **Data Fetching** | TanStack Query v5 · Session-based auth |
| **Validation** | Zod schemas shared between client & server |
| **Build** | Turborepo · npm workspaces · Parallel builds |
| **AI Dev** | Dynamic CLAUDE.md · PATTERNS.md · llms.txt |

## AI Superpowers

Every scaffolded project includes auto-generated AI documentation:

- **CLAUDE.md** — Project structure, active services, conventions, do/don't rules
- **docs/PATTERNS.md** — Step-by-step recipes for common tasks (tailored to your services)
- **docs/llms/*.txt** — Provider documentation for AI assistants

### Regenerate after changes

```bash
npx shipstack-agent docs
```

## Commands

```bash
npm run dev              # Start all apps
npm run db:push          # Push schema to DB
npm run db:generate      # Generate migration
npm run db:migrate       # Run migrations
npm run db:seed          # Seed demo data
npm run build            # Build all packages
```

## License

MIT
