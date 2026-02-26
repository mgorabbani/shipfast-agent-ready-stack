import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import type { ProjectConfig } from "../types.js"

export function setupShared(dir: string, config: ProjectConfig) {
  const spinner = p.spinner()
  spinner.start("Setting up shared package...")

  const sharedDir = path.join(dir, "packages/shared")
  fs.mkdirSync(path.join(sharedDir, "src/schemas"), { recursive: true })
  fs.mkdirSync(path.join(sharedDir, "src/constants"), { recursive: true })

  const sharedPkg = {
    name: `@${config.name}/shared`,
    version: "0.0.1",
    private: true,
    type: "module",
    main: "./src/index.ts",
    dependencies: {
      zod: "latest",
    },
    devDependencies: {
      typescript: "latest",
    },
  }
  fs.writeFileSync(path.join(sharedDir, "package.json"), JSON.stringify(sharedPkg, null, 2) + "\n")

  fs.writeFileSync(
    path.join(sharedDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          strict: true,
          esModuleInterop: true,
          declaration: true,
        },
        include: ["src"],
      },
      null,
      2,
    ) + "\n",
  )

  spinner.stop("Shared package created!")
}
