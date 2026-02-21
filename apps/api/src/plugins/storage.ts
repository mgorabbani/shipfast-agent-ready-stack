import { FastifyInstance } from "fastify"
import { S3Client } from "@aws-sdk/client-s3"

declare module "fastify" {
  interface FastifyInstance {
    s3: S3Client
  }
}

export default async function storagePlugin(fastify: FastifyInstance) {
  const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })
  fastify.decorate("s3", s3)
}
