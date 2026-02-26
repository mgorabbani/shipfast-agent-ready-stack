import * as p from "@clack/prompts"
import type {
  Frontend,
  Service,
  AuthProvider,
  StorageProvider,
  AiProvider,
  DatabaseProvider,
} from "../types.js"

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
