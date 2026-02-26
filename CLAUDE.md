# ShipStack Agent

CLI scaffolder that creates production-grade fullstack projects from scratch using the latest package versions.

**This repo contains no boilerplate code.** It's a CLI tool + a guide for Claude Code.

## Repo Structure

```
shipstack-agent/
├── packages/cli/          → The CLI tool (npm: shipstack-agent)
│   ├── src/commands/      → init and docs commands
│   ├── src/prompts/       → interactive CLI prompts
│   ├── src/onboarding/    → guided API key collection per service
│   ├── src/steps/         → scaffold steps (init monorepo, setup API, etc.)
│   ├── src/generators/    → code generators (DB schema, API code, etc.)
│   └── src/docs/          → CLAUDE.md, PATTERNS.md, llms.txt generators
├── GUIDE.md               → Step-by-step guide for Claude Code to follow
├── CLAUDE.md              → This file
└── README.md
```

## How It Works

### CLI Mode (`npx shipstack-agent init`)
1. Prompts for project name, frontend (Expo/Vite+React), services
2. Opens each service's dashboard in browser for API key setup
3. Runs real scaffold commands (`npx create-expo-app`, `npm create vite`, etc.)
4. Generates source code dynamically based on selections
5. Installs all dependencies (always gets latest versions)
6. Generates AI documentation for the new project

### Claude Code Mode (GUIDE.md)
Claude Code reads GUIDE.md and follows the steps interactively, asking the user about choices and walking them through service signups.

## Key Commands

```bash
# Test CLI locally
cd packages/cli && npx tsx src/index.ts init

# Build CLI
cd packages/cli && npm run build
```

## Available Services (generated into scaffolded projects)

| Service | What Gets Generated |
|---------|-------------------|
| Auth (Better Auth) | Auth plugin, session tables, social providers |
| Payments (Stripe) | Stripe plugin, checkout route, webhook handler, subscriptions table |
| Payments (RevenueCat) | RevenueCat plugin, entitlements route, webhook handler |
| Email (Resend) | Email plugin, email service helper |
| Storage (S3/R2) | S3 plugin, presigned upload/download routes, files table |
| AI (OpenAI/Fal.ai) | AI plugin, completion route |
| Cron Jobs | Cron plugin with scheduler |
| Webhooks | Webhook dispatch service, endpoints table, CRUD routes |
| Rate Limiting | @fastify/rate-limit plugin |

## Code Style (for this repo)

- No semicolons, 2-space indentation
- Prefer `const` over `let`, never `var`
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

## Adding a New Service to the CLI

1. Add the service type to `src/types.ts`
2. Add prompt option in `src/prompts/services.ts`
3. Add onboarding flow in `src/onboarding/<service>.ts` → register in `src/onboarding/index.ts`
4. Add dependency in `src/steps/setupApi.ts`
5. Add schema generator in `src/generators/dbSchema.ts` (if DB tables needed)
6. Add plugin/route generator in `src/generators/apiCode.ts`
7. Add documentation section in `src/docs/claudemd.ts` and `src/docs/patterns.ts`
8. Update GUIDE.md with the new service's setup steps
