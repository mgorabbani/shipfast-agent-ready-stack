import { FastifyInstance } from "fastify"
import { Resend } from "resend"

declare module "fastify" {
  interface FastifyInstance {
    email: Resend
  }
}

export default async function emailPlugin(fastify: FastifyInstance) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  fastify.decorate("email", resend)
}
