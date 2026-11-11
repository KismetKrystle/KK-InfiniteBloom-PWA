import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { r2Client, R2_BUCKET } from "@/lib/r2"
import {
  PREVIEW_DURATION_S,
  previewCookieName,
  previewCookieOptions,
  resolveBook,
  hasPurchased,
  verifyPreviewCookie,
  makePreviewCookie,
} from "@/lib/flipbook-access"

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } })
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
  // same-origin, so the sign-in cookie carries over — not a bare JSON error.
  // Sec-Fetch-Dest distinguishes that from our own page's legitimate iframe embed.
  const isEntryPoint = path.length === 1 && path[0] === "index.html"
  if (isEntryPoint && request.headers.get("sec-fetch-dest") === "document") {
    return NextResponse.redirect(new URL("/flipbook", request.url))
  }

  // Buyers get everything. Everyone else reads the real book only while
  // their 2-minute preview lasts; the time itself is counted by the
  // heartbeat route, this just checks it and plants the cookie on a
  // visitor's very first request.
  const purchased = await hasPurchased(session?.user, book.id)
  const cookieName = previewCookieName(bookSlug, Boolean(session))
  let cookieToSet: string | null = null

  if (!purchased) {
    const existing = request.cookies.get(cookieName)?.value
    const verified = existing ? verifyPreviewCookie(existing, book.id) : null
    if ((verified?.usedS ?? 0) >= PREVIEW_DURATION_S) {
      return errorResponse("Preview ended", 403)
    }
    if (!verified) cookieToSet = makePreviewCookie(book.id, 0)
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

  // Buyers get a long private cache on the static sub-assets (images/JS/CSS
  // never change per book) so reopening the book hits the browser cache.
  // Preview responses are never cached, so access can't outlive the 3
  // minutes, and the entry HTML stays short-lived so a revoked grant
  // can't linger.
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
  if (cookieToSet) response.cookies.set(cookieName, cookieToSet, previewCookieOptions())
  return response
}
