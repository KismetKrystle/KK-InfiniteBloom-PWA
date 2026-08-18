import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await sql`
    SELECT display_name, email, phone, marketing_consent
    FROM user_profiles
    WHERE auth_user_id = ${session.user.id}
  `

  const profile = rows[0]
  return NextResponse.json({
    name: profile?.display_name ?? session.user.name ?? null,
    email: profile?.email ?? session.user.email,
    phone: profile?.phone ?? null,
    marketingConsent: profile?.marketing_consent ?? false,
  })
}

// Upserts — used both right after sign-up (capturing phone/consent the
// Google path skips) and from the account settings dialog.
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const phone = body?.phone?.trim() || null
  const marketingConsent = Boolean(body?.marketingConsent)

  await sql`
    INSERT INTO user_profiles (auth_user_id, email, display_name, phone, marketing_consent)
    VALUES (${session.user.id}, ${session.user.email}, ${session.user.name ?? null}, ${phone}, ${marketingConsent})
    ON CONFLICT (auth_user_id) DO UPDATE
    SET phone = EXCLUDED.phone,
        marketing_consent = EXCLUDED.marketing_consent
  `

  return NextResponse.json({ ok: true })
}
