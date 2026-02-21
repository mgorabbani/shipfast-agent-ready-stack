import { FastifyInstance } from "fastify"
import { eq, and } from "drizzle-orm"
import { items } from "@shipfast/db"
import { createItemSchema, updateItemSchema } from "@shipfast/shared"

export default async function itemRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // List user's items
  fastify.get("/", async (request) => {
    return fastify.db
      .select()
      .from(items)
      .where(eq(items.userId, request.user!.id))
  })

  // Create item
  fastify.post("/", async (request) => {
    const body = createItemSchema.parse(request.body)

    const [item] = await fastify.db
      .insert(items)
      .values({ ...body, userId: request.user!.id })
      .returning()

    return item
  })

  // Update item
  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = updateItemSchema.parse(request.body)

    const [item] = await fastify.db
      .update(items)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, request.user!.id)))
      .returning()

    if (!item) {
      return reply.code(404).send({ error: "Item not found" })
    }

    return item
  })

  // Delete item
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const [item] = await fastify.db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, request.user!.id)))
      .returning()

    if (!item) {
      return reply.code(404).send({ error: "Item not found" })
    }

    return { success: true }
  })
}
