import { FastifyInstance } from "fastify"
import cors from "@fastify/cors"

export default async function corsPlugin(fastify: FastifyInstance) {
  await fastify.register(cors, { origin: true })
}
