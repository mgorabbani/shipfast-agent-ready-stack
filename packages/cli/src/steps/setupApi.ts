import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import { run } from "../utils/exec.js"
import type { ProjectConfig } from "../types.js"

export function setupApi(dir: string, config: ProjectConfig) {
  const spinner = p.spinner()
  spinner.start("Setting up Fastify API...")

  const apiDir = path.join(dir, "apps/api")
  fs.mkdirSync(path.join(apiDir, "src/plugins"), { recursive: true })
  fs.mkdirSync(path.join(apiDir, "src/routes"), { recursive: true })
  fs.mkdirSync(path.join(apiDir, "src/lib"), { recursive: true })

  // package.json
  const deps: Record<string, string> = {
    "@fastify/cors": "latest",
    "better-auth": "latest",
    dotenv: "latest",
    "drizzle-orm": "latest",
    fastify: "latest",
    postgres: "latest",
    zod: "latest",
  }
  const devDeps: Record<string, string> = {
    tsx: "latest",
    typescript: "latest",
    "drizzle-kit": "latest",
    "@types/node": "latest",
  }

  // Add optional service dependencies
  if (config.services.includes("payments") && config.paymentsProvider === "stripe") {
    deps.stripe = "latest"
  }
  if (config.services.includes("email")) {
    deps.resend = "latest"
  }
  if (config.services.includes("storage")) {
    deps["@aws-sdk/client-s3"] = "latest"
    deps["@aws-sdk/s3-request-presigner"] = "latest"
  }
  if (config.services.includes("ai")) {
    if (config.aiProvider === "openai") deps.openai = "latest"
    if (config.aiProvider === "falai") deps["@fal-ai/client"] = "latest"
  }
  if (config.services.includes("cron")) {
    deps["node-cron"] = "latest"
    devDeps["@types/node-cron"] = "latest"
  }
  if (config.services.includes("rateLimit")) {
    deps["@fastify/rate-limit"] = "latest"
  }

  const apiPkg = {
    name: `@${config.name}/api`,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
    },
    dependencies: deps,
    devDependencies: devDeps,
  }

  fs.writeFileSync(path.join(apiDir, "package.json"), JSON.stringify(apiPkg, null, 2) + "\n")

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      esModuleInterop: true,
      outDir: "./dist",
      rootDir: "./src",
      declaration: true,
    },
    include: ["src"],
  }
  fs.writeFileSync(path.join(apiDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n")

  spinner.stop("API structure created!")
}
