import type { ProjectConfig } from "../types.js"

export function generatePatternsMd(config: ProjectConfig): string {
  const sections: string[] = []

  sections.push(`# ${config.name} — Development Patterns

> Step-by-step recipes for common tasks in this project.
`)

  // Always included patterns
  sections.push(`## Adding a New Database Model

1. Create \`packages/db/src/schema/feature.ts\`:
   \`\`\`typescript
   import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
   import { relations } from "drizzle-orm"
   import { users } from "./users"

   export const features = pgTable("features", {
     id: uuid("id").defaultRandom().primaryKey(),
     userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
     name: text("name").notNull(),
     createdAt: timestamp("created_at").defaultNow().notNull(),
   })

   export const featuresRelations = relations(features, ({ one }) => ({
     user: one(users, { fields: [features.userId], references: [users.id] }),
   }))
   \`\`\`

2. Export from \`packages/db/src/schema/index.ts\`:
   \`\`\`typescript
   export * from "./feature"
   \`\`\`

3. Generate migration: \`npm run db:generate\`
4. Run migration: \`npm run db:migrate\`
`)

  sections.push(`## Adding a New API Route

1. Create \`apps/api/src/routes/feature.ts\`:
   \`\`\`typescript
   import { FastifyInstance } from "fastify"
   import { eq } from "drizzle-orm"
   import { features } from "@shipfast/db"

   export default async function featureRoutes(fastify: FastifyInstance) {
     fastify.addHook("preHandler", fastify.authenticate)

     fastify.get("/", async (request) => {
       return fastify.db
         .select()
         .from(features)
         .where(eq(features.userId, request.user!.id))
     })

     fastify.post("/", async (request) => {
       const body = createFeatureSchema.parse(request.body)
       const [feature] = await fastify.db
         .insert(features)
         .values({ ...body, userId: request.user!.id })
         .returning()
       return feature
     })
   }
   \`\`\`

2. Register in \`apps/api/src/index.ts\`:
   \`\`\`typescript
   import featureRoutes from "./routes/feature"
   await fastify.register(featureRoutes, { prefix: "/api/features" })
   \`\`\`
`)

  sections.push(`## Adding Zod Validation Schemas

1. Create \`packages/shared/src/schemas/feature.ts\`:
   \`\`\`typescript
   import { z } from "zod"

   export const createFeatureSchema = z.object({
     name: z.string().min(1).max(100),
   })
   export type CreateFeatureInput = z.infer<typeof createFeatureSchema>
   \`\`\`

2. Export from \`packages/shared/src/index.ts\`:
   \`\`\`typescript
   export * from "./schemas/feature"
   \`\`\`
`)

  // Conditional patterns based on selected services
  if (config.services.includes("payments") && config.paymentsProvider === "stripe") {
    sections.push(`## Adding a Stripe Webhook Handler

1. Add event to \`apps/api/src/routes/webhooks/stripe.ts\` switch block:
   \`\`\`typescript
   case "invoice.payment_succeeded": {
     const invoice = event.data.object
     // Handle payment success
     break
   }
   \`\`\`

2. Add the event to your Stripe webhook endpoint settings.
`)
  }

  if (config.services.includes("email")) {
    sections.push(`## Adding an Email Template

1. Create \`apps/api/src/emails/feature-notify.ts\`:
   \`\`\`typescript
   export function featureNotifyEmail(name: string): { subject: string; html: string } {
     return {
       subject: "Your feature is ready!",
       html: \`<h1>Hi \${name}!</h1><p>Your feature has been activated.</p>\`,
     }
   }
   \`\`\`

2. Send from any route:
   \`\`\`typescript
   import { sendEmail } from "../services/email.js"
   import { featureNotifyEmail } from "../emails/feature-notify.js"

   const template = featureNotifyEmail(user.name)
   await sendEmail(fastify.email, { to: user.email, ...template })
   \`\`\`
`)
  }

  if (config.services.includes("storage")) {
    sections.push(`## Adding File Upload to a Feature

1. Use presigned URLs from the upload service:
   \`\`\`typescript
   // Client requests upload URL
   const { uploadUrl, fileId } = await api.post("/api/files/presign", {
     filename: "photo.jpg",
     contentType: "image/jpeg",
   })

   // Client uploads directly to S3/R2
   await fetch(uploadUrl, { method: "PUT", body: file })

   // Client stores fileId with the feature
   await api.post("/api/features", { name: "My Feature", fileId })
   \`\`\`
`)
  }

  if (config.services.includes("cron")) {
    sections.push(`## Adding a Cron Job

1. Create \`apps/api/src/cron/my-job.ts\`:
   \`\`\`typescript
   import { FastifyInstance } from "fastify"

   export function registerMyJobCron(fastify: FastifyInstance) {
     fastify.cron.schedule("0 * * * *", async () => { // every hour
       fastify.log.info("Running my job...")
       // your logic here
     })
   }
   \`\`\`

2. Register in \`apps/api/src/index.ts\`:
   \`\`\`typescript
   import { registerMyJobCron } from "./cron/my-job"
   registerMyJobCron(fastify)
   \`\`\`
`)
  }

  if (config.services.includes("webhooks")) {
    sections.push(`## Dispatching Outbound Webhooks

1. After a significant event in your route:
   \`\`\`typescript
   import { dispatchWebhookEvent } from "../services/webhook.js"

   // After creating a feature
   await dispatchWebhookEvent(fastify.db, {
     event: "feature.created",
     payload: { id: feature.id, name: feature.name },
     userId: request.user!.id,
   })
   \`\`\`
`)
  }

  return sections.join("\n")
}
