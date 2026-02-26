import * as p from "@clack/prompts"
import fs from "fs"
import path from "path"
import { generateDocs } from "../docs/index.js"
import type { ProjectConfig } from "../types.js"

export async function docsCommand() {
  p.intro("Regenerating AI docs...")

  const configPath = path.resolve(process.cwd(), ".shipstack.json")

  if (!fs.existsSync(configPath)) {
    p.log.error("No .shipstack.json found. Run this command from a ShipStack project root.")
    process.exit(1)
  }

  const config: ProjectConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  const dir = process.cwd()

  await generateDocs(dir, config)

  p.log.success("CLAUDE.md regenerated")
  p.log.success("docs/PATTERNS.md regenerated")
  p.log.success("docs/llms/*.txt refreshed")

  p.outro("AI documentation is up to date!")
}
