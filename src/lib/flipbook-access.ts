import { createHmac, timingSafeEqual } from "crypto"
import { sql } from "@/lib/db"

// Anyone who isn't a buyer gets a 3-minute *active* preview of the real
// reader (narration included), then the "get your copy" prompt. The client
// pings /api/flipbook/preview-heartbeat every tick while the book is open
// and the tab is visible; each accepted ping adds exactly this many seconds
// to the signed cookie's usedS — never a client-supplied duration — so the
// budget can't be inflated, and it stops the moment the tab is backgrounded.
export const PREVIEW_DURATION_S = 180
export const PREVIEW_HEARTBEAT_TICK_S = 5
export const PREVIEW_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 400 // ~400 days (browsers cap cookie lifetime around here)

// Signed-in visitors get a separate cookie, so browsing anonymously first
// doesn't use up the preview they'd get after signing in.
export function previewCookieName(bookSlug: string, signedIn: boolean): string {
  return signedIn ? `ib_preview_user_${bookSlug}` : `ib_preview_${bookSlug}`
}

function cookieSecret(): string {
  const secret = process.env.PREVIEW_COOKIE_SECRET
  if (!secret) throw new Error("Missing env var: PREVIEW_COOKIE_SECRET")
  return secret
}

function sign(payloadB64: string): string {
  return createHmac("sha256", cookieSecret()).update(payloadB64).digest("base64url")
}

export function verifyPreviewCookie(value: string, bookId: string): { usedS: number } | null {
  const [payloadB64, signature] = value.split(".")
  if (!payloadB64 || !signature) return null

  const given = Buffer.from(signature)
  const wanted = Buffer.from(sign(payloadB64))
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))
    if (payload.bookId !== bookId || typeof payload.usedS !== "number") return null
    return { usedS: payload.usedS }
  } catch {
    return null
  }
}

export function makePreviewCookie(bookId: string, usedS: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ bookId, usedS })).toString("base64url")
  return `${payloadB64}.${sign(payloadB64)}`
}

export function previewCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    // "/" (not scoped to /flipbook-content) so the heartbeat and status
    // endpoints under /api/flipbook can read and update it too.
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE_S,
  }
}

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
