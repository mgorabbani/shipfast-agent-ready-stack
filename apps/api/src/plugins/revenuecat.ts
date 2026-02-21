import { FastifyInstance } from "fastify"

interface RevenueCatClient {
  baseUrl: string
  apiKey: string
  getSubscriber(appUserId: string): Promise<any>
}

declare module "fastify" {
  interface FastifyInstance {
    revenuecat: RevenueCatClient
  }
}

export default async function revenuecatPlugin(fastify: FastifyInstance) {
  const apiKey = process.env.REVENUECAT_SECRET_KEY!
  const baseUrl = "https://api.revenuecat.com/v1"

  const client: RevenueCatClient = {
    baseUrl,
    apiKey,
    async getSubscriber(appUserId: string) {
      const res = await fetch(`${baseUrl}/subscribers/${appUserId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })
      if (!res.ok) throw new Error(`RevenueCat API error: ${res.status}`)
      return res.json()
    },
  }

  fastify.decorate("revenuecat", client)
}
