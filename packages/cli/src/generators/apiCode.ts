import fs from "fs"
import path from "path"
import type { ProjectConfig } from "../types.js"

export function generateApiCode(dir: string, config: ProjectConfig) {
  const apiSrc = path.join(dir, "apps/api/src")

  generateAuthLib(apiSrc, config)
  generatePlugins(apiSrc, config)
  generateRoutes(apiSrc, config)
  generateSharedSchemas(dir, config)
  generateIndex(apiSrc, config)
}

function generateAuthLib(apiSrc: string, config: ProjectConfig) {
  const socialProviders: string[] = []

  if (config.authProviders.includes("google")) {
    socialProviders.push(`    ...(process.env.GOOGLE_CLIENT_ID && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    }),`)
  }
  if (config.authProviders.includes("github")) {
    socialProviders.push(`    ...(process.env.GITHUB_CLIENT_ID && {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    }),`)
  }

  fs.writeFileSync(
    path.join(apiSrc, "lib/auth.ts"),
    `import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createDb } from "@${path.basename(path.resolve(apiSrc, "../../.."))}/db"

const db = createDb(process.env.DATABASE_URL!)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
${socialProviders.join("\n")}
  },
  secret: process.env.BETTER_AUTH_SECRET,
})
`,
  )
}

function generatePlugins(apiSrc: string, config: ProjectConfig) {
  // db plugin
  fs.writeFileSync(
    path.join(apiSrc, "plugins/db.ts"),
    `import { FastifyInstance } from "fastify"
import { createDb, type Database } from "@${config.name}/db"

declare module "fastify" {
  interface FastifyInstance {
    db: Database
  }
}

export default async function dbPlugin(fastify: FastifyInstance) {
  const db = createDb(process.env.DATABASE_URL!)
  fastify.decorate("db", db)
}
`,
  )

  // cors plugin
  fs.writeFileSync(
    path.join(apiSrc, "plugins/cors.ts"),
    `import { FastifyInstance } from "fastify"
import cors from "@fastify/cors"

export default async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  })
}
`,
  )

  // auth plugin
  fs.writeFileSync(
    path.join(apiSrc, "plugins/auth.ts"),
    `import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { auth } from "../lib/auth.js"

declare module "fastify" {
  interface FastifyRequest {
    user: { id: string; email: string; role: string } | null
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  fastify.all("/api/auth/*", async (request, reply) => {
    const url = new URL(request.url, \`http://\${request.headers.host}\`)
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value)
    }

    const fetchRequest = new Request(url, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? JSON.stringify(request.body)
        : undefined,
    })

    const response = await auth.handler(fetchRequest)
    reply.status(response.status)
    response.headers.forEach((value, key) => reply.header(key, value))
    return reply.send(await response.text())
  })

  fastify.decorateRequest("user", null)

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({ headers: request.headers as any })
    if (!session) return reply.code(401).send({ error: "Unauthorized" })
    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: (session.user as any).role ?? "user",
    }
  })
}
`,
  )

  // Optional plugins
  if (config.services.includes("payments") && config.paymentsProvider === "stripe") {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/stripe.ts"),
      `import { FastifyInstance } from "fastify"
import Stripe from "stripe"

declare module "fastify" {
  interface FastifyInstance { stripe: Stripe }
}

export default async function stripePlugin(fastify: FastifyInstance) {
  fastify.decorate("stripe", new Stripe(process.env.STRIPE_SECRET_KEY!))
}
`,
    )
  }

  if (config.services.includes("email")) {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/email.ts"),
      `import { FastifyInstance } from "fastify"
import { Resend } from "resend"

declare module "fastify" {
  interface FastifyInstance { email: Resend }
}

export default async function emailPlugin(fastify: FastifyInstance) {
  fastify.decorate("email", new Resend(process.env.RESEND_API_KEY))
}
`,
    )
  }

  if (config.services.includes("storage")) {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/storage.ts"),
      `import { FastifyInstance } from "fastify"
import { S3Client } from "@aws-sdk/client-s3"

declare module "fastify" {
  interface FastifyInstance { s3: S3Client }
}

export default async function storagePlugin(fastify: FastifyInstance) {
  fastify.decorate("s3", new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  }))
}
`,
    )
  }

  if (config.services.includes("ai")) {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/ai.ts"),
      `import { FastifyInstance } from "fastify"

interface AiService {
  complete(prompt: string): Promise<string>
}

declare module "fastify" {
  interface FastifyInstance { ai: AiService }
}

export default async function aiPlugin(fastify: FastifyInstance) {
${config.aiProvider === "openai" ? `  const { default: OpenAI } = await import("openai")
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  fastify.decorate("ai", {
    async complete(prompt: string) {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      })
      return res.choices[0]?.message?.content ?? ""
    },
  })` : `  const { fal } = await import("@fal-ai/client")
  fal.config({ credentials: process.env.FAL_KEY })
  fastify.decorate("ai", {
    async complete(prompt: string) {
      const result: any = await fal.subscribe("fal-ai/any-llm", { input: { prompt } })
      return result.data?.output ?? ""
    },
  })`}
}
`,
    )
  }

  if (config.services.includes("cron")) {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/cron.ts"),
      `import { FastifyInstance } from "fastify"
import cron from "node-cron"

declare module "fastify" {
  interface FastifyInstance {
    cron: { schedule: (expression: string, fn: () => void | Promise<void>) => cron.ScheduledTask }
  }
}

export default async function cronPlugin(fastify: FastifyInstance) {
  const jobs: cron.ScheduledTask[] = []
  fastify.decorate("cron", {
    schedule: (expression: string, fn: () => void | Promise<void>) => {
      const job = cron.schedule(expression, fn)
      jobs.push(job)
      return job
    },
  })
  fastify.addHook("onClose", () => jobs.forEach((j) => j.stop()))
}
`,
    )
  }

  if (config.services.includes("rateLimit")) {
    fs.writeFileSync(
      path.join(apiSrc, "plugins/rateLimit.ts"),
      `import { FastifyInstance } from "fastify"
import rateLimit from "@fastify/rate-limit"

export default async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" })
}
`,
    )
  }
}

