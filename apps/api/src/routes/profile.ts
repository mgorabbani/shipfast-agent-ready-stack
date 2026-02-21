import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { users } from "@shipfast/db"
import { profileUpdateSchema } from "@shipfast/shared"

export default async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Get current user profile
  fastify.get("/", async (request) => {
    const [user] = await fastify.db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, request.user!.id))
      .limit(1)

    return user
  })

  // Update profile
  fastify.put("/", async (request, reply) => {
    const body = profileUpdateSchema.parse(request.body)

    const [updated] = await fastify.db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, request.user!.id))
      .returning()

    return { id: updated.id, email: updated.email, username: updated.username, firstName: updated.firstName, lastName: updated.lastName }
  })
}
