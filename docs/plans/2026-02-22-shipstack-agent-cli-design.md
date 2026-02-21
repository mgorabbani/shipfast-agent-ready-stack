# ShipStack Agent CLI — Design Document

**Date**: 2026-02-22
**Status**: Approved

## Overview

Transform shipfast-stack from a clone-and-use template into an AI-native backend scaffolder with a CLI (`npx shipstack-agent init`) that guides developers through project setup with interactive service selection, guided third-party API key onboarding, and AI-readable documentation generation.

## Goals

1. **2-minute setup**: `npx shipstack-agent init` → working backend with auth, DB, payments, email, etc.
2. **AI-native**: Generated projects include CLAUDE.md, PATTERNS.md, and provider llms.txt files so AI agents can understand and extend the codebase correctly.
3. **Guided onboarding**: CLI opens browser for service signups, guides key entry, validates keys work.
4. **Platform-aware**: Mobile (Expo) gets RevenueCat + Expo Notifications. Web (Vite+React) gets Stripe + Web Push.
5. **Open source first**: Validate demand, then potentially productize as hosted BaaS.

## Architecture

### CLI Package

```
packages/cli/
├── package.json          # name: "shipstack-agent", bin: { "shipstack-agent": "./dist/index.js" }
├── src/
│   ├── index.ts          # Entry: parse args → route to command
│   ├── commands/
│   │   ├── init.ts       # Main scaffolding flow
│   │   └── docs.ts       # Regenerate AI docs
│   ├── prompts/
│   │   ├── project.ts    # Project name, directory
│   │   ├── services.ts   # Service selection (platform-aware)
│   │   ├── frontend.ts   # Expo OR Vite+React
│   │   └── onboarding/
│   │       ├── database.ts   # Postgres setup (Neon/Railway/Docker)
│   │       ├── auth.ts       # Better Auth provider selection
│   │       ├── stripe.ts     # Stripe keys (web projects)
│   │       ├── revenuecat.ts # RevenueCat keys (mobile projects)
│   │       ├── resend.ts     # Resend API key
│   │       ├── storage.ts    # S3/R2 credentials
│   │       └── ai.ts         # Fal.ai/OpenAI keys
│   ├── scaffold/
│   │   ├── clone.ts      # Clone template, clean git history
│   │   ├── services.ts   # Add/remove service files based on selection
│   │   ├── patchEnv.ts   # Write .env with collected keys
│   │   └── patchDocs.ts  # Generate CLAUDE.md, PATTERNS.md, download llms.txt
│   └── utils/
│       ├── browser.ts    # Open URLs in browser
│       ├── validate.ts   # Validate API keys with test calls
│       └── ui.ts         # Spinners, colors, prompts
```

### CLI Flow

```
npx shipstack-agent init

1. Project name → my-app
2. Frontend → Expo (mobile) OR Vite+React (web)
3. Service selection (checklist, platform-aware):
   ☑ Auth (always included — Better Auth)
   ☑ Database (always included — Drizzle + PostgreSQL)
   ☐ Payments (Stripe for web / RevenueCat for mobile)
   ☐ Email (Resend)
   ☐ Storage (S3 / Cloudflare R2)
   ☐ AI (Fal.ai / OpenAI)
   ☐ Cron Jobs
   ☐ Webhooks (outbound)
   ☐ Rate Limiting

4. Auth providers (sub-prompt):
   ☑ Email + Password
   ☐ Google
   ☐ GitHub
   ☐ Magic Link
   ☐ Two-Factor (2FA)

5. Guided onboarding per service:
   → Opens browser to signup page
   → Shows step-by-step instructions in terminal
   → Waits for API key paste
   → Validates key with test API call
   → Moves to next service

6. Scaffold:
   → Clone shipfast-stack template
   → Remove files for unselected services
   → Write .env with collected keys
   → Generate CLAUDE.md (dynamic, based on selections)
   → Generate PATTERNS.md (recipes for selected services)
   → Download llms.txt from each provider → docs/llms/

7. Done:
   cd my-app && npm install && npm run dev
```

## Services

### Already Implemented (in shipfast-stack)

- **Auth**: JWT + RBAC → REPLACE with Better Auth
- **Database**: Drizzle ORM + PostgreSQL ✅
- **Expo Mobile App**: SDK 52 + file routing ✅
- **Items CRUD Example**: Full pattern ✅
- **Turborepo**: Monorepo orchestration ✅

### To Add

#### Auth (Better Auth) — replaces custom JWT
- `apps/api/src/plugins/auth.ts` → Better Auth Fastify integration
- Social login providers (Google, GitHub, etc.)
- Email verification, password reset
- 2FA plugin (optional)
- Magic links (optional)
- Update `packages/db` schema for Better Auth tables

#### Payments — Stripe (web)
- `apps/api/src/plugins/stripe.ts` — Stripe client decorator
- `apps/api/src/routes/payments.ts` — checkout, subscriptions, portal
- `apps/api/src/webhooks/stripe.ts` — webhook event handlers
- `packages/db/src/schema/subscriptions.ts` — plans, subscriptions, payments
- `packages/shared/src/schemas/payments.ts` — Zod schemas

