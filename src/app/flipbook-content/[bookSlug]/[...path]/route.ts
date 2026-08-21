import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { r2Client, R2_BUCKET } from "@/lib/r2"

const PREVIEW_DURATION_S = 180
const PREVIEW_COOKIE_MAX_AGE_S = 60 * 60 * 24 // 24h — how long before an anonymous visitor gets another free preview

// The reader fires off dozens to hundreds of sub-resource requests (every
// page image, JS/CSS chunk) for a single "Open Book" click. Re-querying the
// book's metadata and the viewer's purchase status on every one of those was
// the dominant cost. Both are cheap to cache in-memory for the life of this
// warm serverless instance — book metadata never changes without a deploy,
// and purchase status changes rarely enough that a short TTL is safe.
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

function verifyPreviewCookie(value: string, bookId: string): { startedAt: number } | null {
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

function makePreviewCookie(bookId: string, startedAt: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ bookId, startedAt })).toString("base64url")
  return `${payloadB64}.${sign(payloadB64)}`
}

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } })
}

async function resolveBook(bookSlug: string) {
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

async function hasPurchased(authUserId: string | undefined, bookId: string): Promise<boolean> {
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

export async function GET(
  request: NextRequest,
  { params }: { params: { bookSlug: string; path: string[] } }
) {
  const { bookSlug, path } = params

  if (path.some((segment) => segment === ".." || segment.includes("\0"))) {
    return errorResponse("Invalid path", 400)
  }

  // Book metadata and the session are independent lookups — run them
  // concurrently instead of paying for both round-trips in sequence.
  const [book, session] = await Promise.all([
    resolveBook(bookSlug),
    auth.api.getSession({ headers: await headers() }),
  ])
  if (!book) {
    return errorResponse("Not found", 404)
  }

  // The FlipHTML5 reader's own Share button hands out this raw entry-point
  // URL (it only knows its own iframe document, not the page embedding it).
  // A direct top-level open of that link should land on the real page —
  // same-origin, so cookies/preview state carry over — not a bare JSON error.
  // Sec-Fetch-Dest distinguishes that from our own page's legitimate iframe embed.
  const isEntryPoint = path.length === 1 && path[0] === "index.html"
  if (isEntryPoint && request.headers.get("sec-fetch-dest") === "document") {
    return NextResponse.redirect(new URL("/flipbook", request.url))
  }

  const purchased = await hasPurchased(session?.user?.id, book.id)

  const cookieName = `ib_preview_${bookSlug}`
  let cookieToSet: string | null = null

  if (!purchased) {
    const existing = request.cookies.get(cookieName)?.value
    const verified = existing ? verifyPreviewCookie(existing, book.id) : null

    const now = Date.now()
    const startedAt = verified?.startedAt ?? now
    const elapsedS = (now - startedAt) / 1000

    if (elapsedS > PREVIEW_DURATION_S) {
      return errorResponse("Preview expired", 403)
    }

    if (!verified) {
      cookieToSet = makePreviewCookie(book.id, startedAt)
    }
  }

  const key = `${book.r2_prefix}/${path.join("/")}`

  let object
  try {
    object = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  } catch (err: any) {
    if (err?.name === "NoSuchKey") {
      return errorResponse("Not found", 404)
    }
    throw err
  }

  const bytes = await object.Body?.transformToByteArray()
  if (!bytes) {
    return errorResponse("Not found", 404)
  }

  // Purchased viewers get a much longer cache on the static sub-assets
  // (images/JS/CSS never change per book) so reopening the flipbook hits
  // the browser cache instead of re-running the whole chain per file. The
  // entry HTML and anything served to a time-limited preview stay
  // uncached/short-lived so access can't outlive its window.
  const cacheControl = !purchased
    ? "private, no-store"
    : isEntryPoint
      ? "private, max-age=300"
      : "private, max-age=604800, immutable"

  const response = new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": object.ContentType ?? "application/octet-stream",
      // Gated content: never let a shared/edge cache serve one visitor's response to another.
      "Cache-Control": cacheControl,
    },
  })

  if (cookieToSet) {
    response.cookies.set(cookieName, cookieToSet, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/flipbook-content",
      maxAge: PREVIEW_COOKIE_MAX_AGE_S,
    })
  }

  return response
}
