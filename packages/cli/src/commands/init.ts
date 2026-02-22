import * as p from "@clack/prompts"
import pc from "picocolors"
import fs from "fs"
import path from "path"
import { promptProject } from "../prompts/project.js"
import { promptFrontend } from "../prompts/frontend.js"
import {
  promptServices,
  promptAuthProviders,
  promptStorageProvider,
  promptAiProvider,
  promptDatabaseProvider,
} from "../prompts/services.js"
import { runOnboarding } from "../onboarding/index.js"
import { initMonorepo } from "../steps/initMonorepo.js"
import { setupApi } from "../steps/setupApi.js"
import { setupFrontend } from "../steps/setupFrontend.js"
import { setupDatabase } from "../steps/setupDatabase.js"
import { setupShared } from "../steps/setupShared.js"
import { generateDbSchema } from "../generators/dbSchema.js"
import { generateApiCode } from "../generators/apiCode.js"
import { writeEnvFile } from "../steps/writeEnv.js"
import { installDeps } from "../steps/installDeps.js"
import { generateDocs } from "../docs/index.js"
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

  // Guided onboarding — collect API keys
  const env = await runOnboarding(config)
  config.env = env
  p.log.success(`Collected ${Object.keys(env).length} environment variables`)

  // Scaffold from scratch using latest packages
  initMonorepo(project.dir, config)
  setupDatabase(project.dir, config)
  setupShared(project.dir, config)
  setupApi(project.dir, config)
  setupFrontend(project.dir, config)

  // Generate source code based on config
  generateDbSchema(project.dir, config)
  generateApiCode(project.dir, config)

  // Write env files
  writeEnvFile(project.dir, config)

  // Install all dependencies (gets latest versions)
  installDeps(project.dir)

  // Generate AI documentation
  await generateDocs(project.dir, config)
  p.log.success("AI documentation generated!")

  // Save config for docs regeneration
  fs.writeFileSync(
    path.join(project.dir, ".shipstack.json"),
    JSON.stringify(config, null, 2) + "\n",
  )

  // Init git repo
  const { execSync } = await import("child_process")
  execSync("git init && git add -A && git commit -m 'Initial commit from shipstack-agent'", {
    cwd: project.dir,
    stdio: "pipe",
  })
  p.log.success("Git repository initialized!")

  // Final output
  p.note(
    [
      `cd ${config.name}`,
      config.databaseProvider === "docker" ? "docker compose up -d" : "",
      "npm run db:push",
      "npm run dev",
    ]
      .filter(Boolean)
      .join("\n"),
    "Next steps",
  )

  p.outro("Your project is ready — built with the latest packages!")
}
