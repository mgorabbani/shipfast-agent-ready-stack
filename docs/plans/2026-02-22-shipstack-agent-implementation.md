# ShipStack Agent CLI — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `npx shipstack-agent init` CLI that scaffolds an AI-native Fastify + Drizzle backend with guided API key onboarding, platform-aware service selection, and AI-readable documentation.

**Architecture:** CLI lives in `packages/cli/` within the existing shipfast-stack monorepo. It clones the template repo, prunes unselected services, collects API keys via guided onboarding, writes `.env`, and generates dynamic AI docs (CLAUDE.md, PATTERNS.md, downloads provider llms.txt files).

**Tech Stack:** TypeScript, Commander.js, @clack/prompts (interactive CLI UI), open (browser launcher), node-fetch, Fastify v5, Better Auth, Drizzle ORM, Stripe, RevenueCat, Resend, @aws-sdk/client-s3, node-cron, @fastify/rate-limit.

---

## Phase 1: CLI Skeleton

### Task 1: Initialize CLI package

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "shipstack-agent",
  "version": "0.1.0",
  "description": "AI-native backend scaffolder — your backend in 2 minutes",
  "type": "module",
  "bin": {
    "shipstack-agent": "./dist/index.js"
  },
  "files": ["dist", "templates"],
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@clack/prompts": "^0.9.0",
    "commander": "^13.0.0",
    "open": "^10.0.0",
    "picocolors": "^1.1.0",
    "degit": "^2.8.8"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0",
    "@types/degit": "^2.8.6"
  },
  "engines": { "node": ">=20.0.0" },
  "keywords": ["backend", "scaffolder", "ai-native", "fastify", "drizzle", "cli"],
  "license": "MIT"
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create src/index.ts**

```typescript
#!/usr/bin/env node
import { Command } from "commander"
import { initCommand } from "./commands/init.js"
import { docsCommand } from "./commands/docs.js"

const program = new Command()

program
  .name("shipstack-agent")
  .description("AI-native backend scaffolder — your backend in 2 minutes")
  .version("0.1.0")

program
  .command("init")
  .description("Scaffold a new ShipFast Stack project")
  .argument("[name]", "Project name")
  .action(initCommand)

program
  .command("docs")
  .description("Regenerate AI documentation (CLAUDE.md, PATTERNS.md, llms.txt)")
  .action(docsCommand)

program.parse()
```

**Step 4: Create placeholder commands**

Create `packages/cli/src/commands/init.ts`:
```typescript
import * as p from "@clack/prompts"
import pc from "picocolors"

export async function initCommand(name?: string) {
  p.intro(pc.bgCyan(pc.black(" shipstack-agent ")))
  p.log.info("Init command — not yet implemented")
  p.outro("Done!")
}
```

Create `packages/cli/src/commands/docs.ts`:
```typescript
import * as p from "@clack/prompts"

export async function docsCommand() {
  p.intro("Regenerating AI docs...")
  p.log.info("Docs command — not yet implemented")
  p.outro("Done!")
}
```

**Step 5: Install dependencies and verify**

Run: `cd packages/cli && npm install`
Run: `npx tsx src/index.ts --help`
Expected: Shows help with `init` and `docs` commands

**Step 6: Commit**

```bash
git add packages/cli/
git commit -m "feat: initialize CLI package skeleton with commander + clack"
```

---

### Task 2: Build interactive prompts

**Files:**
- Create: `packages/cli/src/prompts/project.ts`
- Create: `packages/cli/src/prompts/frontend.ts`
- Create: `packages/cli/src/prompts/services.ts`
- Create: `packages/cli/src/types.ts`
- Modify: `packages/cli/src/commands/init.ts`

**Step 1: Create types.ts**

```typescript
export type Frontend = "expo" | "web"

export type Service =
  | "payments"
  | "email"
  | "storage"
  | "ai"
  | "cron"
  | "webhooks"
  | "rateLimit"

export type AuthProvider = "emailPassword" | "google" | "github" | "magicLink" | "twoFactor"

export type PaymentsProvider = "stripe" | "revenuecat"
export type StorageProvider = "r2" | "s3"
export type AiProvider = "openai" | "falai"
export type DatabaseProvider = "neon" | "railway" | "docker" | "custom"

export interface ProjectConfig {
  name: string
  frontend: Frontend
  services: Service[]
  authProviders: AuthProvider[]
  paymentsProvider?: PaymentsProvider
  storageProvider?: StorageProvider
  aiProvider?: AiProvider
  databaseProvider: DatabaseProvider
  env: Record<string, string>
}
```

**Step 2: Create prompts/project.ts**

```typescript
import * as p from "@clack/prompts"
import path from "path"
import fs from "fs"

export async function promptProject(nameArg?: string): Promise<{ name: string; dir: string }> {
  const name = nameArg ?? (await p.text({
    message: "What is your project name?",
    placeholder: "my-app",
    validate: (v) => {
      if (!v) return "Project name is required"
      if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only"
    },
  })) as string

  if (p.isCancel(name)) process.exit(0)

  const dir = path.resolve(process.cwd(), name)
  if (fs.existsSync(dir)) {
    p.log.error(`Directory "${name}" already exists.`)
    process.exit(1)
  }

  return { name, dir }
}
```

**Step 3: Create prompts/frontend.ts**

```typescript
import * as p from "@clack/prompts"
import type { Frontend } from "../types.js"

export async function promptFrontend(): Promise<Frontend> {
  const frontend = await p.select({
    message: "Which frontend?",
    options: [
      { value: "expo", label: "Expo (Mobile)", hint: "iOS, Android, Web — React Native" },
      { value: "web", label: "Vite + React (Web)", hint: "SPA with Shadcn/ui + TailwindCSS" },
    ],
  })

  if (p.isCancel(frontend)) process.exit(0)
  return frontend as Frontend
}
```

**Step 4: Create prompts/services.ts**

