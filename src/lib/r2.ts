import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const REQUIRED = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"] as const
for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME!

// Uploads a single object and returns its public r2.dev URL. Keys should be
// unguessable (e.g. include a random id) for anything not meant to be
// discoverable — this bucket serves public reads but has no directory listing.
export async function uploadPublicObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const publicUrl = process.env.R2_PUBLIC_URL
  if (!publicUrl) throw new Error("Missing env var: R2_PUBLIC_URL")

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "private, max-age=31536000",
    })
  )

  return `${publicUrl}/${key}`
}
