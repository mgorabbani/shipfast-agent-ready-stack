# ShipFast Stack — Claude Code Setup Guide

Follow this guide step-by-step. At each decision point, **ask the user** what they want. Do not assume choices — always confirm.

---

## Step 1: Project Setup

Ask the user:
- "What should the project be called?" (lowercase, hyphens only)
- Create the project directory and initialize it:

```bash
mkdir <project-name> && cd <project-name>
```

Create a monorepo root `package.json`:
```json
{
  "name": "<project-name>",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "db:push": "turbo db:push",
    "db:generate": "turbo db:generate",
    "db:migrate": "turbo db:migrate"
  },
  "devDependencies": {
    "turbo": "latest",
    "tsx": "latest"
  }
}
```

Create `turbo.json`, `.gitignore`, `apps/`, `packages/` directories.

---

## Step 2: Choose Frontend

Ask the user:
> "Which frontend do you want?"
> - **Expo** (iOS, Android, Web — React Native)
> - **Vite + React** (Web SPA with TailwindCSS)

### If Expo:
```bash
npx create-expo-app@latest apps/mobile --template blank-typescript
```

### If Vite + React:
```bash
npm create vite@latest apps/web -- --template react-ts
cd apps/web && npm install tailwindcss @tailwindcss/vite
```
Then configure TailwindCSS in `vite.config.ts` and `src/index.css`.

---

## Step 3: Choose Services

Ask the user:
> "Which services do you want? (Auth + Database are always included)"
> - [ ] Payments (Stripe or RevenueCat)
> - [ ] Email (Resend)
> - [ ] File Storage (S3 / Cloudflare R2)
> - [ ] AI (OpenAI / Fal.ai)
> - [ ] Cron Jobs
> - [ ] Webhooks (outbound)
> - [ ] Rate Limiting

For each selected service, ask follow-up questions:
- **Payments**: "Stripe (web checkout) or RevenueCat (mobile in-app purchases)?"
- **Storage**: "Cloudflare R2 (free egress) or AWS S3?"
- **AI**: "OpenAI (GPT, DALL-E) or Fal.ai (fast image/video)?"

---

## Step 4: Set Up Database

Ask the user:
> "How do you want to run PostgreSQL?"
> - **Neon** (free serverless — recommended)
> - **Railway** ($5/mo managed)
> - **Docker** (local docker-compose)
> - **Custom** (I have a connection string)

### If Neon:
1. Ask user to go to https://console.neon.tech/signup
2. Create a free account and project
3. Ask them to paste the connection string (starts with `postgresql://`)

### If Railway:
1. Ask user to go to https://railway.app/new
2. Provision PostgreSQL, copy DATABASE_URL from Variables tab

### If Docker:
- Generate a random password
- Create `docker-compose.yml` with postgres:17
- Set `DATABASE_URL=postgresql://shipfast:<password>@localhost:5432/shipfast`

### If Custom:
- Ask user to paste their PostgreSQL connection string

---

## Step 5: Set Up Database Package

```bash
mkdir -p packages/db/src/schema
```

Install dependencies:
```bash
cd packages/db && npm init -y
npm install drizzle-orm postgres
npm install -D drizzle-kit typescript
```

Create `drizzle.config.ts`, schema files for:
- `users.ts` — Better Auth tables (users, sessions, accounts, verifications)
- `items.ts` — Example CRUD model
- Additional schemas based on selected services (subscriptions, files, webhooks)

---

## Step 6: Set Up Shared Package

```bash
mkdir -p packages/shared/src/{schemas,constants}
npm install zod
```

Create Zod validation schemas for auth, items, and any selected services.

---

## Step 7: Set Up API

```bash
mkdir -p apps/api/src/{plugins,routes,lib}
npm install fastify @fastify/cors better-auth dotenv drizzle-orm postgres zod
```

