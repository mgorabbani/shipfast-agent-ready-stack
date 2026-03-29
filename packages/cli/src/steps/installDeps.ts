import * as p from "@clack/prompts"
import { run } from "../utils/exec.js"

export function installDeps(dir: string) {
  const spinner = p.spinner()
  spinner.start("Installing dependencies (this may take a minute)...")
  run("npm install", { cwd: dir })
  spinner.stop("Dependencies installed!")
}
