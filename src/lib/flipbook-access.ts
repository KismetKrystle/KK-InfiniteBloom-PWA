import { sql } from "@/lib/db"

// Book metadata never changes without a deploy, so it's cached for the life
// of a warm serverless instance. Only positive purchase checks are cached —
// a reader who buys while the page is open must not be stuck behind a
// stale "no" — and the short TTL bounds how long a revoked grant lingers.
const BOOK_CACHE = new Map<string, { id: string; r2_prefix: string } | null>()
const PURCHASE_CACHE_TTL_MS = 60_000
const purchaseCache = new Map<string, number>()

export async function resolveBook(bookSlug: string) {
  if (BOOK_CACHE.has(bookSlug)) return BOOK_CACHE.get(bookSlug) ?? undefined

  const rows = await sql`
    SELECT p.id, p.r2_prefix
    FROM products p
    JOIN tenants t ON p.tenant_id = t.id
    WHERE t.slug = ${bookSlug}
      AND p.type = 'flipbook'
      AND p.is_active = true
    ORDER BY p.order_index
    LIMIT 1
  `
  const row = rows[0] as { id: string; r2_prefix: string | null } | undefined
  const resolved = row?.r2_prefix ? { id: row.id, r2_prefix: row.r2_prefix } : null
  BOOK_CACHE.set(bookSlug, resolved)
  return resolved ?? undefined
}

// Access grants are matched by email, so they only count once the email is
// proven — magic-link sign-in marks it verified. Without that check anyone
// could claim a buyer's grant by registering their address unverified.
export async function hasPurchased(
  user: { id: string; email: string; emailVerified: boolean } | undefined,
  bookId: string
): Promise<boolean> {
  if (!user) return false

  const cacheKey = `${user.id}:${bookId}`
  const cachedUntil = purchaseCache.get(cacheKey)
  if (cachedUntil && cachedUntil > Date.now()) return true

  const grantEmail = user.emailVerified ? user.email : ""
  const rows = await sql`
    SELECT 1 FROM purchases pu
    WHERE pu.product_id = ${bookId}
      AND pu.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${user.id})
      AND pu.status = 'completed'
      AND pu.access_granted = true
    UNION ALL
    SELECT 1 FROM access_grants ag
    WHERE lower(ag.email) = lower(${grantEmail})
      AND ag.revoked_at IS NULL
      AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
    LIMIT 1
  `
  const purchased = rows.length > 0
  if (purchased) purchaseCache.set(cacheKey, Date.now() + PURCHASE_CACHE_TTL_MS)
  return purchased
}
