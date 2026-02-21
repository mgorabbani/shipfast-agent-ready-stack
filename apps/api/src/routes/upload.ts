import { FastifyInstance } from "fastify"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { files } from "@shipfast/db"
import { createPresignedUploadUrl, createPresignedDownloadUrl, deleteFile } from "../services/storage.js"

const requestUploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  folder: z.string().optional(),
})

export default async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate)

  // Request presigned upload URL
  fastify.post("/presign", async (request) => {
    const body = requestUploadSchema.parse(request.body)

    const { uploadUrl, key } = await createPresignedUploadUrl(fastify.s3, {
      contentType: body.contentType,
      folder: body.folder,
    })

    // Store file metadata
    const [file] = await fastify.db
      .insert(files)
      .values({
        userId: request.user!.id,
        key,
        filename: body.filename,
        contentType: body.contentType,
      })
      .returning()

    return { uploadUrl, fileId: file.id, key }
  })

  // Get download URL
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const [file] = await fastify.db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, request.user!.id)))
      .limit(1)

    if (!file) return reply.code(404).send({ error: "File not found" })

    const downloadUrl = await createPresignedDownloadUrl(fastify.s3, file.key)
    return { ...file, downloadUrl }
  })

  // List user files
  fastify.get("/", async (request) => {
    return fastify.db
      .select()
      .from(files)
      .where(eq(files.userId, request.user!.id))
  })

  // Delete file
  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string }

    const [file] = await fastify.db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, request.user!.id)))
      .limit(1)

    if (!file) return reply.code(404).send({ error: "File not found" })

    await deleteFile(fastify.s3, file.key)
    await fastify.db.delete(files).where(eq(files.id, id))

    return { success: true }
  })
}
