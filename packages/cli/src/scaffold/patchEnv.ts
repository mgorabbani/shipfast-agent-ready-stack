import fs from "fs"
import path from "path"

export function writeEnvFile(dir: string, env: Record<string, string>) {
  const lines = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  fs.writeFileSync(path.join(dir, ".env"), lines + "\n")
}
