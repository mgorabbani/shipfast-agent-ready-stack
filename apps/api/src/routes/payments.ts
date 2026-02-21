import { FastifyInstance } from "fastify"
import { eq } from "drizzle-orm"
import { subscriptions } from "@shipfast/db"
import { createCheckoutSchema } from "@shipfast/shared"

export default async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Create checkout session
  fastify.post("/checkout", async (request, reply) => {
    const body = createCheckoutSchema.parse(request.body)

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

  // Get current subscription
  fastify.get("/subscription", async (request) => {
    const [sub] = await fastify.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, request.user!.id))
      .limit(1)

    return sub ?? null
  })

  // Customer portal
  fastify.post("/portal", async (request, reply) => {
    const [sub] = await fastify.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, request.user!.id))
      .limit(1)

    if (!sub) return reply.code(404).send({ error: "No subscription found" })

    const session = await fastify.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard`,
    })

    return { url: session.url }
  })
}
