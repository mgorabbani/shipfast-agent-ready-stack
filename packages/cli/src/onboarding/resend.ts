import { openAndCollect } from "../utils/browser.js"

export async function onboardResend(): Promise<Record<string, string>> {
  const apiKey = await openAndCollect({
    service: "Resend",
    url: "https://resend.com/signup",
    instructions: [
      "1. Create a Resend account",
      "2. Go to API Keys → Create API Key",
      "3. Copy the key (starts with re_)",
    ],
    envKey: "RESEND_API_KEY",
    placeholder: "re_...",
  })

  return { RESEND_API_KEY: apiKey }
}
