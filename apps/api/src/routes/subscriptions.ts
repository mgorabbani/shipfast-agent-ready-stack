import { FastifyInstance } from "fastify"

export default async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Get user entitlements from RevenueCat
  fastify.get("/entitlements", async (request, reply) => {
    try {
      const data = await fastify.revenuecat.getSubscriber(request.user!.id)
      const entitlements = data.subscriber?.entitlements ?? {}

      return {
        entitlements: Object.entries(entitlements).map(([key, value]: [string, any]) => ({
          id: key,
          isActive: value.expires_date ? new Date(value.expires_date) > new Date() : false,
          expiresAt: value.expires_date,
          productId: value.product_identifier,
        })),
      }
    } catch (err: any) {
      return reply.code(502).send({ error: "Failed to fetch entitlements" })
    }
  })

  // Check if user has specific entitlement
  fastify.get("/entitlements/:entitlementId", async (request, reply) => {
    const { entitlementId } = request.params as { entitlementId: string }

    try {
      const data = await fastify.revenuecat.getSubscriber(request.user!.id)
      const entitlement = data.subscriber?.entitlements?.[entitlementId]

      if (!entitlement) {
        return { hasAccess: false }
      }

      const isActive = entitlement.expires_date
        ? new Date(entitlement.expires_date) > new Date()
        : false

      return {
        hasAccess: isActive,
        expiresAt: entitlement.expires_date,
        productId: entitlement.product_identifier,
      }
    } catch (err: any) {
      return reply.code(502).send({ error: "Failed to check entitlement" })
    }
  })
}
