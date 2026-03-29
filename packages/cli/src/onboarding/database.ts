import * as p from "@clack/prompts"
import crypto from "crypto"
import { openAndCollect } from "../utils/browser.js"
import type { DatabaseProvider } from "../types.js"

export async function onboardDatabase(provider: DatabaseProvider): Promise<Record<string, string>> {
  const env: Record<string, string> = {}

  if (provider === "neon") {
    const url = await openAndCollect({
      service: "Neon (PostgreSQL)",
      url: "https://console.neon.tech/signup",
      instructions: [
        "1. Create a free account on Neon",
        "2. Create a new project",
        '3. Copy the connection string (starts with "postgresql://")',
      ],
      envKey: "DATABASE_URL",
      placeholder: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname",
    })
    env.DATABASE_URL = url
  } else if (provider === "railway") {
    const url = await openAndCollect({
      service: "Railway (PostgreSQL)",
      url: "https://railway.app/new",
      instructions: [
        "1. Create an account on Railway",
        '2. Click "New Project" → "Provision PostgreSQL"',
        "3. Go to Variables tab → copy DATABASE_URL",
      ],
      envKey: "DATABASE_URL",
      placeholder: "postgresql://postgres:pass@host.railway.app:5432/railway",
    })
    env.DATABASE_URL = url
  } else if (provider === "docker") {
    const password = crypto.randomBytes(16).toString("hex")
    env.DB_PASSWORD = password
    env.DATABASE_URL = `postgresql://shipfast:${password}@localhost:5432/shipfast`
    p.log.success("Docker PostgreSQL configured. Run: docker compose up -d")
  } else {
    const url = await p.text({
      message: "Paste your PostgreSQL connection string:",
      placeholder: "postgresql://user:pass@host:5432/dbname",
      validate: (v) => {
        if (!v.startsWith("postgresql://") && !v.startsWith("postgres://"))
          return "Must start with postgresql:// or postgres://"
      },
    })
    if (p.isCancel(url)) process.exit(0)
    env.DATABASE_URL = url as string
  }

  return env
}
