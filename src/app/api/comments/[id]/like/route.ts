import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const deleted = await sql`
    DELETE FROM comment_likes
    WHERE comment_id = ${id}
    AND user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id})
    RETURNING id
  `

  let liked: boolean
  if (deleted.length > 0) {
    liked = false
  } else {
    await sql`
      INSERT INTO comment_likes (comment_id, user_id)
      SELECT ${id}, id FROM user_profiles WHERE auth_user_id = ${session.user.id}
      ON CONFLICT (comment_id, user_id) DO NOTHING
    `
    liked = true
  }

  const countRows = await sql`
    SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ${id}
  `

  return NextResponse.json({ liked, like_count: Number(countRows[0]?.count ?? 0) })
}
