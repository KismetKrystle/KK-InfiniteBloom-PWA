import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

function webhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing env var: STRIPE_WEBHOOK_SECRET')
  return secret
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret())
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency — Stripe retries webhooks that don't 200 in time, and can
  // occasionally send the same event twice regardless.
  const inserted = await sql`
    INSERT INTO stripe_webhook_events (stripe_event_id, event_type)
    VALUES (${event.id}, ${event.type})
    ON CONFLICT (stripe_event_id) DO NOTHING
    RETURNING id
  `
  if (inserted.length === 0) {
    return NextResponse.json({ ok: true, deduped: true })
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session

    const authUserId = checkoutSession.metadata?.authUserId
    const productId = checkoutSession.metadata?.productId
    const tenantId = checkoutSession.metadata?.tenantId

    if (!authUserId || !productId || !tenantId) {
      console.error('[Stripe webhook] checkout.session.completed missing metadata', checkoutSession.id)
      return NextResponse.json({ ok: true, skipped: true })
    }

    const paymentIntentId =
      typeof checkoutSession.payment_intent === 'string'
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id ?? null

    const customerId =
      typeof checkoutSession.customer === 'string' ? checkoutSession.customer : checkoutSession.customer?.id ?? null

    await sql`
      INSERT INTO purchases (
        tenant_id, user_id, product_id, stripe_payment_intent_id,
        stripe_customer_id, amount_cents, currency, status, access_granted
      )
      SELECT
        ${tenantId},
        (SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId}),
        ${productId},
        ${paymentIntentId},
        ${customerId},
        ${checkoutSession.amount_total ?? 0},
        ${checkoutSession.currency ?? 'usd'},
        'completed',
        true
      WHERE EXISTS (SELECT 1 FROM user_profiles WHERE auth_user_id = ${authUserId})
      ON CONFLICT (stripe_payment_intent_id) DO NOTHING
    `
  }

  return NextResponse.json({ ok: true })
}
