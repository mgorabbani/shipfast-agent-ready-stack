import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions } from "@shipfast/db"

export default async function stripeWebhookRoutes(fastify: FastifyInstance) {
  // Raw body needed for Stripe signature verification
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_req, body, done) => done(null, body),
  )

  fastify.post("/stripe", async (request, reply) => {
    const sig = request.headers["stripe-signature"] as string
    let event

    try {
      event = fastify.stripe.webhooks.constructEvent(
        request.body as Buffer,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      )
    } catch (err: any) {
      return reply.code(400).send({ error: `Webhook Error: ${err.message}` })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        if (session.mode === "subscription" && session.subscription) {
          const sub = await fastify.stripe.subscriptions.retrieve(session.subscription as string)
          await fastify.db.insert(subscriptions).values({
            userId: session.metadata!.userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id,
            status: "active",
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object
        await fastify.db
          .update(subscriptions)
          .set({
            status: sub.status as any,
            stripePriceId: sub.items.data[0]?.price.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object
        await fastify.db
          .update(subscriptions)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        break
      }
    }

    return { received: true }
  })
}
