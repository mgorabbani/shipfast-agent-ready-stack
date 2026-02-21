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
  const allServices = Object.keys(SERVICE_FILES)

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
      const rcFiles = [
        "apps/api/src/plugins/revenuecat.ts",
        "apps/api/src/routes/subscriptions.ts",
        "apps/api/src/routes/webhooks/revenuecat.ts",
      ]
      for (const f of rcFiles) {
        const fullPath = path.join(dir, f)
        if (fs.existsSync(fullPath)) fs.rmSync(fullPath)
      }
    } else {
      const stripeFiles = [
        "apps/api/src/plugins/stripe.ts",
        "apps/api/src/routes/payments.ts",
        "apps/api/src/routes/webhooks/stripe.ts",
      ]
      for (const f of stripeFiles) {
        const fullPath = path.join(dir, f)
        if (fs.existsSync(fullPath)) fs.rmSync(fullPath)
      }
    }
  }

  // Clean up empty directories
  cleanEmptyDirs(path.join(dir, "apps/api/src"))
}

function cleanEmptyDirs(dirPath: string) {
  if (!fs.existsSync(dirPath)) return
  const stat = fs.statSync(dirPath)
  if (!stat.isDirectory()) return

  let files = fs.readdirSync(dirPath)
  for (const file of files) {
    cleanEmptyDirs(path.join(dirPath, file))
  }

  files = fs.readdirSync(dirPath)
  if (files.length === 0) {
    fs.rmdirSync(dirPath)
  }
}
