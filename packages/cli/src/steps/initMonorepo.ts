import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import { run } from "../utils/exec.js"
import type { ProjectConfig } from "../types.js"

export function initMonorepo(dir: string, config: ProjectConfig) {
  const spinner = p.spinner()
  spinner.start("Creating project directory...")

  fs.mkdirSync(dir, { recursive: true })

  // Root package.json
  const rootPkg = {
    name: config.name,
    private: true,
    workspaces: ["apps/*", "packages/*"],
    scripts: {
      dev: "turbo dev",
      build: "turbo build",
      typecheck: "turbo typecheck",
      "db:generate": "turbo db:generate",
      "db:migrate": "turbo db:migrate",
      "db:push": "turbo db:push",
    },
    devDependencies: {
      turbo: "latest",
      tsx: "latest",
    },
    engines: { node: ">=20.0.0" },
  }

  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(rootPkg, null, 2) + "\n")

  // turbo.json
  const turboConfig = {
    $schema: "https://turbo.build/schema.json",
    tasks: {
      dev: { cache: false, persistent: true },
      build: { dependsOn: ["^build"], outputs: ["dist/**"] },
      typecheck: { dependsOn: ["^build"] },
      "db:generate": {},
      "db:migrate": {},
      "db:push": {},
    },
  }
  fs.writeFileSync(path.join(dir, "turbo.json"), JSON.stringify(turboConfig, null, 2) + "\n")

  // .gitignore
  fs.writeFileSync(
    path.join(dir, ".gitignore"),
    [
      "node_modules/",
      "dist/",
      ".turbo/",
      ".env",
      ".env.local",
      "*.tsbuildinfo",
    ].join("\n") + "\n",
  )

  // Create workspace directories
  fs.mkdirSync(path.join(dir, "apps"), { recursive: true })
  fs.mkdirSync(path.join(dir, "packages"), { recursive: true })

  spinner.stop("Monorepo created!")
}
