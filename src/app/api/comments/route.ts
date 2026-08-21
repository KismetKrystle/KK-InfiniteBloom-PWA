import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

// Only one active book/tenant today — same convention as the flipbook route.
const BOOK_SLUG = 'kismet-krystle'

const VALID_CONTEXTS = ['audio', 'flipbook']

// Comments are viewable by anyone; only posting (below) requires a session.
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })

  const context = request.nextUrl.searchParams.get('context')
  if (!context || !VALID_CONTEXTS.includes(context)) {
    return NextResponse.json({ error: 'Invalid context' }, { status: 400 })
  }

  const viewerId = session?.user.id ?? null

  const comments = await sql`
    SELECT
      c.id, c.content, c.created_at, c.updated_at,
      COALESCE(up.display_name, u.name, up.email) AS author_name,
      u.image AS author_image,
      (SELECT COUNT(*) FROM comment_likes l WHERE l.comment_id = c.id) AS like_count,
      COALESCE(EXISTS (
        SELECT 1 FROM comment_likes l2
        WHERE l2.comment_id = c.id
        AND l2.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${viewerId})
      ), false) AS liked_by_me,
      COALESCE(c.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${viewerId}), false) AS is_mine
    FROM comments c
    LEFT JOIN user_profiles up ON up.id = c.user_id
    LEFT JOIN "user" u ON u.id = up.auth_user_id
    WHERE c.context = ${context}
    ORDER BY c.created_at DESC
  `

  return NextResponse.json({ comments })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const content = body?.content?.trim()
  const context = body?.context
  if (!context || !VALID_CONTEXTS.includes(context)) {
    return NextResponse.json({ error: 'Invalid context' }, { status: 400 })
  }
  if (!content) return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })

  const rows = await sql`
    WITH inserted AS (
      INSERT INTO comments (tenant_id, user_id, context, content)
      SELECT t.id, (SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}), ${context}, ${content}
      FROM tenants t
      WHERE t.slug = ${BOOK_SLUG}
      RETURNING id, content, created_at, updated_at, user_id
    )
    SELECT
      i.id, i.content, i.created_at, i.updated_at,
      COALESCE(up.display_name, u.name, up.email) AS author_name,
      u.image AS author_image,
      0::int AS like_count,
      false AS liked_by_me,
      true AS is_mine
    FROM inserted i
    LEFT JOIN user_profiles up ON up.id = i.user_id
    LEFT JOIN "user" u ON u.id = up.auth_user_id
  `

  return NextResponse.json({ comment: rows[0] })
}
