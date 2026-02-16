import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import fjwt from "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; role: string }
    user: { userId: string; role: string }
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export default async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fjwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: "15m" },
  })

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      return reply.code(401).send({ error: "Unauthorized" })
    }
  })

  fastify.decorate("requireRole", function (role: string) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      await fastify.authenticate(request, reply)
      if (request.user.role !== role && request.user.role !== "admin") {
        return reply.code(403).send({ error: "Forbidden" })
      }
    }
  })
}