#### Payments — RevenueCat (mobile)
- `apps/api/src/plugins/revenuecat.ts` — RevenueCat server SDK
- `apps/api/src/routes/subscriptions.ts` — entitlement verification
- `apps/api/src/webhooks/revenuecat.ts` — webhook handler
- `apps/mobile/lib/purchases.ts` — RevenueCat React Native SDK

#### Email (Resend)
- `apps/api/src/plugins/email.ts` — Resend client decorator
- `apps/api/src/services/email.ts` — send() helper
- `apps/api/src/emails/` — templates (welcome, reset, receipt)

#### Storage (S3/R2)
- `apps/api/src/plugins/storage.ts` — S3 client decorator
- `apps/api/src/routes/upload.ts` — presigned URLs, file metadata
- `apps/api/src/services/storage.ts` — upload, delete, getUrl
- `packages/db/src/schema/files.ts` — files table

#### AI Services (Fal.ai / OpenAI)
- `apps/api/src/plugins/ai.ts` — provider client
- `apps/api/src/routes/ai.ts` — completion, image gen endpoints
- `apps/api/src/services/ai.ts` — provider abstraction

#### Cron Jobs
- `apps/api/src/plugins/cron.ts` — node-cron setup
- `apps/api/src/cron/` — individual job files
- `apps/api/src/cron/example.ts` — cleanup expired tokens

#### Webhooks (outbound)
- `apps/api/src/routes/webhooks.ts` — register/manage subscriptions
- `apps/api/src/services/webhook.ts` — event dispatcher
- `packages/db/src/schema/webhooks.ts` — endpoints + events tables

#### Rate Limiting
- `apps/api/src/plugins/rateLimit.ts` — @fastify/rate-limit config

#### Vite+React Frontend (optional, alternative to Expo)
```
apps/web/
├── src/
│   ├── pages/           # React Router pages
│   ├── components/      # Shadcn/ui components
│   ├── lib/
│   │   ├── api.ts       # Fetch wrapper
│   │   └── auth.tsx     # Better Auth React client
│   └── main.tsx
├── CLAUDE.md
└── package.json
```

## AI Documentation System

### Generated Files

#### `CLAUDE.md` (root — dynamic)
- Project structure overview
- Active services list (based on selection)
- Available commands
- Coding conventions
- Links to pattern docs and provider llms.txt

#### `docs/PATTERNS.md` (dynamic)
Step-by-step recipes for each selected service:
- "Adding a new DB model"
- "Adding a new API route"
- "Adding a Stripe webhook handler" (if Stripe selected)
- "Adding an email template" (if Resend selected)
- "Adding a cron job" (if cron selected)

#### `docs/llms/*.txt` (downloaded from providers)
- `stripe.txt` — from docs.stripe.com/llms.txt
- `better-auth.txt` — from better-auth.com/llms.txt
- `resend.txt` — from resend.com/llms.txt
- `revenuecat.txt` — from revenuecat.com/docs/llms.txt
- `fal-ai.txt` — from fal.ai/llms.txt

#### Per-package `CLAUDE.md` files (already exist, enhanced)
- `apps/api/CLAUDE.md` — route patterns, middleware, auth
- `apps/mobile/CLAUDE.md` — Expo conventions
- `apps/web/CLAUDE.md` — Vite+React conventions (new)
- `packages/db/CLAUDE.md` — schema conventions
- `packages/shared/CLAUDE.md` — validation patterns

### `npx shipstack-agent docs` Command
Regenerates AI documentation by:
1. Scanning project for active services, routes, models
2. Updating CLAUDE.md with current state
3. Updating PATTERNS.md with relevant recipes
4. Re-downloading llms.txt from providers (fresh versions)

## Guided Onboarding Details

| Service | Flow |
|---------|------|
| Database | Ask: Neon (free) / Railway / Docker / paste URL → test connection |
| Better Auth | Auto-generate secret → ask which social providers → guide OAuth setup |
| Stripe | Open dashboard.stripe.com/apikeys → paste keys → validate → setup webhook with Stripe CLI |
| RevenueCat | Open app.revenuecat.com → create project → paste API key → validate |
| Resend | Open resend.com/signup → paste API key → validate with test email |
| Storage | Ask: R2/S3 → open provider → paste credentials → validate by listing buckets |
| AI | Ask: OpenAI/Fal.ai → open provider → paste key → validate with test call |

## Platform-Aware Defaults

| Feature | Web (Vite+React) | Mobile (Expo) |
|---------|-----------------|---------------|
| Payments | Stripe (checkout + subscriptions) | RevenueCat (in-app purchases) |
| Push Notifications | Web Push API | Expo Notifications |
| Deep Linking | React Router | Expo Linking |
| Secure Storage | localStorage/cookie | expo-secure-store |
| Auth UI | Custom React forms | Custom RN forms |

## Tech Stack

- **Runtime**: Node.js ≥ 20
- **API**: Fastify v5
- **Auth**: Better Auth
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Validation**: Zod
- **Monorepo**: Turborepo + npm workspaces
- **CLI**: Commander.js + Inquirer.js (or Clack)
- **Mobile**: Expo SDK 52
- **Web**: Vite + React + Shadcn/ui + TailwindCSS
- **TypeScript**: Strict mode throughout

## Non-Goals (v1)

- Multi-tenancy
- Admin dashboard UI
- GraphQL (REST only)
- Hosted/managed version
- Database GUI
- CI/CD pipeline generation
