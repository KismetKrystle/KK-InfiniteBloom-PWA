import { readFileSync } from 'fs'
import { Client } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const file = process.argv[2]
if (!file) throw new Error('Usage: tsx scripts/run-sql.ts <path-to-sql-file>')
if (!process.env.DATABASE_URL) throw new Error('Missing env var: DATABASE_URL')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const sql = readFileSync(file, 'utf-8')
    await client.query(sql)
    console.log(`Applied ${file}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
