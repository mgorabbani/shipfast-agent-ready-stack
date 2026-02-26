import { execSync } from "child_process"
import * as p from "@clack/prompts"

export function run(cmd: string, opts?: { cwd?: string; silent?: boolean }) {
  try {
    execSync(cmd, {
      cwd: opts?.cwd,
      stdio: opts?.silent ? "pipe" : "inherit",
    })
  } catch (err: any) {
    p.log.error(`Command failed: ${cmd}`)
    throw err
  }
}

export function runSilent(cmd: string, opts?: { cwd?: string }): string {
  return execSync(cmd, { cwd: opts?.cwd, stdio: "pipe" }).toString().trim()
}
