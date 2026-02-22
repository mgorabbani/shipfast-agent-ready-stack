import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import type { ProjectConfig } from "../types.js"

export function writeEnvFile(dir: string, config: ProjectConfig) {
  const lines = Object.entries(config.env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  fs.writeFileSync(path.join(dir, ".env"), lines + "\n")

  // Also write .env.example with placeholders
  const exampleLines = Object.keys(config.env)
    .map((key) => `${key}=`)
    .join("\n")

  fs.writeFileSync(path.join(dir, ".env.example"), exampleLines + "\n")

  p.log.success(`Wrote .env with ${Object.keys(config.env).length} variables`)
}