```typescript
import * as p from "@clack/prompts"
import type { Frontend, Service, AuthProvider, PaymentsProvider, StorageProvider, AiProvider, DatabaseProvider } from "../types.js"

export async function promptServices(frontend: Frontend) {
  const paymentsLabel = frontend === "expo"
    ? "Payments (RevenueCat — in-app purchases)"
    : "Payments (Stripe — checkout + subscriptions)"

  const services = await p.multiselect({
    message: "Select services (Auth + Database always included):",
    options: [
      { value: "payments", label: paymentsLabel },
      { value: "email", label: "Email (Resend)" },
      { value: "storage", label: "File Storage (S3 / Cloudflare R2)" },
      { value: "ai", label: "AI (OpenAI / Fal.ai)" },
      { value: "cron", label: "Cron Jobs" },
      { value: "webhooks", label: "Webhooks (outbound)" },
      { value: "rateLimit", label: "Rate Limiting" },
    ],
    required: false,
  })

  if (p.isCancel(services)) process.exit(0)
  return services as Service[]
}

export async function promptAuthProviders(): Promise<AuthProvider[]> {
  const providers = await p.multiselect({
    message: "Auth providers:",
    options: [
      { value: "emailPassword", label: "Email + Password", hint: "default" },
      { value: "google", label: "Google" },
      { value: "github", label: "GitHub" },
      { value: "magicLink", label: "Magic Link" },
      { value: "twoFactor", label: "Two-Factor (2FA)" },
    ],
    initialValues: ["emailPassword"],
    required: true,
  })

  if (p.isCancel(providers)) process.exit(0)
  return providers as AuthProvider[]
}

export async function promptStorageProvider(): Promise<StorageProvider> {
  const provider = await p.select({
    message: "Storage provider:",
    options: [
      { value: "r2", label: "Cloudflare R2", hint: "free egress, S3-compatible" },
      { value: "s3", label: "AWS S3" },
    ],
  })

  if (p.isCancel(provider)) process.exit(0)
  return provider as StorageProvider
}

export async function promptAiProvider(): Promise<AiProvider> {
  const provider = await p.select({
    message: "AI provider:",
    options: [
      { value: "openai", label: "OpenAI", hint: "GPT, DALL-E, Whisper" },
      { value: "falai", label: "Fal.ai", hint: "fast image/video/3D generation" },
    ],
  })

  if (p.isCancel(provider)) process.exit(0)
  return provider as AiProvider
}

export async function promptDatabaseProvider(): Promise<DatabaseProvider> {
  const provider = await p.select({
    message: "PostgreSQL setup:",
    options: [
      { value: "neon", label: "Neon", hint: "free tier, serverless — recommended" },
      { value: "railway", label: "Railway", hint: "$5/mo, managed" },
      { value: "docker", label: "Docker (local)", hint: "docker-compose included" },
      { value: "custom", label: "I have a connection string" },
    ],
  })

  if (p.isCancel(provider)) process.exit(0)
  return provider as DatabaseProvider
}
```

**Step 5: Wire prompts into init command**

Update `packages/cli/src/commands/init.ts`:

```typescript
import * as p from "@clack/prompts"
import pc from "picocolors"
import { promptProject } from "../prompts/project.js"
import { promptFrontend } from "../prompts/frontend.js"
import {
  promptServices,
  promptAuthProviders,
  promptStorageProvider,
  promptAiProvider,
  promptDatabaseProvider,
} from "../prompts/services.js"
import type { ProjectConfig } from "../types.js"

export async function initCommand(name?: string) {
  p.intro(pc.bgCyan(pc.black(" shipstack-agent init ")))

  // 1. Project
  const project = await promptProject(name)

  // 2. Frontend
  const frontend = await promptFrontend()

  // 3. Services
  const services = await promptServices(frontend)

  // 4. Auth providers
  const authProviders = await promptAuthProviders()

  // 5. Sub-prompts for selected services
  const storageProvider = services.includes("storage")
    ? await promptStorageProvider()
    : undefined

  const aiProvider = services.includes("ai")
    ? await promptAiProvider()
    : undefined

  // 6. Database
  const databaseProvider = await promptDatabaseProvider()

  const config: ProjectConfig = {
    name: project.name,
    frontend,
    services,
    authProviders,
    paymentsProvider: services.includes("payments")
      ? (frontend === "expo" ? "revenuecat" : "stripe")
      : undefined,
    storageProvider,
    aiProvider,
    databaseProvider,
    env: {},
  }

  p.log.info(`Project: ${pc.bold(config.name)}`)
  p.log.info(`Frontend: ${pc.bold(config.frontend)}`)
  p.log.info(`Services: ${pc.bold(["auth", "database", ...config.services].join(", "))}`)

  // TODO: Guided onboarding (Task 3)
  // TODO: Scaffold (Task 4)
  // TODO: Generate AI docs (Task 5)

  p.outro(`${pc.green("Config collected!")} Next: onboarding + scaffold`)
}
```

**Step 6: Test the prompts**

Run: `cd packages/cli && npx tsx src/index.ts init`
Expected: Interactive prompts appear, collect all selections, print summary

**Step 7: Commit**

```bash
git add packages/cli/src/
git commit -m "feat: add interactive CLI prompts for project, frontend, and services"
```

---

### Task 3: Build guided onboarding

**Files:**
- Create: `packages/cli/src/onboarding/index.ts`
- Create: `packages/cli/src/onboarding/database.ts`
- Create: `packages/cli/src/onboarding/stripe.ts`
- Create: `packages/cli/src/onboarding/revenuecat.ts`
- Create: `packages/cli/src/onboarding/resend.ts`
- Create: `packages/cli/src/onboarding/storage.ts`
- Create: `packages/cli/src/onboarding/ai.ts`
- Create: `packages/cli/src/onboarding/auth.ts`
- Create: `packages/cli/src/utils/browser.ts`
- Modify: `packages/cli/src/commands/init.ts`

**Step 1: Create utils/browser.ts**

```typescript
import open from "open"
import * as p from "@clack/prompts"
import pc from "picocolors"

export async function openAndCollect(opts: {
  service: string
  url: string
  instructions: string[]
  envKey: string
  placeholder?: string
  validate?: (key: string) => Promise<string | undefined>
}): Promise<string> {
  p.log.step(pc.bold(`Setting up ${opts.service}`))
  for (const instruction of opts.instructions) {
    p.log.info(instruction)
  }

  const shouldOpen = await p.confirm({
    message: `Open ${opts.url} in browser?`,
    initialValue: true,
  })

  if (p.isCancel(shouldOpen)) process.exit(0)
  if (shouldOpen) await open(opts.url)

  const key = await p.text({
    message: `Paste your ${opts.envKey}:`,
    placeholder: opts.placeholder ?? "sk_...",
    validate: (v) => {
      if (!v.trim()) return `${opts.envKey} is required`
    },
  })

  if (p.isCancel(key)) process.exit(0)
  const keyStr = key as string

  if (opts.validate) {
    const spinner = p.spinner()
    spinner.start(`Validating ${opts.service} key...`)
    const error = await opts.validate(keyStr)
    if (error) {
      spinner.stop(`Validation failed: ${error}`)
      return openAndCollect(opts) // retry
    }
    spinner.stop(`${opts.service} key validated!`)
  }

  return keyStr
}

export async function openUrl(url: string) {
  await open(url)
}
```

**Step 2: Create onboarding/database.ts**

