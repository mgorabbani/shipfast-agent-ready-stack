# ShipStack Agent

**Your fullstack app in 2 minutes.** A CLI scaffolder that creates production-grade fullstack projects from scratch — always using the latest package versions.

No stale templates. No boilerplate to maintain. Just a CLI that asks what you need, walks you through service signups, and generates a project with only the services you chose.

## Quick Start

### CLI Mode

```bash
npx shipstack-agent init
```

You'll be guided through:
1. Project name and frontend choice (Expo mobile or Vite+React web)
2. Service selection (payments, email, storage, AI, cron, webhooks, rate limiting)
3. API key setup — the CLI opens each service's dashboard in your browser and collects keys
4. Project generation — runs `npx create-expo-app@latest`, `npm create vite@latest`, etc.
5. AI docs generation — creates CLAUDE.md and PATTERNS.md tailored to your project

### Claude Code Mode

Open this repo in Claude Code and say:

> "Follow the GUIDE.md to set up a new project for me"

Claude reads GUIDE.md and walks you through the same steps interactively — asking about your choices, guiding you through service signups, and building the project from scratch.

## What Gets Generated

A **Turborepo monorepo** with only what you selected:

```
my-app/
├── apps/
│   ├── api/             → Fastify v5, Better Auth, Drizzle ORM
│   └── mobile/ or web/  → Expo or Vite+React+TailwindCSS
├── packages/
│   ├── db/              → Drizzle schema + PostgreSQL migrations
│   └── shared/          → Zod validation schemas + constants
├── CLAUDE.md            → AI-ready project documentation
├── docs/PATTERNS.md     → Step-by-step development recipes
├── docs/llms/           → Provider docs (better-auth.txt, stripe.txt, etc.)
├── .shipstack.json      → Your project config (for docs regeneration)
└── .env                 → API keys (auto-collected during setup)
```

## Available Services

Auth and database are always included. Everything else is opt-in:

| Service | What Gets Generated |
|---------|-------------------|
| **Auth** | Better Auth plugin, session/account tables, Google/GitHub OAuth |
| **Database** | Drizzle ORM, PostgreSQL (Neon, Railway, Docker, or custom URL) |
| **Payments** | Stripe checkout + webhooks (web) or RevenueCat entitlements (mobile) |
| **Email** | Resend plugin + email service helper |
| **Storage** | S3/R2 plugin, presigned upload/download routes, files table |
| **AI** | OpenAI or Fal.ai plugin + completion route |
| **Cron Jobs** | node-cron plugin with scheduler |
| **Webhooks** | Outbound dispatch service, endpoints table, HMAC signatures |
| **Rate Limiting** | @fastify/rate-limit plugin (100 req/min) |

## Why Not a Template?

Most scaffolders clone a template. That means dependencies go stale within weeks and you inherit tech debt from day one.

ShipStack Agent runs the real scaffold commands (`npx create-expo-app@latest`, `npm install fastify@latest`) so you always start with the latest versions. The only code in this repo is the CLI itself — zero boilerplate to maintain.

## Regenerate AI Docs

After evolving your scaffolded project, regenerate the AI documentation:

```bash
npx shipstack-agent docs
```

Reads `.shipstack.json` and refreshes CLAUDE.md, PATTERNS.md, and provider llms.txt files.

## Contributing

```bash
# Clone and install
git clone https://github.com/mgorabbani/shipfast-agent-ready-stack.git
cd shipfast-agent-ready-stack
npm install

# Test the CLI locally
cd packages/cli && npx tsx src/index.ts init

# Build
cd packages/cli && npm run build
```

See CLAUDE.md for repo conventions and how to add new services.

## License

MIT
