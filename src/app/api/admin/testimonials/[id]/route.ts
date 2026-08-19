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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (typeof body?.isApproved !== 'boolean') {
    return NextResponse.json({ error: 'isApproved must be a boolean' }, { status: 400 })
  }

  const rows = await sql`
    UPDATE testimonials
    SET is_approved = ${body.isApproved}
    WHERE id = ${id}
    RETURNING id
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const rows = await sql`DELETE FROM testimonials WHERE id = ${id} RETURNING id`
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
