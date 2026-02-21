import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions } from "@shipfast/db"

export default async function revenuecatWebhookRoutes(fastify: FastifyInstance) {
  fastify.post("/revenuecat", async (request, reply) => {
    const { event } = request.body as { event: any }

    if (!event) {
      return reply.code(400).send({ error: "Missing event" })
    }

    const appUserId = event.app_user_id
    const eventType = event.type

    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL": {
        await fastify.db
          .insert(subscriptions)
          .values({
            userId: appUserId,
            stripeCustomerId: event.subscriber_id ?? appUserId,
            stripeSubscriptionId: event.transaction_id,
            stripePriceId: event.product_id,
            status: "active",
            currentPeriodEnd: event.expiration_at ? new Date(event.expiration_at) : null,
          })
          .onConflictDoUpdate({
            target: subscriptions.stripeSubscriptionId,
            set: {
              status: "active",
              currentPeriodEnd: event.expiration_at ? new Date(event.expiration_at) : null,
              updatedAt: new Date(),
            },
          })
        break
      }

      case "CANCELLATION":
      case "EXPIRATION": {
        if (event.transaction_id) {
          await fastify.db
            .update(subscriptions)
            .set({ status: "canceled", updatedAt: new Date() })
            .where(eq(subscriptions.stripeSubscriptionId, event.transaction_id))
        }
        break
      }
    }

    return { received: true }
  })
}