Install **only** the service dependencies the user selected:
- Payments (Stripe): `npm install stripe`
- Email: `npm install resend`
- Storage: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- AI (OpenAI): `npm install openai`
- AI (Fal.ai): `npm install @fal-ai/client`
- Cron: `npm install node-cron && npm install -D @types/node-cron`
- Rate Limiting: `npm install @fastify/rate-limit`

Create:
- `src/lib/auth.ts` — Better Auth instance with Drizzle adapter
- `src/plugins/db.ts` — Database connection
- `src/plugins/cors.ts` — CORS config
- `src/plugins/auth.ts` — Auth middleware + Better Auth route handler
- Service-specific plugins (only for selected services)
- `src/routes/items.ts` — Example CRUD routes
- Service-specific routes (only for selected services)
- `src/index.ts` — Wire up only the selected plugins and routes

---

## Step 8: Set Up Auth Providers

Ask the user:
> "Which auth providers do you want?"
> - [x] Email + Password (default, always on)
> - [ ] Google
> - [ ] GitHub
> - [ ] Magic Link
> - [ ] Two-Factor (2FA)

### If Google:
1. Tell user to go to https://console.cloud.google.com/apis/credentials
2. Create OAuth client ID (Web application)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Ask user to paste `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### If GitHub:
1. Tell user to go to https://github.com/settings/applications/new
2. Set callback URL: `http://localhost:3000/api/auth/callback/github`
3. Ask user to paste `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

Generate a random `BETTER_AUTH_SECRET` automatically.

---

## Step 9: Set Up Selected Services

For each service the user selected, walk them through API key setup:

### Stripe
1. https://dashboard.stripe.com/apikeys
2. Collect: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
3. https://dashboard.stripe.com/webhooks for `STRIPE_WEBHOOK_SECRET`

### RevenueCat
1. https://app.revenuecat.com/signup
2. Collect: `REVENUECAT_API_KEY`, `REVENUECAT_SECRET_KEY`

### Resend
1. https://resend.com/signup → API Keys
2. Collect: `RESEND_API_KEY`

### Storage (R2)
1. https://dash.cloudflare.com → R2 → Create bucket + API Token
2. Collect: `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

### Storage (S3)
1. https://console.aws.amazon.com/iam → Access keys
2. Collect: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`

### OpenAI
1. https://platform.openai.com/api-keys
2. Collect: `OPENAI_API_KEY`

### Fal.ai
1. https://fal.ai/dashboard/keys
2. Collect: `FAL_KEY`

---

## Step 10: Write Environment Files

Create `.env` with all collected keys.
Create `.env.example` with empty values as a template.

---

## Step 11: Install and Verify

```bash
npm install       # Installs all workspace dependencies
npm run db:push   # Creates database tables
npm run dev       # Starts all apps
```

---

## Step 12: Generate AI Documentation

Create a `CLAUDE.md` at the project root that documents:
- Project structure
- Active services
- Code conventions (no semicolons, 2-space indent, const over let)
- Feature development workflow (schema → migration → validation → route → frontend)
- Do NOT rules (no relative cross-package imports, no skipping Zod validation)

Create `docs/PATTERNS.md` with step-by-step recipes for:
- Adding a new database model
- Adding a new API route
- Adding a new Zod schema
- Service-specific patterns (only for selected services)

---

## Conventions to Follow

- Import from `@<project-name>/db` and `@<project-name>/shared` — never relative paths across packages
- Use `type` imports for type-only imports
- No semicolons, 2-space indentation
- Use Zod for all input validation
- Protected routes use `fastify.authenticate` preHandler
- `request.user` has `{ id, email, role }` after authentication
- Feature development order: Schema → Migration → Validation → Route → Frontend

---

## After Setup

Tell the user:
> "Your project is ready! Here's what was set up:"
> - List all active services
> - Show the `npm run dev` command
> - Mention that CLAUDE.md and PATTERNS.md are ready for AI-assisted development
