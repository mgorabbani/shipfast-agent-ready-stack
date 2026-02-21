import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

export function patchPackageJson(dir: string, config: ProjectConfig) {
  // Patch root package.json
  const rootPkgPath = path.join(dir, "package.json")
  if (fs.existsSync(rootPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"))
    pkg.name = config.name
    fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2) + "\n")
  }

  // Patch API package.json — remove unused service dependencies
  const apiPkgPath = path.join(dir, "apps/api/package.json")
  if (fs.existsSync(apiPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(apiPkgPath, "utf-8"))
    const deps = pkg.dependencies ?? {}

    if (!config.services.includes("payments") || config.paymentsProvider !== "stripe") {
      delete deps.stripe
    }
    if (!config.services.includes("email")) {
      delete deps.resend
    }
    if (!config.services.includes("storage")) {
      delete deps["@aws-sdk/client-s3"]
      delete deps["@aws-sdk/s3-request-presigner"]
    }
    if (!config.services.includes("ai")) {
      delete deps.openai
      delete deps["@fal-ai/client"]
    }
    if (!config.services.includes("cron")) {
      delete deps["node-cron"]
      const devDeps = pkg.devDependencies ?? {}
      delete devDeps["@types/node-cron"]
    }
    if (!config.services.includes("rateLimit")) {
      delete deps["@fastify/rate-limit"]
    }

    fs.writeFileSync(apiPkgPath, JSON.stringify(pkg, null, 2) + "\n")
  }
}
