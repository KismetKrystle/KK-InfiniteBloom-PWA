import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const rows = await sql`SELECT role FROM user_profiles WHERE auth_user_id = ${session.user.id}`
  if (rows[0]?.role !== 'admin') return null

  return session
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const note = typeof body?.note === 'string' && body.note.trim() ? body.note.trim() : null
  const expiresAt = typeof body?.expiresAt === 'string' && body.expiresAt ? body.expiresAt : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO access_grants (email, note, granted_by, expires_at)
    VALUES (${email}, ${note}, ${session.user.email}, ${expiresAt})
    RETURNING id, email, note, granted_by, expires_at, revoked_at, created_at
  `

  return NextResponse.json({ grant: rows[0] })
}
