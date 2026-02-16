import "dotenv/config"
import Fastify from "fastify"
import dbPlugin from "./plugins/db"
import corsPlugin from "./plugins/cors"
import authPlugin from "./plugins/auth"
import authRoutes from "./routes/auth"
import profileRoutes from "./routes/profile"
import itemRoutes from "./routes/items"

const fastify = Fastify({ logger: true })

// Plugins
await fastify.register(corsPlugin)
await fastify.register(dbPlugin)
await fastify.register(authPlugin)

// Routes
await fastify.register(authRoutes, { prefix: "/api/auth" })
await fastify.register(profileRoutes, { prefix: "/api/profile" })
await fastify.register(itemRoutes, { prefix: "/api/items" })

// Health check
fastify.get("/api/health", async () => ({ status: "ok" }))

// Start
const port = Number(process.env.PORT) || 3000
await fastify.listen({ port, host: "0.0.0.0" })
console.log(`Server running on http://localhost:${port}`)
