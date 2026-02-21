import * as p from "@clack/prompts"
import crypto from "crypto"
import { openAndCollect } from "../utils/browser.js"
import type { AuthProvider } from "../types.js"

export async function onboardAuth(providers: AuthProvider[]): Promise<Record<string, string>> {
  const env: Record<string, string> = {
    BETTER_AUTH_SECRET: crypto.randomBytes(32).toString("hex"),
  }

  p.log.success("Generated BETTER_AUTH_SECRET")

  if (providers.includes("google")) {
    p.log.step("Setting up Google OAuth")
    const clientId = await openAndCollect({
      service: "Google OAuth",
      url: "https://console.cloud.google.com/apis/credentials",
      instructions: [
        "1. Create a new project (or select existing)",
        '2. Go to "Credentials" → "Create Credentials" → "OAuth client ID"',
        '3. Application type: "Web application"',
        "4. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google",
        "5. Copy the Client ID",
      ],
      envKey: "GOOGLE_CLIENT_ID",
      placeholder: "123456789.apps.googleusercontent.com",
    })
    env.GOOGLE_CLIENT_ID = clientId

    const clientSecret = await p.text({
      message: "Paste your GOOGLE_CLIENT_SECRET:",
      placeholder: "GOCSPX-...",
    })
    if (p.isCancel(clientSecret)) process.exit(0)
    env.GOOGLE_CLIENT_SECRET = clientSecret as string
  }

  if (providers.includes("github")) {
    const clientId = await openAndCollect({
      service: "GitHub OAuth",
      url: "https://github.com/settings/applications/new",
      instructions: [
        "1. Application name: your project name",
        "2. Homepage URL: http://localhost:3000",
        "3. Callback URL: http://localhost:3000/api/auth/callback/github",
        '4. Click "Register application"',
        "5. Copy the Client ID",
      ],
      envKey: "GITHUB_CLIENT_ID",
    })
    env.GITHUB_CLIENT_ID = clientId

    const clientSecret = await p.text({
      message: "Paste your GITHUB_CLIENT_SECRET:",
    })
    if (p.isCancel(clientSecret)) process.exit(0)
    env.GITHUB_CLIENT_SECRET = clientSecret as string
  }

  return env
}
