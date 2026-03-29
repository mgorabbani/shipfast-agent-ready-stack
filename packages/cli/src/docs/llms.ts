import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import type { ProjectConfig } from "../types.js"

const LLM_URLS: Record<string, string> = {
  "better-auth": "https://better-auth.com/llms.txt",
  stripe: "https://docs.stripe.com/llms.txt",
  revenuecat: "https://www.revenuecat.com/docs/llms.txt",
  resend: "https://resend.com/llms.txt",
  "fal-ai": "https://fal.ai/llms.txt",
}

export async function downloadLlmsTxt(dir: string, config: ProjectConfig) {
  const llmsDir = path.join(dir, "docs/llms")
  fs.mkdirSync(llmsDir, { recursive: true })

  // Determine which providers to download
  const toDownload = new Set<string>(["better-auth"])

  if (config.services.includes("payments")) {
    toDownload.add(config.paymentsProvider === "stripe" ? "stripe" : "revenuecat")
  }
  if (config.services.includes("email")) toDownload.add("resend")
  if (config.services.includes("ai") && config.aiProvider === "falai") toDownload.add("fal-ai")

  const spinner = p.spinner()
  spinner.start("Downloading provider documentation (llms.txt)...")

  let downloaded = 0
  for (const service of toDownload) {
    const url = LLM_URLS[service]
    if (!url) continue

    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        fs.writeFileSync(path.join(llmsDir, `${service}.txt`), text)
        downloaded++
      }
    } catch {
      // Non-critical — skip if download fails
    }
  }

  spinner.stop(`Downloaded ${downloaded}/${toDownload.size} llms.txt files`)
}
