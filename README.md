# ShipStack Agent

**Your backend in 2 minutes.** An interactive CLI that scaffolds production-grade fullstack projects from scratch — always using the latest package versions.

No stale templates. No boilerplate to maintain. Just a smart CLI that asks what you need, sets up your accounts, and generates a project with only the services you chose.

## Quick Start

```bash
npx shipstack-agent init my-app
```

The CLI will:
1. Ask which frontend you want (Expo mobile or Vite+React web)
2. Let you pick services (payments, email, storage, AI, etc.)
3. Walk you through API key setup by opening each service in your browser
4. Scaffold a complete project using `npx create-expo-app`, `npm create vite`, etc.
5. Generate all source code (auth, routes, DB schema) based on your selections
6. Install latest versions of everything
7. Generate AI documentation (CLAUDE.md, PATTERNS.md) for your project

## Claude Code Mode

Don't want to use the CLI? Open this repo in Claude Code and say:

> "Follow the GUIDE.md to set up a new project for me"

Claude will walk you through the same steps interactively — asking about your choices, opening signup pages, and building everything from scratch.

## What Gets Generated

The CLI creates a **Turborepo monorepo** with:

```
my-app/
├── apps/
│   ├── api/          → Fastify, Better Auth, Drizzle ORM
│   └── mobile/       → Expo (or apps/web/ → Vite+React)
├── packages/
│   ├── db/           → Drizzle schema + migrations
│   └── shared/       → Zod validation schemas
├── CLAUDE.md         → AI documentation (auto-generated)
├── docs/PATTERNS.md  → Development recipes (auto-generated)
└── .env              → Your API keys (auto-collected)
```

## Available Services

| Service | Description |
|---------|-------------|
| **Auth** (always on) | Better Auth — email/password, Google, GitHub |
| **Database** (always on) | Drizzle ORM + PostgreSQL (Neon, Railway, Docker, or custom) |
| **Payments** | Stripe (web) or RevenueCat (mobile) |
| **Email** | Resend — transactional email |
| **Storage** | S3 or Cloudflare R2 — presigned uploads |
| **AI** | OpenAI or Fal.ai — completions + image generation |
| **Cron Jobs** | node-cron — scheduled tasks |
| **Webhooks** | Outbound delivery with HMAC signatures |
| **Rate Limiting** | @fastify/rate-limit |

## Why No Template?

Most CLI scaffolders clone a template repo. That means:
- Dependencies go stale within weeks
- You inherit tech debt from day one
- The maintainer has to keep the whole stack up to date

**ShipStack Agent takes a different approach.** It runs the actual scaffold commands (`npx create-expo-app@latest`, `npm install fastify@latest`, etc.) so you always get the latest versions. The only code in this repo is the CLI itself.

## Regenerate AI Docs

After making changes to your scaffolded project:

```bash
npx shipstack-agent docs
```

This regenerates CLAUDE.md and PATTERNS.md based on your `.shipstack.json` config.

## Development

```bash
# Test CLI locally
cd packages/cli && npx tsx src/index.ts init

# Build for publishing
cd packages/cli && npm run build
```

## License

MIT
