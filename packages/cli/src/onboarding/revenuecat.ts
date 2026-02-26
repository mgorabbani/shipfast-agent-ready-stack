import { openAndCollect } from "../utils/browser.js"

export async function onboardRevenuecat(): Promise<Record<string, string>> {
  const apiKey = await openAndCollect({
    service: "RevenueCat",
    url: "https://app.revenuecat.com/signup",
    instructions: [
      "1. Create a RevenueCat account",
      "2. Create a new project",
      "3. Add your app (iOS/Android)",
      "4. Go to API Keys → copy the public API key",
    ],
    envKey: "REVENUECAT_API_KEY",
    placeholder: "appl_...",
  })

  const secretKey = await openAndCollect({
    service: "RevenueCat (secret)",
    url: "https://app.revenuecat.com",
    instructions: ["Copy the Secret API key from the same API Keys page"],
    envKey: "REVENUECAT_SECRET_KEY",
    placeholder: "sk_...",
  })

  return {
    REVENUECAT_API_KEY: apiKey,
    REVENUECAT_SECRET_KEY: secretKey,
  }
}
