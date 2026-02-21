import { FastifyInstance } from "fastify"
import { z } from "zod"

const completeSchema = z.object({
  prompt: z.string().min(1).max(10000),
  model: z.string().optional(),
})

const imageSchema = z.object({
  prompt: z.string().min(1).max(2000),
})

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Text completion
  fastify.post("/complete", async (request) => {
    const { prompt, model } = completeSchema.parse(request.body)
    const result = await fastify.ai.complete(prompt, { model })
    return { result }
  })

  // Image generation
  fastify.post("/image", async (request) => {
    const { prompt } = imageSchema.parse(request.body)
    const url = await fastify.ai.generateImage(prompt)
    return { url }
  })
}
