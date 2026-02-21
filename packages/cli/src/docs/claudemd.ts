import type { ProjectConfig } from "../types.js"

export function generateClaudeMd(config: ProjectConfig): string {
  const services = ["Auth (Better Auth)", "Database (Drizzle + PostgreSQL)"]
  if (config.services.includes("payments")) {
    services.push(config.paymentsProvider === "stripe" ? "Payments (Stripe)" : "Payments (RevenueCat)")
  }
  if (config.services.includes("email")) services.push("Email (Resend)")
  if (config.services.includes("storage")) {
    services.push(`Storage (${config.storageProvider === "r2" ? "Cloudflare R2" : "AWS S3"})`)
  }
  if (config.services.includes("ai")) {
    services.push(`AI (${config.aiProvider === "openai" ? "OpenAI" : "Fal.ai"})`)
  }
  if (config.services.includes("cron")) services.push("Cron Jobs")
  if (config.services.includes("webhooks")) services.push("Webhooks (outbound)")
  if (config.services.includes("rateLimit")) services.push("Rate Limiting")

  const frontendDesc = config.frontend === "expo"
    ? "apps/mobile/       → Expo SDK 52 (iOS, Android, Web)"
    : "apps/web/          → Vite + React + TailwindCSS"

  const llmsDocs: string[] = []
  llmsDocs.push("- Auth: docs/llms/better-auth.txt")
  if (config.services.includes("payments")) {
    llmsDocs.push(`- Payments: docs/llms/${config.paymentsProvider === "stripe" ? "stripe" : "revenuecat"}.txt`)
  }
  if (config.services.includes("email")) {
    llmsDocs.push("- Email: docs/llms/resend.txt")
  }
  if (config.services.includes("ai") && config.aiProvider === "falai") {
    llmsDocs.push("- AI: docs/llms/fal-ai.txt")
  }

  const frontendAppDir = config.frontend === "expo" ? "mobile" : "web"

  return `# ${config.name}

## Structure

\`\`\`
apps/api/          → Fastify v5 REST API
${frontendDesc}
packages/db/       → Drizzle ORM + PostgreSQL
packages/shared/   → Zod schemas + constants
\`\`\`

## Commands

\`\`\`bash
npm run dev              # Start all apps
npm run db:push          # Push schema changes to DB
npm run db:generate      # Generate migration
npm run db:migrate       # Run migrations
npm run db:seed          # Seed demo data
\`\`\`

## Active Services

${services.map((s) => `- ${s}`).join("\n")}

## Conventions

- Routes return data directly on success, \`reply.code(N).send({ error })\` on failure
- All routes use Zod validation from \`@shipfast/shared\`
- Auth: \`request.user\` is set by \`authenticate\` preHandler
- New route? Follow the pattern in \`apps/api/src/routes/items.ts\`
- New DB model? Add schema in \`packages/db/src/schema/\`, export from \`index.ts\`
- New validation? Add in \`packages/shared/src/schemas/\`, export from \`index.ts\`

## Do NOT

- Put business logic in routes (create services in \`apps/api/src/services/\`)
- Skip Zod validation on user input
- Return raw database errors to client
- Import from \`apps/\` into \`packages/\` (dependency flows: packages → apps)

## Service Documentation

When working with external services, refer to:
${llmsDocs.join("\n")}

## Feature Development Order

1. Schema → \`packages/db/src/schema/feature.ts\`
2. Export → \`packages/db/src/schema/index.ts\`
3. Migration → \`npm run db:generate && npm run db:migrate\`
4. Validation → \`packages/shared/src/schemas/feature.ts\`
5. Export → \`packages/shared/src/index.ts\`
6. API Route → \`apps/api/src/routes/feature.ts\` → register in \`index.ts\`
7. Frontend → \`apps/${frontendAppDir}/\`
`
}
