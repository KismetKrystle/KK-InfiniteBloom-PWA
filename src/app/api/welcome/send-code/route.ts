import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { grantAccessFromCheckout } from '@/lib/book-purchase'

// Emails the buyer's sign-in code to the address Stripe collected — never a
// client-supplied one, so a checkout id can only ever reach its own buyer.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const checkoutSessionId = typeof body?.checkoutSessionId === 'string' ? body.checkoutSessionId : ''
  if (!checkoutSessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'Invalid checkout' }, { status: 400 })
  }

  const grant = await grantAccessFromCheckout(checkoutSessionId).catch(() => null)
  if (!grant) return NextResponse.json({ error: 'Checkout not confirmed' }, { status: 404 })

  await auth.api.sendVerificationOTP({ body: { email: grant.email, type: 'sign-in' } })

  return NextResponse.json({ ok: true })
}
