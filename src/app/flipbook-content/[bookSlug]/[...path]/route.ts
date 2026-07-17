import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { r2Client, R2_BUCKET } from "@/lib/r2"

const PREVIEW_DURATION_S = 180
const PREVIEW_COOKIE_MAX_AGE_S = 60 * 60 * 24 // 24h — how long before an anonymous visitor gets another free preview

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
  return rows[0] as { id: string; r2_prefix: string | null } | undefined
}

async function hasPurchased(authUserId: string | undefined, bookId: string): Promise<boolean> {
  if (!authUserId) return false
  const rows = await sql`
    SELECT 1 FROM purchases pu
    WHERE pu.product_id = ${bookId}
      AND pu.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId})
      AND pu.status = 'completed'
      AND pu.access_granted = true
    LIMIT 1
  `
  return rows.length > 0
}

export async function GET(
  request: NextRequest,
  { params }: { params: { bookSlug: string; path: string[] } }
) {
  const { bookSlug, path } = params

  if (path.some((segment) => segment === ".." || segment.includes("\0"))) {
    return errorResponse("Invalid path", 400)
  }

  const book = await resolveBook(bookSlug)
  if (!book || !book.r2_prefix) {
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

  const session = await auth.api.getSession({ headers: await headers() })
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

  const response = new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": object.ContentType ?? "application/octet-stream",
      // Gated content: never let a shared/edge cache serve one visitor's response to another.
      "Cache-Control": purchased ? "private, max-age=300" : "private, no-store",
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
