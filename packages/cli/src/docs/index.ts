import fs from "fs"
import path from "path"
import { generateClaudeMd } from "./claudemd.js"
import { generatePatternsMd } from "./patterns.js"
import { downloadLlmsTxt } from "./llms.js"
import type { ProjectConfig } from "../types.js"

export async function generateDocs(dir: string, config: ProjectConfig) {
  // Generate CLAUDE.md
  const claudeMd = generateClaudeMd(config)
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), claudeMd)

  // Generate docs/PATTERNS.md
  fs.mkdirSync(path.join(dir, "docs"), { recursive: true })
  const patternsMd = generatePatternsMd(config)
  fs.writeFileSync(path.join(dir, "docs/PATTERNS.md"), patternsMd)

  // Download llms.txt from providers
  await downloadLlmsTxt(dir, config)
}
