import { FastifyInstance } from "fastify"
import type { AiService } from "../services/ai.js"
import { createOpenAiService, createFalAiService } from "../services/ai.js"

declare module "fastify" {
  interface FastifyInstance {
    ai: AiService
  }
}

export default async function aiPlugin(fastify: FastifyInstance) {
  let service: AiService

  if (process.env.OPENAI_API_KEY) {
    service = createOpenAiService()
  } else if (process.env.FAL_KEY) {
    service = createFalAiService()
  } else {
    // Fallback stub if no AI provider configured
    service = {
      async complete() { return "AI not configured" },
      async generateImage() { return "" },
    }
  }

  fastify.decorate("ai", service)
}
