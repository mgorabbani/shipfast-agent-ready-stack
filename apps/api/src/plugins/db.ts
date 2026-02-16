import { FastifyInstance } from "fastify"
import { createDb, type Database } from "@shipfast/db"

declare module "fastify" {
  interface FastifyInstance {
    db: Database
  }
}

export default async function dbPlugin(fastify: FastifyInstance) {
  const db = createDb(process.env.DATABASE_URL!)
  fastify.decorate("db", db)
}
