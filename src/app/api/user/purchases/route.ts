import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const purchases = await sql`
    SELECT p.name AS product_name, p.type AS product_type, pu.created_at
    FROM purchases pu
    JOIN products p ON pu.product_id = p.id
    WHERE pu.user_id = (
      SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
    )
    AND pu.status = 'completed'
    AND pu.access_granted = true
    ORDER BY pu.created_at DESC
  `

  const deviceCountResult = await sql`
    SELECT COUNT(*) AS count
    FROM user_devices
    WHERE user_id = (
      SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
    )
  `

  return NextResponse.json({
    purchases,
    deviceCount: Number(deviceCountResult[0]?.count ?? 0),
  })
}
