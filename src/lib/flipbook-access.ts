import { createHmac, timingSafeEqual } from "crypto"
import { sql } from "@/lib/db"

export const PREVIEW_DURATION_S = 180

// Signed-in (but not yet purchased) visitors get their free preview back
// every 24h. Anonymous visitors get one taste, full stop — their preview
// cookie is set to (effectively) never expire, so it never silently
// resets; the paywall stays up until they sign in or buy. Signing in
// starts a *different* cookie, so it isn't blocked by prior anonymous
// browsing on the same device.
export const PREVIEW_COOKIE_MAX_AGE_S = 60 * 60 * 24 // 24h — signed-in, not purchased
export const PREVIEW_COOKIE_PERMANENT_S = 60 * 60 * 24 * 400 // ~400 days — anonymous (browsers cap cookie lifetime around here anyway)

export function previewCookieName(bookSlug: string, signedIn: boolean): string {
  return signedIn ? `ib_preview_user_${bookSlug}` : `ib_preview_${bookSlug}`
}

// Book metadata never changes without a deploy, and purchase status changes
// rarely enough that a short TTL is safe — both are cheap to cache in-memory
// for the life of a warm serverless instance instead of querying per request.
const BOOK_CACHE = new Map<string, { id: string; r2_prefix: string } | null>()
const PURCHASE_CACHE_TTL_MS = 60_000
const purchaseCache = new Map<string, { purchased: boolean; expiresAt: number }>()

function cookieSecret(): string {
  const secret = process.env.PREVIEW_COOKIE_SECRET
  if (!secret) throw new Error("Missing env var: PREVIEW_COOKIE_SECRET")
  return secret
}

function sign(payloadB64: string): string {
  return createHmac("sha256", cookieSecret()).update(payloadB64).digest("base64url")
}

export function verifyPreviewCookie(value: string, bookId: string): { startedAt: number } | null {
  const [payloadB64, signature] = value.split(".")
  if (!payloadB64 || !signature) return null

  const expected = sign(payloadB64)
  const given = Buffer.from(signature)
  const wanted = Buffer.from(expected)
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))
    if (payload.bookId !== bookId || typeof payload.startedAt !== "number") return null
    return { startedAt: payload.startedAt }
  } catch {
    return null
  }
}

export function makePreviewCookie(bookId: string, startedAt: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ bookId, startedAt })).toString("base64url")
  return `${payloadB64}.${sign(payloadB64)}`
}

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

export async function hasPurchased(authUserId: string | undefined, bookId: string): Promise<boolean> {
  if (!authUserId) return false

  const cacheKey = `${authUserId}:${bookId}`
  const cached = purchaseCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.purchased

  const rows = await sql`
    SELECT 1 FROM purchases pu
    WHERE pu.product_id = ${bookId}
      AND pu.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId})
      AND pu.status = 'completed'
      AND pu.access_granted = true
    LIMIT 1
  `
  const purchased = rows.length > 0
  purchaseCache.set(cacheKey, { purchased, expiresAt: Date.now() + PURCHASE_CACHE_TTL_MS })
  return purchased
}
