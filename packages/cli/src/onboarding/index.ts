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
