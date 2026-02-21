import { FastifyInstance } from "fastify"
import cron from "node-cron"

declare module "fastify" {
  interface FastifyInstance {
    cron: {
      schedule: (expression: string, fn: () => void | Promise<void>) => cron.ScheduledTask
    }
  }
}

export default async function cronPlugin(fastify: FastifyInstance) {
  const jobs: cron.ScheduledTask[] = []

  fastify.decorate("cron", {
    schedule: (expression: string, fn: () => void | Promise<void>) => {
      const job = cron.schedule(expression, fn)
      jobs.push(job)
      return job
    },
  })

  fastify.addHook("onClose", () => jobs.forEach((j) => j.stop()))
}
