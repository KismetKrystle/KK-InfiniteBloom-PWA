import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { lookup } from 'mime-types'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const REQUIRED = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
for (const key of REQUIRED) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const BOOK_DIR = join(process.cwd(), 'public', 'book')
const R2_PREFIX = 'book'
const CONCURRENCY = 10

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

async function main() {
  const files = walk(BOOK_DIR)
  console.log(`Uploading ${files.length} files → "${BUCKET}/${R2_PREFIX}/" (${CONCURRENCY} workers)`)

  let uploaded = 0
  let failed = 0
  const queue = [...files]

  async function worker() {
    while (queue.length > 0) {
      const file = queue.shift()!
      const key = `${R2_PREFIX}/${relative(BOOK_DIR, file).replace(/\\/g, '/')}`
      const contentType = lookup(file) || 'application/octet-stream'
      // pageConfig files are immutable per build; everything else cached for a day
      const cacheControl = key.includes('/pageConfig/')
        ? 'public, max-age=31536000'
        : 'public, max-age=86400'

      try {
        await client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: readFileSync(file),
            ContentType: contentType,
            CacheControl: cacheControl,
          })
        )
        uploaded++
        if (uploaded <= 5 || uploaded % 100 === 0 || queue.length === 0) {
          console.log(`[${uploaded}/${files.length}] ${key}`)
        }
      } catch (err) {
        console.error(`FAILED: ${key}`, err)
        failed++
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  console.log(`\nDone: ${uploaded} uploaded, ${failed} failed`)
  if (process.env.R2_PUBLIC_URL) {
    console.log(`\nAdd to .env.local:`)
    console.log(`NEXT_PUBLIC_BOOK_URL=${process.env.R2_PUBLIC_URL}/${R2_PREFIX}/index.html`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
