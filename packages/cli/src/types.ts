export type Frontend = "expo" | "web"

export type Service =
  | "payments"
  | "email"
  | "storage"
  | "ai"
  | "cron"
  | "webhooks"
  | "rateLimit"

export type AuthProvider = "emailPassword" | "google" | "github" | "magicLink" | "twoFactor"

export type PaymentsProvider = "stripe" | "revenuecat"
export type StorageProvider = "r2" | "s3"
export type AiProvider = "openai" | "falai"
export type DatabaseProvider = "neon" | "railway" | "docker" | "custom"

export interface ProjectConfig {
  name: string
  frontend: Frontend
  services: Service[]
  authProviders: AuthProvider[]
  paymentsProvider?: PaymentsProvider
  storageProvider?: StorageProvider
  aiProvider?: AiProvider
  databaseProvider: DatabaseProvider
  env: Record<string, string>
}
