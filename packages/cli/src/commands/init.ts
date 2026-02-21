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
  // TODO: Scaffold (Task 12)
  // TODO: Generate AI docs (Task 14)

  p.outro(`${pc.green("Config collected!")} Next: onboarding + scaffold`)
}
