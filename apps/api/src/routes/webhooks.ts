import { FastifyInstance } from "fastify"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import crypto from "crypto"
import { webhookEndpoints } from "@shipfast/db"

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string().min(1)).min(1),
})

export default async function webhookRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // List webhook endpoints
  fastify.get("/", async (request) => {
    return fastify.db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.userId, request.user!.id))
  })

  // Create webhook endpoint
  fastify.post("/", async (request) => {
    const body = createWebhookSchema.parse(request.body)
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`

    const [endpoint] = await fastify.db
      .insert(webhookEndpoints)
      .values({
        userId: request.user!.id,
        url: body.url,
        events: body.events,
        secret,
      })
      .returning()

    return endpoint
  })

  // Delete webhook endpoint
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const [endpoint] = await fastify.db
      .delete(webhookEndpoints)
      .where(and(eq(webhookEndpoints.id, id), eq(webhookEndpoints.userId, request.user!.id)))
      .returning()

    if (!endpoint) return reply.code(404).send({ error: "Webhook not found" })
    return { success: true }
  })
}
