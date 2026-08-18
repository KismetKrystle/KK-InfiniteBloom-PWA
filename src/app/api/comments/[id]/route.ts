import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const content = body?.content?.trim()
  if (!content) return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
  if (content.length > 2000) return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })

  const rows = await sql`
    UPDATE comments
    SET content = ${content}
    WHERE id = ${id}
    AND user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id})
    RETURNING id, content, created_at, updated_at
  `

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ comment: rows[0] })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const rows = await sql`
    DELETE FROM comments
    WHERE id = ${id}
    AND user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id})
    RETURNING id
  `

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
