import { sql } from "@/lib/db"
import { getStripe } from "@/lib/stripe"
import { sendEmail } from "@/lib/email"

const PAID_STATUSES = new Set(["paid", "no_payment_required"])

// products.stripe_price_id names one known price of the digital book. Any
// price on the same Stripe *product* counts — new amounts, currencies or
// sale prices then unlock the book without touching the database. The
// product id behind each known price never changes, so it's cached for the
// life of a warm instance.
const productIdForPrice = new Map<string, string>()

async function flipbookStripeIds(): Promise<{ priceIds: Set<string>; productIds: Set<string> }> {
  const rows = (await sql`
    SELECT stripe_price_id FROM products
    WHERE type = 'flipbook' AND is_active = true AND stripe_price_id IS NOT NULL
  `) as { stripe_price_id: string }[]

  const priceIds = new Set(rows.map((row) => row.stripe_price_id))
  const productIds = new Set<string>()
  for (const priceId of priceIds) {
    let productId = productIdForPrice.get(priceId)
    if (!productId) {
      const price = await getStripe().prices.retrieve(priceId)
      productId = typeof price.product === "string" ? price.product : price.product.id
      productIdForPrice.set(priceId, productId)
    }
    productIds.add(productId)
  }
  return { priceIds, productIds }
}

async function sendReadyEmail(email: string) {
  await sendEmail({
    to: email,
    subject: "Your copy of The Infinite Bloom is ready",
    text:
      "Thank you for getting the digital edition of The Infinite Bloom.\n\n" +
      "To open it, go to https://read.kismetkrystle.com, tap Sign in and enter this email address. " +
      "We'll send you a 6-digit code, and the whole book opens, with Kismet reading every poem aloud.\n\n" +
      "You can sign in on up to three of your own devices. Questions? Just reply to this email.",
  })
}

// Payment Link checkouts carry no account metadata, so the buyer is
// identified by the email Stripe collected and the book by the line items:
// a checkout unlocks it only if one of its items is the digital book's
// product — on its own, or added to another order such as the in-person
// paperback. Called by both the webhook and the /welcome page, whichever
// runs first; the unique index on stripe_checkout_session_id keeps it to one
// grant per purchase. `notify` sends the "your copy is ready" email for the
// buyers who never see the welcome page (the webhook passes true; the
// welcome page doesn't, since it's already sending them a code).
export async function grantAccessFromCheckout(
  checkoutSessionId: string,
  { notify = false }: { notify?: boolean } = {}
): Promise<{ email: string } | null> {
  const session = await getStripe().checkout.sessions.retrieve(checkoutSessionId, { expand: ["line_items"] })
  if (!PAID_STATUSES.has(session.payment_status)) return null

  const email = session.customer_details?.email?.trim().toLowerCase()
  if (!email) return null

  const { priceIds, productIds } = await flipbookStripeIds()
  const items = session.line_items?.data ?? []
  const includesBook = items.some((item) => {
    const price = item.price
    if (!price) return false
    const productId = typeof price.product === "string" ? price.product : price.product?.id
    return priceIds.has(price.id) || (productId !== undefined && productIds.has(productId))
  })
  if (!includesBook) {
    // Expected for paperback-only orders from the in-person link.
    return null
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null

  const inserted = await sql`
    INSERT INTO access_grants (email, note, granted_by, stripe_checkout_session_id, stripe_payment_intent_id)
    VALUES (${email}, 'Stripe purchase', 'stripe', ${session.id}, ${paymentIntentId})
    ON CONFLICT (stripe_checkout_session_id) DO NOTHING
    RETURNING id
  `
  if (inserted.length > 0 && notify) {
    await sendReadyEmail(email).catch((err) => console.error("[book-purchase] ready email failed", err))
  }

  return { email }
}
