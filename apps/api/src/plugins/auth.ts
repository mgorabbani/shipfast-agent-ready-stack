import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { auth } from "../lib/auth.js"

declare module "fastify" {
  interface FastifyRequest {
    user: { id: string; email: string; role: string } | null
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  // Convert Fastify req/res to Fetch API for Better Auth
  fastify.all("/api/auth/*", async (request, reply) => {
    const url = new URL(request.url, `http://${request.headers.host}`)
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value)
    }

    const fetchRequest = new Request(url, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? JSON.stringify(request.body)
        : undefined,
    })

    const response = await auth.handler(fetchRequest)

    reply.status(response.status)
    response.headers.forEach((value, key) => reply.header(key, value))
    const body = await response.text()
    return reply.send(body)
  })

  // Decorator to get session from request
  fastify.decorateRequest("user", null)

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    const session = await auth.api.getSession({
      headers: request.headers as any,
    })

    if (!session) {
      return reply.code(401).send({ error: "Unauthorized" })
    }

    request.user = {
      id: session.user.id,
      email: session.user.email,
      role: (session.user as any).role ?? "user",
    }
  })
}