```typescript
import * as p from "@clack/prompts"
import pc from "picocolors"
import { openAndCollect } from "../utils/browser.js"
import crypto from "crypto"
import type { DatabaseProvider } from "../types.js"

export async function onboardDatabase(provider: DatabaseProvider): Promise<Record<string, string>> {
  const env: Record<string, string> = {}

  if (provider === "neon") {
    const url = await openAndCollect({
      service: "Neon (PostgreSQL)",
      url: "https://console.neon.tech/signup",
      instructions: [
        "1. Create a free account on Neon",
        "2. Create a new project",
        '3. Copy the connection string (starts with "postgresql://")',
      ],
      envKey: "DATABASE_URL",
      placeholder: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname",
    })
    env.DATABASE_URL = url
  } else if (provider === "railway") {
    const url = await openAndCollect({
      service: "Railway (PostgreSQL)",
      url: "https://railway.app/new",
      instructions: [
        "1. Create an account on Railway",
        '2. Click "New Project" → "Provision PostgreSQL"',
        '3. Go to Variables tab → copy DATABASE_URL',
      ],
      envKey: "DATABASE_URL",
      placeholder: "postgresql://postgres:pass@host.railway.app:5432/railway",
    })
    env.DATABASE_URL = url
  } else if (provider === "docker") {
    const password = crypto.randomBytes(16).toString("hex")
    env.DB_PASSWORD = password
    env.DATABASE_URL = `postgresql://shipfast:${password}@localhost:5432/shipfast`
    p.log.success("Docker PostgreSQL configured. Run: docker compose up -d")
  } else {
    const url = await p.text({
      message: "Paste your PostgreSQL connection string:",
      placeholder: "postgresql://user:pass@host:5432/dbname",
      validate: (v) => {
        if (!v.startsWith("postgresql://") && !v.startsWith("postgres://"))
          return "Must start with postgresql:// or postgres://"
      },
    })
    if (p.isCancel(url)) process.exit(0)
    env.DATABASE_URL = url as string
  }

  return env
}
```

**Step 3: Create onboarding/auth.ts**

```typescript
import * as p from "@clack/prompts"
import crypto from "crypto"
import { openAndCollect } from "../utils/browser.js"
import type { AuthProvider } from "../types.js"

export async function onboardAuth(providers: AuthProvider[]): Promise<Record<string, string>> {
  const env: Record<string, string> = {
    BETTER_AUTH_SECRET: crypto.randomBytes(32).toString("hex"),
  }

  p.log.success("Generated BETTER_AUTH_SECRET")

  if (providers.includes("google")) {
    p.log.step("Setting up Google OAuth")
    const clientId = await openAndCollect({
      service: "Google OAuth",
      url: "https://console.cloud.google.com/apis/credentials",
      instructions: [
        '1. Create a new project (or select existing)',
        '2. Go to "Credentials" → "Create Credentials" → "OAuth client ID"',
        '3. Application type: "Web application"',
        '4. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google',
        '5. Copy the Client ID',
      ],
      envKey: "GOOGLE_CLIENT_ID",
      placeholder: "123456789.apps.googleusercontent.com",
    })
    env.GOOGLE_CLIENT_ID = clientId

    const clientSecret = await p.text({
      message: "Paste your GOOGLE_CLIENT_SECRET:",
      placeholder: "GOCSPX-...",
    })
    if (p.isCancel(clientSecret)) process.exit(0)
    env.GOOGLE_CLIENT_SECRET = clientSecret as string
  }

  if (providers.includes("github")) {
    const clientId = await openAndCollect({
      service: "GitHub OAuth",
      url: "https://github.com/settings/applications/new",
      instructions: [
        '1. Application name: your project name',
        '2. Homepage URL: http://localhost:3000',
        '3. Callback URL: http://localhost:3000/api/auth/callback/github',
        '4. Click "Register application"',
        '5. Copy the Client ID',
      ],
      envKey: "GITHUB_CLIENT_ID",
    })
    env.GITHUB_CLIENT_ID = clientId

    const clientSecret = await p.text({
      message: "Paste your GITHUB_CLIENT_SECRET:",
    })
    if (p.isCancel(clientSecret)) process.exit(0)
    env.GITHUB_CLIENT_SECRET = clientSecret as string
  }

  return env
}
```

**Step 4: Create onboarding/stripe.ts**

```typescript
import { openAndCollect } from "../utils/browser.js"

export async function onboardStripe(): Promise<Record<string, string>> {
  const secretKey = await openAndCollect({
    service: "Stripe",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: [
      "1. Create a Stripe account (or sign in)",
      '2. Go to Developers → API Keys',
      '3. Copy the Secret key (starts with sk_test_ or sk_live_)',
    ],
    envKey: "STRIPE_SECRET_KEY",
    placeholder: "sk_test_...",
  })

  const publishableKey = await openAndCollect({
    service: "Stripe (publishable key)",
    url: "https://dashboard.stripe.com/apikeys",
    instructions: ['Copy the Publishable key from the same page'],
    envKey: "STRIPE_PUBLISHABLE_KEY",
    placeholder: "pk_test_...",
  })

  const webhookSecret = await openAndCollect({
    service: "Stripe Webhook",
    url: "https://dashboard.stripe.com/webhooks",
    instructions: [
      '1. Click "Add endpoint"',
      '2. URL: https://your-domain.com/api/webhooks/stripe',
      '3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted',
      '4. Copy the Signing secret (whsec_...)',
      'Tip: For local dev, use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe',
    ],
    envKey: "STRIPE_WEBHOOK_SECRET",
    placeholder: "whsec_...",
  })

  return {
    STRIPE_SECRET_KEY: secretKey,
    STRIPE_PUBLISHABLE_KEY: publishableKey,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  }
}
```

**Step 5: Create onboarding/revenuecat.ts**

```typescript
import { openAndCollect } from "../utils/browser.js"

export async function onboardRevenuecat(): Promise<Record<string, string>> {
  const apiKey = await openAndCollect({
    service: "RevenueCat",
    url: "https://app.revenuecat.com/signup",
    instructions: [
      '1. Create a RevenueCat account',
      '2. Create a new project',
      '3. Add your app (iOS/Android)',
      '4. Go to API Keys → copy the public API key',
    ],
    envKey: "REVENUECAT_API_KEY",
    placeholder: "appl_...",
  })

  const secretKey = await openAndCollect({
    service: "RevenueCat (secret)",
    url: "https://app.revenuecat.com",
    instructions: ['Copy the Secret API key from the same API Keys page'],
    envKey: "REVENUECAT_SECRET_KEY",
    placeholder: "sk_...",
  })

  return {
    REVENUECAT_API_KEY: apiKey,
    REVENUECAT_SECRET_KEY: secretKey,
  }
}
```

**Step 6: Create onboarding/resend.ts**

```typescript
import { openAndCollect } from "../utils/browser.js"

export async function onboardResend(): Promise<Record<string, string>> {
  const apiKey = await openAndCollect({
    service: "Resend",
    url: "https://resend.com/signup",
    instructions: [
      '1. Create a Resend account',
      '2. Go to API Keys → Create API Key',
      '3. Copy the key (starts with re_)',
    ],
    envKey: "RESEND_API_KEY",
    placeholder: "re_...",
  })

  return { RESEND_API_KEY: apiKey }
}
```

**Step 7: Create onboarding/storage.ts**

```typescript
import { openAndCollect } from "../utils/browser.js"
import type { StorageProvider } from "../types.js"

