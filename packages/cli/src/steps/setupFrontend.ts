import * as p from "@clack/prompts"
import { run } from "../utils/exec.js"
import type { ProjectConfig } from "../types.js"

export function setupFrontend(dir: string, config: ProjectConfig) {
  const spinner = p.spinner()

  if (config.frontend === "expo") {
    spinner.start("Creating Expo app (latest SDK)...")
    run(`npx create-expo-app@latest apps/mobile --template blank-typescript --no-install`, { cwd: dir })
    spinner.stop("Expo app created!")
  } else {
    spinner.start("Creating Vite + React app...")
    run(`npm create vite@latest apps/web -- --template react-ts`, { cwd: dir })
    spinner.stop("Vite + React app created!")
  }
}
