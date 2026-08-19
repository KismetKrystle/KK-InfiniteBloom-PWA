import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getStripe } from '@/lib/stripe'

// Only one active book/tenant today — same convention as the flipbook route.
const BOOK_SLUG = 'kismet-krystle'

// Only types actually sold on-site via Stripe. Physical books are sold on
// Amazon and never reach this route.
const VALID_PRODUCT_TYPES = ['flipbook']

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const productType = body?.productType
  if (!productType || !VALID_PRODUCT_TYPES.includes(productType)) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
  }

  const rows = await sql`
    SELECT p.id, p.tenant_id, p.stripe_price_id
    FROM products p
    JOIN tenants t ON p.tenant_id = t.id
    WHERE t.slug = ${BOOK_SLUG}
      AND p.type = ${productType}
      AND p.is_active = true
    ORDER BY p.order_index
    LIMIT 1
  `
  const product = rows[0] as { id: string; tenant_id: string; stripe_price_id: string | null } | undefined

  if (!product || !product.stripe_price_id) {
    return NextResponse.json({ error: 'Product is not available for purchase yet' }, { status: 400 })
  }

  const origin = request.nextUrl.origin

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/flipbook?purchase=success`,
    cancel_url: `${origin}/?pricing=open`,
    customer_email: session.user.email,
    client_reference_id: session.user.id,
    metadata: {
      authUserId: session.user.id,
      productId: product.id,
      tenantId: product.tenant_id,
    },
  })

  if (!checkoutSession.url) {
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 })
  }

  return NextResponse.json({ url: checkoutSession.url })
}