export async function onboardStorage(provider: StorageProvider): Promise<Record<string, string>> {
  if (provider === "r2") {
    const accountId = await openAndCollect({
      service: "Cloudflare R2",
      url: "https://dash.cloudflare.com/?to=/:account/r2",
      instructions: [
        '1. Sign in to Cloudflare dashboard',
        '2. Go to R2 → Create bucket',
        '3. Go to R2 → Manage R2 API Tokens → Create API Token',
        '4. Copy your Account ID from the dashboard URL',
      ],
      envKey: "CLOUDFLARE_ACCOUNT_ID",
    })

    const accessKeyId = await openAndCollect({
      service: "Cloudflare R2 (access key)",
      url: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      instructions: ['Copy the Access Key ID from the API token you created'],
      envKey: "S3_ACCESS_KEY_ID",
    })

    const secretAccessKey = await openAndCollect({
      service: "Cloudflare R2 (secret key)",
      url: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      instructions: ['Copy the Secret Access Key'],
      envKey: "S3_SECRET_ACCESS_KEY",
    })

    return {
      S3_ENDPOINT: `https://${accountId}.r2.cloudflarestorage.com`,
      S3_ACCESS_KEY_ID: accessKeyId,
      S3_SECRET_ACCESS_KEY: secretAccessKey,
      S3_BUCKET: "uploads",
      S3_REGION: "auto",
    }
  }

  // AWS S3
  const accessKeyId = await openAndCollect({
    service: "AWS S3",
    url: "https://console.aws.amazon.com/iam/home#/security_credentials",
    instructions: [
      '1. Go to IAM → Create access key',
      '2. Or use an existing access key',
    ],
    envKey: "S3_ACCESS_KEY_ID",
    placeholder: "AKIA...",
  })

  const secretAccessKey = await openAndCollect({
    service: "AWS S3 (secret)",
    url: "https://console.aws.amazon.com/iam/home",
    instructions: ['Copy the Secret Access Key'],
    envKey: "S3_SECRET_ACCESS_KEY",
  })

  return {
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET_ACCESS_KEY: secretAccessKey,
    S3_BUCKET: "uploads",
    S3_REGION: "us-east-1",
  }
}
```

**Step 8: Create onboarding/ai.ts**

```typescript
import { openAndCollect } from "../utils/browser.js"
import type { AiProvider } from "../types.js"

export async function onboardAi(provider: AiProvider): Promise<Record<string, string>> {
  if (provider === "openai") {
    const key = await openAndCollect({
      service: "OpenAI",
      url: "https://platform.openai.com/api-keys",
      instructions: [
        '1. Sign in to OpenAI platform',
        '2. Go to API Keys → Create new secret key',
        '3. Copy the key (starts with sk-)',
      ],
      envKey: "OPENAI_API_KEY",
      placeholder: "sk-...",
    })
    return { OPENAI_API_KEY: key }
  }

  const key = await openAndCollect({
    service: "Fal.ai",
    url: "https://fal.ai/dashboard/keys",
    instructions: [
      '1. Sign in to Fal.ai',
      '2. Go to Keys → Create Key',
      '3. Copy the key',
    ],
    envKey: "FAL_KEY",
  })
  return { FAL_KEY: key }
}
```

**Step 9: Create onboarding/index.ts**

```typescript
import * as p from "@clack/prompts"
import type { ProjectConfig } from "../types.js"
import { onboardDatabase } from "./database.js"
import { onboardAuth } from "./auth.js"
import { onboardStripe } from "./stripe.js"
import { onboardRevenuecat } from "./revenuecat.js"
import { onboardResend } from "./resend.js"
import { onboardStorage } from "./storage.js"
import { onboardAi } from "./ai.js"

export async function runOnboarding(config: ProjectConfig): Promise<Record<string, string>> {
  p.log.step("Starting guided setup — we'll open each service in your browser.\n")

  let env: Record<string, string> = {}

  // Database (always)
  Object.assign(env, await onboardDatabase(config.databaseProvider))

  // Auth (always)
  Object.assign(env, await onboardAuth(config.authProviders))

  // Payments
  if (config.services.includes("payments")) {
    if (config.paymentsProvider === "stripe") {
      Object.assign(env, await onboardStripe())
    } else {
      Object.assign(env, await onboardRevenuecat())
    }
  }

  // Email
  if (config.services.includes("email")) {
    Object.assign(env, await onboardResend())
  }

  // Storage
  if (config.services.includes("storage") && config.storageProvider) {
    Object.assign(env, await onboardStorage(config.storageProvider))
  }

  // AI
  if (config.services.includes("ai") && config.aiProvider) {
    Object.assign(env, await onboardAi(config.aiProvider))
  }

  return env
}
```

**Step 10: Wire onboarding into init command**

Update `packages/cli/src/commands/init.ts` — add after config creation:

```typescript
// Add import
import { runOnboarding } from "../onboarding/index.js"

// Add after config object creation, before the TODO comments:
  const env = await runOnboarding(config)
  config.env = env

  p.log.success(`Collected ${Object.keys(env).length} environment variables`)
```

**Step 11: Test onboarding flow**

Run: `cd packages/cli && npx tsx src/index.ts init test-project`
Expected: All prompts work, browser opens for each service, keys collected

**Step 12: Commit**

```bash
git add packages/cli/src/
git commit -m "feat: add guided onboarding for all services with browser launch"
```

---

## Phase 2: Template Services

### Task 4: Replace auth with Better Auth

**Files:**
- Modify: `apps/api/package.json` — add `better-auth`
- Rewrite: `apps/api/src/plugins/auth.ts` — Better Auth Fastify integration
- Rewrite: `apps/api/src/routes/auth.ts` — remove (Better Auth handles routes)
- Modify: `apps/api/src/routes/profile.ts` — use Better Auth session
- Modify: `apps/api/src/index.ts` — register Better Auth
- Modify: `packages/db/src/schema/users.ts` — Better Auth schema
- Remove: `packages/db/src/schema/users.ts` refresh tokens (Better Auth handles)
- Modify: `packages/shared/src/schemas/auth.ts` — simplify
- Create: `apps/api/src/lib/auth.ts` — Better Auth instance
- Modify: `.env.example`

**Step 1: Read Better Auth Fastify integration docs**

Before implementing, read `better-auth.com/llms.txt` and the Fastify integration page to get exact API. Use Context7 to query Better Auth + Drizzle + Fastify setup.

**Step 2: Add better-auth dependency**

In `apps/api/package.json`, add:
```json
"better-auth": "^1.2.0"
```

In `apps/mobile/package.json` (or `apps/web/package.json`), add:
```json
"@better-auth/react": "^1.2.0"
```

Run: `cd apps/api && npm install better-auth`

**Step 3: Create apps/api/src/lib/auth.ts**

```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createDb } from "@shipfast/db"

