import Stripe from 'stripe'

let client: Stripe | null = null

// Lazy — reading the env var (and constructing the client) only when a
// Stripe route actually runs, not at module load. Next.js imports every
// route module during the build's page-data collection step, so throwing
// at the top of this file would fail the entire build whenever the key is
// missing, not just requests that need Stripe.
export function getStripe(): Stripe {
  if (client) return client

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('Missing env var: STRIPE_SECRET_KEY')

  client = new Stripe(secretKey)
  return client
}
