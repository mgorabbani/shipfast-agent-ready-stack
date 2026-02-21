import { FastifyInstance } from "fastify"
import Stripe from "stripe"

declare module "fastify" {
  interface FastifyInstance {
    stripe: Stripe
  }
}

export default async function stripePlugin(fastify: FastifyInstance) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  fastify.decorate("stripe", stripe)
}
