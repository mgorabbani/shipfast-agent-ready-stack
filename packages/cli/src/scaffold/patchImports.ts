import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

interface ServiceImport {
  importLine: string
  registerLine: string
}

const SERVICE_IMPORTS: Record<string, ServiceImport[]> = {
  payments: [
    {
      importLine: 'import stripePlugin from "./plugins/stripe"',
      registerLine: "await fastify.register(stripePlugin)",
    },
    {
      importLine: 'import revenuecatPlugin from "./plugins/revenuecat"',
      registerLine: "await fastify.register(revenuecatPlugin)",
    },
    {
      importLine: 'import paymentRoutes from "./routes/payments"',
      registerLine: 'await fastify.register(paymentRoutes, { prefix: "/api/payments" })',
    },
    {
      importLine: 'import subscriptionRoutes from "./routes/subscriptions"',
      registerLine: 'await fastify.register(subscriptionRoutes, { prefix: "/api/subscriptions" })',
    },
    {
      importLine: 'import stripeWebhookRoutes from "./routes/webhooks/stripe"',
      registerLine: 'await fastify.register(stripeWebhookRoutes, { prefix: "/api/webhooks" })',
    },
    {
      importLine: 'import revenuecatWebhookRoutes from "./routes/webhooks/revenuecat"',
      registerLine: 'await fastify.register(revenuecatWebhookRoutes, { prefix: "/api/webhooks" })',
    },
  ],
  email: [
    {
      importLine: 'import emailPlugin from "./plugins/email"',
      registerLine: "await fastify.register(emailPlugin)",
    },
  ],
  storage: [
    {
      importLine: 'import storagePlugin from "./plugins/storage"',
      registerLine: "await fastify.register(storagePlugin)",
    },
    {
      importLine: 'import uploadRoutes from "./routes/upload"',
      registerLine: 'await fastify.register(uploadRoutes, { prefix: "/api/files" })',
    },
  ],
  ai: [
    {
      importLine: 'import aiPlugin from "./plugins/ai"',
      registerLine: "await fastify.register(aiPlugin)",
    },
    {
      importLine: 'import aiRoutes from "./routes/ai"',
      registerLine: 'await fastify.register(aiRoutes, { prefix: "/api/ai" })',
    },
  ],
  cron: [
    {
      importLine: 'import cronPlugin from "./plugins/cron"',
      registerLine: "await fastify.register(cronPlugin)",
    },
    {
      importLine: 'import { registerCleanupSessionsCron } from "./cron/cleanup-sessions"',
      registerLine: "registerCleanupSessionsCron(fastify)",
    },
  ],
  webhooks: [
    {
      importLine: 'import webhookRoutes from "./routes/webhooks"',
      registerLine: 'await fastify.register(webhookRoutes, { prefix: "/api/webhook-endpoints" })',
    },
  ],
  rateLimit: [
    {
      importLine: 'import rateLimitPlugin from "./plugins/rateLimit"',
      registerLine: "await fastify.register(rateLimitPlugin)",
    },
  ],
}

export function patchApiIndex(dir: string, config: ProjectConfig) {
  const indexPath = path.join(dir, "apps/api/src/index.ts")
  if (!fs.existsSync(indexPath)) return

  let content = fs.readFileSync(indexPath, "utf-8")
  const allServices = Object.keys(SERVICE_IMPORTS)

  for (const service of allServices) {
    if (!config.services.includes(service as any)) {
      for (const { importLine, registerLine } of SERVICE_IMPORTS[service]) {
        content = content.replace(importLine + "\n", "")
        content = content.replace(registerLine + "\n", "")
      }
    }
  }

  // If payments is selected but specific provider should be pruned
  if (config.services.includes("payments")) {
    if (config.paymentsProvider === "stripe") {
      // Remove RevenueCat lines
      content = content.replace('import revenuecatPlugin from "./plugins/revenuecat"\n', "")
      content = content.replace("await fastify.register(revenuecatPlugin)\n", "")
      content = content.replace('import subscriptionRoutes from "./routes/subscriptions"\n', "")
      content = content.replace('await fastify.register(subscriptionRoutes, { prefix: "/api/subscriptions" })\n', "")
      content = content.replace('import revenuecatWebhookRoutes from "./routes/webhooks/revenuecat"\n', "")
      content = content.replace('await fastify.register(revenuecatWebhookRoutes, { prefix: "/api/webhooks" })\n', "")
    } else {
      // Remove Stripe lines
      content = content.replace('import stripePlugin from "./plugins/stripe"\n', "")
      content = content.replace("await fastify.register(stripePlugin)\n", "")
      content = content.replace('import paymentRoutes from "./routes/payments"\n', "")
      content = content.replace('await fastify.register(paymentRoutes, { prefix: "/api/payments" })\n', "")
      content = content.replace('import stripeWebhookRoutes from "./routes/webhooks/stripe"\n', "")
      content = content.replace('await fastify.register(stripeWebhookRoutes, { prefix: "/api/webhooks" })\n', "")
    }
  }

  // Clean up consecutive blank lines
  content = content.replace(/\n{3,}/g, "\n\n")

  fs.writeFileSync(indexPath, content)
}

export function patchDbSchemaIndex(dir: string, config: ProjectConfig) {
  const indexPath = path.join(dir, "packages/db/src/schema/index.ts")
  if (!fs.existsSync(indexPath)) return

  let content = fs.readFileSync(indexPath, "utf-8")

  if (!config.services.includes("payments")) {
    content = content.replace('export * from "./subscriptions"\n', "")
  }
  if (!config.services.includes("storage")) {
    content = content.replace('export * from "./files"\n', "")
  }
  if (!config.services.includes("webhooks")) {
    content = content.replace('export * from "./webhooks"\n', "")
  }

  fs.writeFileSync(indexPath, content)
}

export function patchSharedIndex(dir: string, config: ProjectConfig) {
  const indexPath = path.join(dir, "packages/shared/src/index.ts")
  if (!fs.existsSync(indexPath)) return

  let content = fs.readFileSync(indexPath, "utf-8")

  if (!config.services.includes("payments")) {
    content = content.replace('export * from "./schemas/payments"\n', "")
  }

  fs.writeFileSync(indexPath, content)
}
