import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const devices = await sql`
    SELECT id, device_label, last_seen
    FROM user_devices
    WHERE user_id = (
      SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
    )
    ORDER BY last_seen DESC
  `

  return NextResponse.json(devices)
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.all === true) {
    await sql`
      DELETE FROM user_devices
      WHERE user_id = (
        SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
      )
    `
    return NextResponse.json({ ok: true })
  }

  if (body.deviceId) {
    await sql`
      DELETE FROM user_devices
      WHERE id = ${body.deviceId}
      AND user_id = (
        SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
      )
    `
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
