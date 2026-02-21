import { execSync } from "child_process"
import * as p from "@clack/prompts"

export async function cloneTemplate(dir: string) {
  const spinner = p.spinner()
  spinner.start("Cloning ShipFast Stack template...")

  try {
    // Use degit for clean clone (no git history)
    execSync(`npx degit mgorabbani/shipfast-agent-ready-stack ${dir}`, {
      stdio: "pipe",
    })
    spinner.stop("Template cloned!")
  } catch (err: any) {
    spinner.stop("Clone failed")
    throw err
  }
}
