// Public links that client components need too (book-purchase.ts is
// server-only because it talks to Stripe and the database).

// Shown on the reader's buy buttons. Stripe shows each visitor the real
// amount in their own currency at checkout; update this if the USD price
// changes.
export const BOOK_PRICE_LABEL = "$20"

// The "Buy Digital Book" Stripe Payment Link.
export const BOOK_PAYMENT_LINK = "https://buy.stripe.com/14AeVe19WcfZ16pg0v8N202"

export const MAIN_SITE_URL = "https://www.kismetkrystle.com"

export const BOOK_LOGO_URL =
  "https://res.cloudinary.com/dsoojlgg1/image/upload/v1779143359/infinite_bloom_logo_ncxs5k.png"
