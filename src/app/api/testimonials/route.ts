import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

// Only one active book/tenant today — same convention as the flipbook route.
const BOOK_SLUG = 'kismet-krystle'

// Public — feeds the "What Readers Say" section. Only approved testimonials,
// and never author_email (that's for admin follow-up only).
export async function GET() {
  const testimonials = await sql`
    SELECT t.author_name, t.author_title, t.content, t.rating
    FROM testimonials t
    JOIN tenants tn ON t.tenant_id = tn.id
    WHERE tn.slug = ${BOOK_SLUG}
      AND t.is_approved = true
    ORDER BY t.order_index, t.created_at DESC
  `
  return NextResponse.json({ testimonials })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const authorName = body?.authorName?.trim()
  const authorTitle = body?.authorTitle?.trim() || null
  const content = body?.content?.trim()
  const rating = Number(body?.rating)

  if (!authorName || !content) {
    return NextResponse.json({ error: 'Name and testimonial are required' }, { status: 400 })
  }
  if (content.length > 500) {
    return NextResponse.json({ error: 'Testimonial is too long' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  await sql`
    INSERT INTO testimonials (tenant_id, author_name, author_title, author_email, content, rating, is_approved)
    SELECT t.id, ${authorName}, ${authorTitle}, ${session.user.email}, ${content}, ${rating}, false
    FROM tenants t
    WHERE t.slug = ${BOOK_SLUG}
  `

  return NextResponse.json({ ok: true })
}
