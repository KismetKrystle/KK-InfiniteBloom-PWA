import { sql } from "@/lib/db"
import { getStripe } from "@/lib/stripe"

// The "Buy Digital Book" Stripe Payment Link used on kismetkrystle.com.
export const BOOK_PAYMENT_LINK = "https://buy.stripe.com/14AeVe19WcfZ16pg0v8N202"

const PAID_STATUSES = new Set(["paid", "no_payment_required"])

// Payment Link checkouts carry no account metadata, so the buyer is
// identified by the email Stripe collected and the book by the price on
// the line items — sessions from any other link (e.g. the in-person sale)
// match no flipbook price and grant nothing. Called by both the webhook and
// the /welcome page, whichever runs first; the unique index on
// stripe_checkout_session_id keeps it to one grant per purchase.
export async function grantAccessFromCheckout(checkoutSessionId: string): Promise<{ email: string } | null> {
  const session = await getStripe().checkout.sessions.retrieve(checkoutSessionId, { expand: ["line_items"] })
  if (!PAID_STATUSES.has(session.payment_status)) return null

  const email = session.customer_details?.email?.trim().toLowerCase()
  if (!email) return null

  const priceIds = (session.line_items?.data ?? [])
    .map((item) => item.price?.id)
    .filter((id): id is string => Boolean(id))

  const products = await sql`
    SELECT 1 FROM products
    WHERE type = 'flipbook'
      AND is_active = true
      AND stripe_price_id = ANY(${priceIds})
    LIMIT 1
  `
  if (products.length === 0) {
    console.warn(`[book-purchase] ${session.id} is paid but matches no flipbook price`, priceIds)
    return null
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null

  await sql`
    INSERT INTO access_grants (email, note, granted_by, stripe_checkout_session_id, stripe_payment_intent_id)
    VALUES (${email}, 'Stripe purchase', 'stripe', ${session.id}, ${paymentIntentId})
    ON CONFLICT (stripe_checkout_session_id) DO NOTHING
  `

  return { email }
}
