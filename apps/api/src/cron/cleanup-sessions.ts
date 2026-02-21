import { FastifyInstance } from "fastify"
import { lt } from "drizzle-orm"
import { sessions } from "@shipfast/db"

export function registerCleanupSessionsCron(fastify: FastifyInstance) {
  // Run every day at 3am — clean up expired sessions
  fastify.cron.schedule("0 3 * * *", async () => {
    const result = await fastify.db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()))
      .returning()

    if (result.length > 0) {
      fastify.log.info(`Cleaned up ${result.length} expired sessions`)
    }
  })
}
