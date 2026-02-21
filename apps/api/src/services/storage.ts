import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

const bucket = process.env.S3_BUCKET ?? "uploads"

export async function createPresignedUploadUrl(
  s3: S3Client,
  opts: { contentType: string; folder?: string },
): Promise<{ uploadUrl: string; key: string }> {
  const ext = opts.contentType.split("/")[1] ?? "bin"
  const key = `${opts.folder ?? "uploads"}/${crypto.randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: opts.contentType,
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
  return { uploadUrl, key }
}

export async function createPresignedDownloadUrl(
  s3: S3Client,
  key: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  return getSignedUrl(s3, command, { expiresIn: 3600 })
}

export async function deleteFile(s3: S3Client, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })
  await s3.send(command)
}
