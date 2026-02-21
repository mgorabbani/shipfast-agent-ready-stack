export interface AiService {
  complete(prompt: string, opts?: { model?: string }): Promise<string>
  generateImage(prompt: string): Promise<string> // returns URL
}

export function createOpenAiService(): AiService {
  const { default: OpenAI } = require("openai") as typeof import("openai")
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  return {
    async complete(prompt, opts) {
      const response = await client.chat.completions.create({
        model: opts?.model ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      })
      return response.choices[0]?.message?.content ?? ""
    },

    async generateImage(prompt) {
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      })
      return response.data[0]?.url ?? ""
    },
  }
}

export function createFalAiService(): AiService {
  return {
    async complete(prompt) {
      const { fal } = await import("@fal-ai/client")
      fal.config({ credentials: process.env.FAL_KEY })
      const result: any = await fal.subscribe("fal-ai/any-llm", {
        input: { prompt },
      })
      return result.data?.output ?? ""
    },

    async generateImage(prompt) {
      const { fal } = await import("@fal-ai/client")
      fal.config({ credentials: process.env.FAL_KEY })
      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: { prompt },
      })
      return result.data?.images?.[0]?.url ?? ""
    },
  }
}
