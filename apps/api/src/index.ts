import "dotenv/config"
import Fastify from "fastify"
import dbPlugin from "./plugins/db"
import corsPlugin from "./plugins/cors"
import authPlugin from "./plugins/auth"
import stripePlugin from "./plugins/stripe"
import revenuecatPlugin from "./plugins/revenuecat"
import emailPlugin from "./plugins/email"
import storagePlugin from "./plugins/storage"
import profileRoutes from "./routes/profile"
import itemRoutes from "./routes/items"
import paymentRoutes from "./routes/payments"
import subscriptionRoutes from "./routes/subscriptions"
import stripeWebhookRoutes from "./routes/webhooks/stripe"
import revenuecatWebhookRoutes from "./routes/webhooks/revenuecat"
import uploadRoutes from "./routes/upload"

const fastify = Fastify({ logger: true })

// Plugins
await fastify.register(corsPlugin)
await fastify.register(dbPlugin)
await fastify.register(authPlugin)
await fastify.register(stripePlugin)
await fastify.register(revenuecatPlugin)
await fastify.register(emailPlugin)
await fastify.register(storagePlugin)

// Routes (Better Auth routes handled by auth plugin at /api/auth/*)
await fastify.register(profileRoutes, { prefix: "/api/profile" })
await fastify.register(itemRoutes, { prefix: "/api/items" })
await fastify.register(paymentRoutes, { prefix: "/api/payments" })
await fastify.register(subscriptionRoutes, { prefix: "/api/subscriptions" })
await fastify.register(stripeWebhookRoutes, { prefix: "/api/webhooks" })
await fastify.register(revenuecatWebhookRoutes, { prefix: "/api/webhooks" })
await fastify.register(uploadRoutes, { prefix: "/api/files" })

// Health check
fastify.get("/api/health", async () => ({ status: "ok" }))

// Start
const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: "0.0.0.0" })
console.log(`Server running on http://localhost:${port}`)
