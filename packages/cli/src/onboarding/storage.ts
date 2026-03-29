import { openAndCollect } from "../utils/browser.js"
import type { StorageProvider } from "../types.js"

export async function onboardStorage(provider: StorageProvider): Promise<Record<string, string>> {
  if (provider === "r2") {
    const accountId = await openAndCollect({
      service: "Cloudflare R2",
      url: "https://dash.cloudflare.com/?to=/:account/r2",
      instructions: [
        "1. Sign in to Cloudflare dashboard",
        "2. Go to R2 → Create bucket",
        "3. Go to R2 → Manage R2 API Tokens → Create API Token",
        "4. Copy your Account ID from the dashboard URL",
      ],
      envKey: "CLOUDFLARE_ACCOUNT_ID",
    })

    const accessKeyId = await openAndCollect({
      service: "Cloudflare R2 (access key)",
      url: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      instructions: ["Copy the Access Key ID from the API token you created"],
      envKey: "S3_ACCESS_KEY_ID",
    })

    const secretAccessKey = await openAndCollect({
      service: "Cloudflare R2 (secret key)",
      url: "https://dash.cloudflare.com/?to=/:account/r2/api-tokens",
      instructions: ["Copy the Secret Access Key"],
      envKey: "S3_SECRET_ACCESS_KEY",
    })

    return {
      S3_ENDPOINT: `https://${accountId}.r2.cloudflarestorage.com`,
      S3_ACCESS_KEY_ID: accessKeyId,
      S3_SECRET_ACCESS_KEY: secretAccessKey,
      S3_BUCKET: "uploads",
      S3_REGION: "auto",
    }
  }

  // AWS S3
  const accessKeyId = await openAndCollect({
    service: "AWS S3",
    url: "https://console.aws.amazon.com/iam/home#/security_credentials",
    instructions: [
      "1. Go to IAM → Create access key",
      "2. Or use an existing access key",
    ],
    envKey: "S3_ACCESS_KEY_ID",
    placeholder: "AKIA...",
  })

  const secretAccessKey = await openAndCollect({
    service: "AWS S3 (secret)",
    url: "https://console.aws.amazon.com/iam/home",
    instructions: ["Copy the Secret Access Key"],
    envKey: "S3_SECRET_ACCESS_KEY",
  })

  return {
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET_ACCESS_KEY: secretAccessKey,
    S3_BUCKET: "uploads",
    S3_REGION: "us-east-1",
  }
}