function generateRoutes(apiSrc: string, config: ProjectConfig) {
  // items CRUD example (always included)
  fs.writeFileSync(
    path.join(apiSrc, "routes/items.ts"),
    `import { FastifyInstance } from "fastify"
import { eq, and } from "drizzle-orm"
import { items } from "@${config.name}/db"
import { createItemSchema, updateItemSchema } from "@${config.name}/shared"

export default async function itemRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.get("/", async (request) => {
    return fastify.db.select().from(items).where(eq(items.userId, request.user!.id))
  })

  fastify.post("/", async (request) => {
    const body = createItemSchema.parse(request.body)
    const [item] = await fastify.db.insert(items).values({ ...body, userId: request.user!.id }).returning()
    return item
  })

  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = updateItemSchema.parse(request.body)
    const [item] = await fastify.db.update(items).set({ ...body, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, request.user!.id))).returning()
    if (!item) return reply.code(404).send({ error: "Item not found" })
    return item
  })

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }
    const [item] = await fastify.db.delete(items)
      .where(and(eq(items.id, id), eq(items.userId, request.user!.id))).returning()
    if (!item) return reply.code(404).send({ error: "Item not found" })
    return { success: true }
  })
}
`,
  )

  // payments routes
  if (config.services.includes("payments") && config.paymentsProvider === "stripe") {
    fs.mkdirSync(path.join(apiSrc, "routes/webhooks"), { recursive: true })
    fs.writeFileSync(
      path.join(apiSrc, "routes/payments.ts"),
      `import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions } from "@${config.name}/db"
import { z } from "zod"

const checkoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export default async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.post("/checkout", async (request) => {
    const body = checkoutSchema.parse(request.body)
    const session = await fastify.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: body.priceId, quantity: 1 }],
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      customer_email: request.user!.email,
      metadata: { userId: request.user!.id },
    })
    return { url: session.url }
  })

  fastify.get("/subscription", async (request) => {
    const [sub] = await fastify.db.select().from(subscriptions)
      .where(eq(subscriptions.userId, request.user!.id)).limit(1)
    return sub ?? null
  })
}
`,
    )
  }

  // AI routes
  if (config.services.includes("ai")) {
    fs.writeFileSync(
      path.join(apiSrc, "routes/ai.ts"),
      `import { FastifyInstance } from "fastify"
import { z } from "zod"

const completeSchema = z.object({ prompt: z.string().min(1).max(10000) })

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  fastify.post("/complete", async (request) => {
    const { prompt } = completeSchema.parse(request.body)
    const result = await fastify.ai.complete(prompt)
    return { result }
  })
}
`,
    )
  }
}

