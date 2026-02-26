import { openAndCollect } from "../utils/browser.js"
import type { AiProvider } from "../types.js"

export async function onboardAi(provider: AiProvider): Promise<Record<string, string>> {
  if (provider === "openai") {
    const key = await openAndCollect({
      service: "OpenAI",
      url: "https://platform.openai.com/api-keys",
      instructions: [
        "1. Sign in to OpenAI platform",
        "2. Go to API Keys → Create new secret key",
        "3. Copy the key (starts with sk-)",
      ],
      envKey: "OPENAI_API_KEY",
      placeholder: "sk-...",
    })
    return { OPENAI_API_KEY: key }
  }

  const key = await openAndCollect({
    service: "Fal.ai",
    url: "https://fal.ai/dashboard/keys",
    instructions: [
      "1. Sign in to Fal.ai",
      "2. Go to Keys → Create Key",
      "3. Copy the key",
    ],
    envKey: "FAL_KEY",
  })
  return { FAL_KEY: key }
}