const db = createDb(process.env.DATABASE_URL!)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  // Social providers configured via env vars
  ...(process.env.GOOGLE_CLIENT_ID && {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      ...(process.env.GITHUB_CLIENT_ID && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      }),
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
})
```

> **Note:** The exact Better Auth API may differ. Consult `/docs/llms/better-auth.txt` (downloaded in Task 7) and the [Better Auth Fastify docs](https://www.better-auth.com/docs/integrations/fastify) for the exact integration pattern. The adapter config, session handling, and route registration may require adjustments based on the latest API.

**Step 4: Rewrite apps/api/src/plugins/auth.ts**

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { auth } from "../lib/auth.js"

declare module "fastify" {
  interface FastifyRequest {
    user: { id: string; email: string; role: string } | null
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  // Convert Fastify req/res to Fetch API for Better Auth
  fastify.all("/api/auth/*", async (request, reply) => {
    const url = new URL(request.url, `http://${request.headers.host}`)
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value)
    }

    const fetchRequest = new Request(url, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? JSON.stringify(request.body)
        : undefined,
    })

    const response = await auth.handler(fetchRequest)

    reply.status(response.status)
    response.headers.forEach((value, key) => reply.header(key, value))
    const body = await response.text()
    return reply.send(body)
  })

  // Decorator to get session from request
  fastify.decorateRequest("user", null)

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })

    if (!session) {
      return reply.code(401).send({ error: "Unauthorized" })
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: (session.user as any).role ?? "user",
    }
  })
}
```

> **Note:** The exact Better Auth `getSession` API and Fastify integration pattern should be verified against the latest docs. The request-to-fetch conversion and session extraction may have a simpler official helper.

**Step 5: Remove old auth routes, update index.ts**

Remove the auth route import and registration from `apps/api/src/index.ts` since Better Auth handles `/api/auth/*` routes via the plugin.

Update `apps/api/src/routes/profile.ts` to use `request.user` (set by Better Auth plugin) instead of `request.user.userId`.

**Step 6: Update DB schema**

Better Auth manages its own tables (user, session, account, verification). Update `packages/db/src/schema/users.ts` to either:
- Let Better Auth auto-create tables via its migration, OR
- Define the Better Auth schema manually in Drizzle

Remove `refreshTokens` table — Better Auth handles sessions.

**Step 7: Update .env.example**

```
# Database
DATABASE_URL=postgresql://shipfast:changeme@localhost:5432/shipfast

# Better Auth
BETTER_AUTH_SECRET=change-this-to-a-random-secret

# Google OAuth (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# GitHub OAuth (optional)
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
```

**Step 8: Update mobile auth lib**

Update `apps/mobile/lib/auth.tsx` to use Better Auth's client SDK (`@better-auth/react`) or adapt the fetch wrapper to work with Better Auth's session cookies / bearer tokens.

**Step 9: Test auth flow**

Run: `npm run dev`
Test: Register → login → get profile → logout
Expected: All auth flows work with Better Auth

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: replace custom JWT auth with Better Auth"
```

---

### Task 5: Add Stripe payments service (web)

**Files:**
- Create: `apps/api/src/plugins/stripe.ts`
- Create: `apps/api/src/routes/payments.ts`
- Create: `apps/api/src/routes/webhooks/stripe.ts`
- Create: `packages/db/src/schema/subscriptions.ts`
- Create: `packages/shared/src/schemas/payments.ts`
- Modify: `packages/db/src/schema/index.ts` — export subscriptions
- Modify: `packages/shared/src/index.ts` — export payments schemas
- Modify: `apps/api/package.json` — add `stripe`
- Modify: `apps/api/src/index.ts` — register payment routes

**Step 1: Add stripe dependency**

```bash
cd apps/api && npm install stripe
```

**Step 2: Create packages/db/src/schema/subscriptions.ts**

```typescript
import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { users } from "./users"

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "canceled", "past_due", "trialing", "unpaid"
])

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  stripePriceId: text("stripe_price_id").notNull().unique(),
  amount: integer("amount").notNull(), // cents
  interval: text("interval").notNull(), // month, year
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: text("cancel_at_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}))
```

**Step 3: Create packages/shared/src/schemas/payments.ts**

```typescript
import { z } from "zod"

export const createCheckoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>
```

**Step 4: Create apps/api/src/plugins/stripe.ts**

```typescript
import { FastifyInstance } from "fastify"
import Stripe from "stripe"

declare module "fastify" {
  interface FastifyInstance {
    stripe: Stripe
  }
}

export default async function stripePlugin(fastify: FastifyInstance) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
  })
  fastify.decorate("stripe", stripe)
}
```

**Step 5: Create apps/api/src/routes/payments.ts**

```typescript
import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions } from "@shipfast/db"
import { createCheckoutSchema } from "@shipfast/shared"

export default async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Create checkout session
  fastify.post("/checkout", async (request, reply) => {
    const body = createCheckoutSchema.parse(request.body)

    const session = await fastify.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      customer_email: request.user!.email,
      metadata: { userId: request.user!.id },
    })

    return { url: session.url }
  })

  // Get current subscription
  fastify.get("/subscription", async (request) => {
    const [sub] = await fastify.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, request.user!.id))
      .limit(1)

    return sub ?? null
  })

  // Customer portal
  fastify.post("/portal", async (request, reply) => {
    const [sub] = await fastify.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, request.user!.id))
      .limit(1)

    if (!sub) return reply.code(404).send({ error: "No subscription found" })

    const session = await fastify.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.APP_URL}/dashboard`,
    })

    return { url: session.url }
  })
}
```

**Step 6: Create apps/api/src/routes/webhooks/stripe.ts**

```typescript
import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions, payments } from "@shipfast/db"

export default async function stripeWebhookRoutes(fastify: FastifyInstance) {
  // Raw body needed for Stripe signature verification
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => done(null, body)
  )

  fastify.post("/stripe", async (request, reply) => {
    const sig = request.headers["stripe-signature"] as string
    let event

    try {
      event = fastify.stripe.webhooks.constructEvent(
        request.body as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      return reply.code(400).send({ error: `Webhook Error: ${err.message}` })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        if (session.mode === "subscription" && session.subscription) {
          const sub = await fastify.stripe.subscriptions.retrieve(session.subscription as string)
          await fastify.db.insert(subscriptions).values({
            userId: session.metadata!.userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: "active",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object
        await fastify.db
          .update(subscriptions)
          .set({
            status: sub.status as any,
            stripePriceId: sub.items.data[0]?.price.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object
        await fastify.db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }
    }

    return { received: true }
  })
}
```

**Step 7: Register in index.ts**

Add to `apps/api/src/index.ts`:
```typescript
import stripePlugin from "./plugins/stripe"
import paymentRoutes from "./routes/payments"
import stripeWebhookRoutes from "./routes/webhooks/stripe"

await fastify.register(stripePlugin)
await fastify.register(paymentRoutes, { prefix: "/api/payments" })
await fastify.register(stripeWebhookRoutes, { prefix: "/api/webhooks" })
```

Update `packages/db/src/schema/index.ts`:
```typescript
export * from "./subscriptions"
```

Update `packages/shared/src/index.ts`:
```typescript
export * from "./schemas/payments"
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Stripe payments with checkout, subscriptions, and webhooks"
```

---

### Task 6: Add RevenueCat payments service (mobile)

**Files:**
- Create: `apps/api/src/plugins/revenuecat.ts`
- Create: `apps/api/src/routes/subscriptions.ts`
- Create: `apps/api/src/routes/webhooks/revenuecat.ts`

**Step 1: Read RevenueCat docs**

Consult RevenueCat llms.txt for server-side entitlement verification API and webhook format.

**Step 2: Create plugin and routes**

Similar pattern to Stripe but using RevenueCat's REST API for entitlement checks and webhook handler for subscription events.

**Step 3: Commit**

```bash
git commit -m "feat: add RevenueCat payments for mobile in-app purchases"
```

---

### Task 7: Add Resend email service

**Files:**
- Create: `apps/api/src/plugins/email.ts`
- Create: `apps/api/src/services/email.ts`
- Create: `apps/api/src/emails/welcome.ts`
- Create: `apps/api/src/emails/password-reset.ts`
- Modify: `apps/api/package.json` — add `resend`
- Modify: `apps/api/src/index.ts`

**Step 1: Install resend**

```bash
cd apps/api && npm install resend
```

**Step 2: Create apps/api/src/plugins/email.ts**

```typescript
import { FastifyInstance } from "fastify"
import { Resend } from "resend"

declare module "fastify" {
  interface FastifyInstance {
    email: Resend
  }
}

export default async function emailPlugin(fastify: FastifyInstance) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  fastify.decorate("email", resend)
}
```

**Step 3: Create apps/api/src/services/email.ts**

```typescript
import { Resend } from "resend"

export async function sendEmail(
  resend: Resend,
  opts: { to: string; subject: string; html: string; from?: string }
) {
  return resend.emails.send({
    from: opts.from ?? `ShipFast <noreply@${process.env.EMAIL_DOMAIN ?? "example.com"}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
```

**Step 4: Create email templates**

Create `apps/api/src/emails/welcome.ts` and `password-reset.ts` with simple HTML templates.

**Step 5: Commit**

```bash
git commit -m "feat: add Resend email service with templates"
```

---

### Task 8: Add S3/R2 storage service

**Files:**
- Create: `apps/api/src/plugins/storage.ts`
- Create: `apps/api/src/routes/upload.ts`
- Create: `apps/api/src/services/storage.ts`
- Create: `packages/db/src/schema/files.ts`
- Modify: `apps/api/package.json` — add `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- Modify: `apps/api/src/index.ts`

**Step 1: Install S3 SDK**

```bash
cd apps/api && npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Step 2: Create storage plugin**

```typescript
import { FastifyInstance } from "fastify"
import { S3Client } from "@aws-sdk/client-s3"

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Client
  }
}

export default async function storagePlugin(fastify: FastifyInstance) {
  const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  })
  fastify.decorate("s3", s3)
}
```

**Step 3: Create upload routes with presigned URLs**

Presigned URL pattern: API generates a signed upload URL, client uploads directly to S3/R2, then notifies API of completion.

**Step 4: Create files table in DB**

**Step 5: Commit**

```bash
git commit -m "feat: add S3/R2 file storage with presigned uploads"
```

---

### Task 9: Add AI service

**Files:**
- Create: `apps/api/src/plugins/ai.ts`
- Create: `apps/api/src/routes/ai.ts`
- Create: `apps/api/src/services/ai.ts`
- Modify: `apps/api/package.json` — add `openai` or `@fal-ai/client`

**Step 1: Create provider abstraction**

```typescript
// apps/api/src/services/ai.ts
export interface AiService {
  complete(prompt: string, opts?: { model?: string }): Promise<string>
  generateImage(prompt: string): Promise<string> // returns URL
}
```

**Step 2: Implement OpenAI and Fal.ai adapters**

**Step 3: Create routes**

```typescript
// POST /api/ai/complete — text completion
// POST /api/ai/image — image generation
```

**Step 4: Commit**

```bash
git commit -m "feat: add AI service with OpenAI and Fal.ai providers"
```

---

### Task 10: Add cron, webhooks, rate limiting

**Files:**
- Create: `apps/api/src/plugins/cron.ts`
- Create: `apps/api/src/cron/cleanup-sessions.ts`
- Create: `apps/api/src/routes/webhooks.ts` (outbound webhook management)
- Create: `apps/api/src/services/webhook.ts`
- Create: `packages/db/src/schema/webhooks.ts`
- Create: `apps/api/src/plugins/rateLimit.ts`
- Modify: `apps/api/package.json` — add `node-cron`, `@fastify/rate-limit`

**Step 1: Add dependencies**

```bash
cd apps/api && npm install node-cron @fastify/rate-limit
npm install -D @types/node-cron
```

**Step 2: Create cron plugin**

```typescript
import { FastifyInstance } from "fastify"
import cron from "node-cron"

export default async function cronPlugin(fastify: FastifyInstance) {
  const jobs: cron.ScheduledTask[] = []

  fastify.decorate("cron", {
    schedule: (expression: string, fn: () => void | Promise<void>) => {
      const job = cron.schedule(expression, fn)
      jobs.push(job)
      return job
    },
  })

  fastify.addHook("onClose", () => jobs.forEach((j) => j.stop()))
}
```

**Step 3: Create rate limit plugin**

```typescript
import { FastifyInstance } from "fastify"
import rateLimit from "@fastify/rate-limit"

export default async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  })
}
```

**Step 4: Create outbound webhooks service and DB schema**

**Step 5: Commit**

```bash
git commit -m "feat: add cron jobs, outbound webhooks, and rate limiting"
```

---

### Task 11: Add Vite+React web frontend (optional)

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/lib/api.ts` (same pattern as mobile)
- Create: `apps/web/src/lib/auth.tsx` (Better Auth React client)
- Create: `apps/web/src/pages/Login.tsx`
- Create: `apps/web/src/pages/Register.tsx`
- Create: `apps/web/src/pages/Dashboard.tsx`
- Create: `apps/web/CLAUDE.md`

**Step 1: Scaffold Vite + React + TailwindCSS project**

Use same patterns as mobile (api.ts, auth.tsx) but adapted for web (no SecureStore, use cookies/localStorage).

**Step 2: Add Shadcn/ui**

```bash
cd apps/web && npx shadcn-ui@latest init
```

**Step 3: Create auth pages and dashboard**

**Step 4: Add CLAUDE.md**

**Step 5: Commit**

```bash
git commit -m "feat: add optional Vite+React web frontend with auth and Shadcn/ui"
```

---

## Phase 3: Scaffolding Engine

### Task 12: Build scaffold logic

**Files:**
- Create: `packages/cli/src/scaffold/clone.ts`
- Create: `packages/cli/src/scaffold/prune.ts`
- Create: `packages/cli/src/scaffold/patchEnv.ts`
- Create: `packages/cli/src/scaffold/patchPackageJson.ts`
- Modify: `packages/cli/src/commands/init.ts`

**Step 1: Create scaffold/clone.ts**

```typescript
import { execSync } from "child_process"
import * as p from "@clack/prompts"

export async function cloneTemplate(dir: string) {
  const spinner = p.spinner()
  spinner.start("Cloning ShipFast Stack template...")

  try {
    // Use degit for clean clone (no git history)
    execSync(`npx degit your-org/shipfast-stack ${dir}`, { stdio: "pipe" })
    spinner.stop("Template cloned!")
  } catch (err: any) {
    spinner.stop("Clone failed")
    throw err
  }
}
```

**Step 2: Create scaffold/prune.ts**

```typescript
import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

const SERVICE_FILES: Record<string, string[]> = {
  payments: [
    "apps/api/src/plugins/stripe.ts",
    "apps/api/src/plugins/revenuecat.ts",
    "apps/api/src/routes/payments.ts",
    "apps/api/src/routes/subscriptions.ts",
    "apps/api/src/routes/webhooks/stripe.ts",
    "apps/api/src/routes/webhooks/revenuecat.ts",
    "packages/db/src/schema/subscriptions.ts",
    "packages/shared/src/schemas/payments.ts",
  ],
  email: [
    "apps/api/src/plugins/email.ts",
    "apps/api/src/services/email.ts",
    "apps/api/src/emails/",
  ],
  storage: [
    "apps/api/src/plugins/storage.ts",
    "apps/api/src/routes/upload.ts",
    "apps/api/src/services/storage.ts",
    "packages/db/src/schema/files.ts",
  ],
  ai: [
    "apps/api/src/plugins/ai.ts",
    "apps/api/src/routes/ai.ts",
    "apps/api/src/services/ai.ts",
  ],
  cron: [
    "apps/api/src/plugins/cron.ts",
    "apps/api/src/cron/",
  ],
  webhooks: [
    "apps/api/src/routes/webhooks.ts",
    "apps/api/src/services/webhook.ts",
    "packages/db/src/schema/webhooks.ts",
  ],
  rateLimit: [
    "apps/api/src/plugins/rateLimit.ts",
  ],
}

export function pruneServices(dir: string, config: ProjectConfig) {
  const allServices = Object.keys(SERVICE_FILES) as (keyof typeof SERVICE_FILES)[]

  for (const service of allServices) {
    if (!config.services.includes(service as any)) {
      for (const filePath of SERVICE_FILES[service]) {
        const fullPath = path.join(dir, filePath)
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true })
        }
      }
    }
  }

  // Remove wrong frontend
  if (config.frontend === "expo") {
    fs.rmSync(path.join(dir, "apps/web"), { recursive: true, force: true })
  } else {
    fs.rmSync(path.join(dir, "apps/mobile"), { recursive: true, force: true })
  }

  // Remove wrong payment provider files
  if (config.services.includes("payments")) {
    if (config.paymentsProvider === "stripe") {
      // Remove RevenueCat files
      const rcFiles = ["apps/api/src/plugins/revenuecat.ts", "apps/api/src/routes/subscriptions.ts", "apps/api/src/routes/webhooks/revenuecat.ts"]
      rcFiles.forEach(f => { const p = path.join(dir, f); if (fs.existsSync(p)) fs.rmSync(p) })
    } else {
      // Remove Stripe files
      const stripeFiles = ["apps/api/src/plugins/stripe.ts", "apps/api/src/routes/payments.ts", "apps/api/src/routes/webhooks/stripe.ts"]
      stripeFiles.forEach(f => { const p = path.join(dir, f); if (fs.existsSync(p)) fs.rmSync(p) })
    }
  }
}
```

**Step 3: Create scaffold/patchEnv.ts**

```typescript
import fs from "fs"
import path from "path"

export function writeEnvFile(dir: string, env: Record<string, string>) {
  const lines = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  fs.writeFileSync(path.join(dir, ".env"), lines + "\n")
}
```

**Step 4: Create scaffold/patchPackageJson.ts**

Patches the root `package.json` name, and removes workspace entries for pruned apps.

**Step 5: Wire into init command**

Update `packages/cli/src/commands/init.ts` to call clone → prune → patchEnv → patchPackageJson after onboarding.

**Step 6: Test full scaffold**

Run: `npx tsx src/index.ts init test-project`
Expected: Creates `test-project/` with only selected services, correct `.env`

**Step 7: Commit**

```bash
git commit -m "feat: add scaffold engine with clone, prune, and env patching"
```

---

### Task 13: Patch index.ts imports dynamically

**Files:**
- Create: `packages/cli/src/scaffold/patchImports.ts`

This is the trickiest part. After pruning files, `apps/api/src/index.ts` still imports all plugins and routes. We need to remove import lines and registration lines for pruned services.

**Step 1: Create patchImports.ts**

```typescript
import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

const SERVICE_IMPORTS: Record<string, { import: string; register: string }> = {
  payments: {
    import: 'import stripePlugin from "./plugins/stripe"',
    register: 'await fastify.register(stripePlugin)',
  },
  // ... etc for each service
}

export function patchApiIndex(dir: string, config: ProjectConfig) {
  const indexPath = path.join(dir, "apps/api/src/index.ts")
  let content = fs.readFileSync(indexPath, "utf-8")

  const allServices = Object.keys(SERVICE_IMPORTS)
  for (const service of allServices) {
    if (!config.services.includes(service as any)) {
      const { import: imp, register } = SERVICE_IMPORTS[service]
      content = content.replace(imp + "\n", "")
      content = content.replace(register + "\n", "")
    }
  }

  fs.writeFileSync(indexPath, content)
}
```

**Step 2: Commit**

```bash
git commit -m "feat: dynamically patch API index.ts based on selected services"
```

---

## Phase 4: AI Documentation

### Task 14: Build dynamic CLAUDE.md generator

**Files:**
- Create: `packages/cli/src/docs/claudemd.ts`
- Create: `packages/cli/src/docs/patterns.ts`
- Create: `packages/cli/src/docs/llms.ts`
- Create: `packages/cli/src/docs/index.ts`
- Modify: `packages/cli/src/commands/docs.ts`

**Step 1: Create docs/claudemd.ts**

```typescript
import type { ProjectConfig } from "../types.js"

export function generateClaudeMd(config: ProjectConfig): string {
  const services = ["Auth (Better Auth)", "Database (Drizzle + PostgreSQL)"]
  if (config.services.includes("payments")) {
    services.push(config.paymentsProvider === "stripe" ? "Payments (Stripe)" : "Payments (RevenueCat)")
  }
  if (config.services.includes("email")) services.push("Email (Resend)")
  if (config.services.includes("storage")) services.push(`Storage (${config.storageProvider === "r2" ? "Cloudflare R2" : "AWS S3"})`)
  if (config.services.includes("ai")) services.push(`AI (${config.aiProvider === "openai" ? "OpenAI" : "Fal.ai"})`)
  if (config.services.includes("cron")) services.push("Cron Jobs")
  if (config.services.includes("webhooks")) services.push("Webhooks (outbound)")
  if (config.services.includes("rateLimit")) services.push("Rate Limiting")

  const frontendDesc = config.frontend === "expo"
    ? "apps/mobile/       → Expo SDK 52 (iOS, Android, Web)"
    : "apps/web/          → Vite + React + TailwindCSS + Shadcn/ui"

  return `# ${config.name}

## Structure
apps/api/          → Fastify v5 REST API
${frontendDesc}
packages/db/       → Drizzle ORM + PostgreSQL
packages/shared/   → Zod schemas + constants

## Commands
npm run dev              → Start all apps
npm run db:push          → Push schema changes to DB
npm run db:generate      → Generate migration
npm run db:migrate       → Run migrations
npm run db:seed          → Seed demo data

## Active Services
${services.map(s => `- ${s}`).join("\n")}

## Conventions
- Routes return data directly on success, reply.code(N).send({ error }) on failure
- All routes use Zod validation from @shipfast/shared
- Auth: request.user is set by authenticate preHandler
- New route? Follow the pattern in apps/api/src/routes/items.ts
- New DB model? Add schema in packages/db/src/schema/, export from index.ts
- New validation? Add in packages/shared/src/schemas/, export from index.ts

## Do NOT
- Put business logic in routes (create services in apps/api/src/services/)
- Skip Zod validation on user input
- Return raw database errors to client
- Import from apps/ into packages/ (dependency flows: packages → apps)

## Service Documentation
When working with external services, refer to:
${config.services.includes("payments") ? "- Payments: docs/llms/" + (config.paymentsProvider === "stripe" ? "stripe" : "revenuecat") + ".txt" : ""}
- Auth: docs/llms/better-auth.txt
${config.services.includes("email") ? "- Email: docs/llms/resend.txt" : ""}
${config.services.includes("ai") && config.aiProvider === "falai" ? "- AI: docs/llms/fal-ai.txt" : ""}

## Feature Development Order
1. Schema → packages/db/src/schema/feature.ts
2. Export → packages/db/src/schema/index.ts
3. Migration → npm run db:generate && npm run db:migrate
4. Validation → packages/shared/src/schemas/feature.ts
5. Export → packages/shared/src/index.ts
6. API Route → apps/api/src/routes/feature.ts → register in index.ts
7. Frontend → apps/${config.frontend === "expo" ? "mobile" : "web"}/
`
}
```

**Step 2: Create docs/patterns.ts**

Generate PATTERNS.md with recipes for each selected service. Include the exact "Adding a new X" step-by-step patterns discussed in brainstorming.

**Step 3: Create docs/llms.ts**

```typescript
import fs from "fs"
import path from "path"

const LLM_URLS: Record<string, string> = {
  "better-auth": "https://better-auth.com/llms.txt",
  stripe: "https://docs.stripe.com/llms.txt",
  revenuecat: "https://www.revenuecat.com/docs/llms.txt",
  resend: "https://resend.com/llms.txt",
  "fal-ai": "https://fal.ai/llms.txt",
}

export async function downloadLlmsTxt(dir: string, services: string[]) {
  const llmsDir = path.join(dir, "docs/llms")
  fs.mkdirSync(llmsDir, { recursive: true })

  // Always download better-auth
  const toDownload = ["better-auth", ...services]

  for (const service of toDownload) {
    const url = LLM_URLS[service]
    if (!url) continue

    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        fs.writeFileSync(path.join(llmsDir, `${service}.txt`), text)
      }
    } catch {
      // Skip if download fails — non-critical
    }
  }
}
```

**Step 4: Create docs/index.ts**

Orchestrates CLAUDE.md generation, PATTERNS.md generation, and llms.txt downloads.

**Step 5: Wire into init command and docs command**

- `init` calls docs generation after scaffold
- `docs` command reads a `.shipstack.json` config file (saved during init) and regenerates

**Step 6: Test**

Run: `npx tsx src/index.ts init test-project`
Expected: `test-project/CLAUDE.md`, `test-project/docs/PATTERNS.md`, `test-project/docs/llms/*.txt` all generated correctly

**Step 7: Commit**

```bash
git commit -m "feat: add dynamic AI documentation generator (CLAUDE.md, PATTERNS.md, llms.txt)"
```

---

## Phase 5: Polish

### Task 15: Save config and finalize init command

**Files:**
- Modify: `packages/cli/src/commands/init.ts`

**Step 1: Save .shipstack.json**

After scaffolding, save the `ProjectConfig` to `.shipstack.json` in the project root. The `docs` command reads this to regenerate docs.

**Step 2: Final init output**

```typescript
p.note([
  `cd ${config.name}`,
  "npm install",
  config.databaseProvider === "docker" ? "docker compose up -d" : "",
  "npm run db:push",
  "npm run db:seed",
  "npm run dev",
].filter(Boolean).join("\n"), "Next steps")

p.outro("Your AI-native backend is ready!")
```

**Step 3: Commit**

```bash
git commit -m "feat: finalize init command with config save and next steps"
```

---

### Task 16: Update root CLAUDE.md and README

**Files:**
- Modify: `CLAUDE.md` — document CLI package, new services
- Modify: `README.md` — update with CLI usage, service list

**Step 1: Update CLAUDE.md**

Add section about `packages/cli/`, document the `shipstack-agent` commands, explain how the scaffold engine works.

**Step 2: Update README.md**

Add CLI quickstart, service list, architecture diagram.

**Step 3: Commit**

```bash
git commit -m "docs: update CLAUDE.md and README for shipstack-agent CLI"
```

---

### Task 17: Test end-to-end

**Step 1: Run full init flow**

```bash
cd packages/cli
npx tsx src/index.ts init e2e-test
```

Select all services, enter test keys, verify:
- Project scaffolded with correct files
- `.env` has all keys
- `CLAUDE.md` lists correct services
- `docs/PATTERNS.md` has correct recipes
- `docs/llms/*.txt` files downloaded
- `npm install` succeeds
- `npm run dev` starts API

**Step 2: Test with minimal services**

Run again with only auth + database, verify pruned project works.

**Step 3: Test docs regeneration**

```bash
cd e2e-test
npx shipstack-agent docs
```

Verify CLAUDE.md and PATTERNS.md regenerated.

**Step 4: Fix any issues found**

**Step 5: Commit fixes**

```bash
git commit -m "fix: end-to-end test fixes"
```

---

### Task 18: Prepare for npm publish

**Files:**
- Modify: `packages/cli/package.json` — finalize metadata
- Create: `packages/cli/README.md`

**Step 1: Update package.json**

Add: repository, homepage, author, keywords.

**Step 2: Build and test**

```bash
cd packages/cli && npm run build
node dist/index.js --help
```

**Step 3: Publish**

```bash
npm publish
```

Verify: `npx shipstack-agent init` works globally.

**Step 4: Commit**

```bash
git commit -m "chore: prepare shipstack-agent for npm publish"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| Phase 1: CLI Skeleton | Tasks 1-3 | Working CLI with prompts + guided onboarding |
| Phase 2: Template Services | Tasks 4-11 | All services implemented in the template |
| Phase 3: Scaffolding Engine | Tasks 12-13 | Clone + prune + patch based on selections |
| Phase 4: AI Documentation | Task 14 | Dynamic CLAUDE.md, PATTERNS.md, llms.txt |
| Phase 5: Polish | Tasks 15-18 | Config save, README, e2e tests, npm publish |
