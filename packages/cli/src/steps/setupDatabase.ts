import fs from "fs"
import path from "path"
import * as p from "@clack/prompts"
import type { ProjectConfig } from "../types.js"

export function setupDatabase(dir: string, config: ProjectConfig) {
  const spinner = p.spinner()
  spinner.start("Setting up Drizzle ORM + PostgreSQL...")

  const dbDir = path.join(dir, "packages/db")
  fs.mkdirSync(path.join(dbDir, "src/schema"), { recursive: true })

  // package.json
  const dbPkg = {
    name: `@${config.name}/db`,
    version: "0.0.1",
    private: true,
    type: "module",
    main: "./src/index.ts",
    scripts: {
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:push": "drizzle-kit push",
    },
    dependencies: {
      "drizzle-orm": "latest",
      postgres: "latest",
    },
    devDependencies: {
      "drizzle-kit": "latest",
      typescript: "latest",
    },
  }
  fs.writeFileSync(path.join(dbDir, "package.json"), JSON.stringify(dbPkg, null, 2) + "\n")

  // drizzle.config.ts
  fs.writeFileSync(
    path.join(dbDir, "drizzle.config.ts"),
    `import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
`,
  )

  // tsconfig.json
  fs.writeFileSync(
    path.join(dbDir, "tsconfig.json"),
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

  // Docker compose (always include — useful even with hosted DB for local dev)
  if (config.databaseProvider === "docker") {
    fs.writeFileSync(
      path.join(dir, "docker-compose.yml"),
      `services:
  postgres:
    image: postgres:17
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: shipfast
      POSTGRES_PASSWORD: \${DB_PASSWORD:-changeme}
      POSTGRES_DB: shipfast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`,
    )
  }

  spinner.stop("Database package created!")
}