function generateIndex(apiSrc: string, config: ProjectConfig) {
  const imports: string[] = [
    'import "dotenv/config"',
    'import Fastify from "fastify"',
    'import dbPlugin from "./plugins/db"',
    'import corsPlugin from "./plugins/cors"',
    'import authPlugin from "./plugins/auth"',
  ]
  const pluginRegistrations: string[] = [
    "await fastify.register(corsPlugin)",
    "await fastify.register(dbPlugin)",
    "await fastify.register(authPlugin)",
  ]
  const routeImports: string[] = ['import itemRoutes from "./routes/items"']
  const routeRegistrations: string[] = [
    'await fastify.register(itemRoutes, { prefix: "/api/items" })',
  ]

  if (config.services.includes("payments") && config.paymentsProvider === "stripe") {
    imports.push('import stripePlugin from "./plugins/stripe"')
    pluginRegistrations.push("await fastify.register(stripePlugin)")
    routeImports.push('import paymentRoutes from "./routes/payments"')
    routeRegistrations.push('await fastify.register(paymentRoutes, { prefix: "/api/payments" })')
  }
  if (config.services.includes("email")) {
    imports.push('import emailPlugin from "./plugins/email"')
    pluginRegistrations.push("await fastify.register(emailPlugin)")
  }
  if (config.services.includes("storage")) {
    imports.push('import storagePlugin from "./plugins/storage"')
    pluginRegistrations.push("await fastify.register(storagePlugin)")
  }
  if (config.services.includes("ai")) {
    imports.push('import aiPlugin from "./plugins/ai"')
    pluginRegistrations.push("await fastify.register(aiPlugin)")
    routeImports.push('import aiRoutes from "./routes/ai"')
    routeRegistrations.push('await fastify.register(aiRoutes, { prefix: "/api/ai" })')
  }
  if (config.services.includes("cron")) {
    imports.push('import cronPlugin from "./plugins/cron"')
    pluginRegistrations.push("await fastify.register(cronPlugin)")
  }
  if (config.services.includes("rateLimit")) {
    imports.push('import rateLimitPlugin from "./plugins/rateLimit"')
    pluginRegistrations.push("await fastify.register(rateLimitPlugin)")
  }

  const content = `${imports.join("\n")}
${routeImports.join("\n")}

const fastify = Fastify({ logger: true })

// Plugins
${pluginRegistrations.join("\n")}

// Routes (Better Auth handles /api/auth/* via auth plugin)
${routeRegistrations.join("\n")}

// Health check
fastify.get("/api/health", async () => ({ status: "ok" }))

// Start
const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: "0.0.0.0" })
console.log(\`Server running on http://localhost:\${port}\`)
`

  fs.writeFileSync(path.join(apiSrc, "index.ts"), content)
}

function generateSharedSchemas(dir: string, config: ProjectConfig) {
  const sharedSrc = path.join(dir, "packages/shared/src")

  // auth schemas
  fs.writeFileSync(
    path.join(sharedSrc, "schemas/auth.ts"),
    `import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
`,
  )

  // items schemas
  fs.writeFileSync(
    path.join(sharedSrc, "schemas/items.ts"),
    `import { z } from "zod"

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "archived"]).optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
`,
  )

  // constants
  fs.writeFileSync(
    path.join(sharedSrc, "constants/roles.ts"),
    `export const ROLES = ["user", "admin"] as const
export type Role = (typeof ROLES)[number]
`,
  )

  // index.ts
  const exports = [
    'export * from "./schemas/auth"',
    'export * from "./schemas/items"',
    'export * from "./constants/roles"',
  ]
  fs.writeFileSync(path.join(sharedSrc, "index.ts"), exports.join("\n") + "\n")
}
