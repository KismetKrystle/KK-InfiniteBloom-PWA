import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// A fresh random insight is expected on every visit, so this route must
// never be cached or statically optimized.
export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await sql`
    SELECT id, insight_number, content, source_type, source_poem_number, source_poem_title, page_number
    FROM insights
    ORDER BY RANDOM()
    LIMIT 1
  `

  if (!rows.length) {
    return NextResponse.json({ error: 'No insights found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
