import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { r2Client, R2_BUCKET } from "@/lib/r2"
import {
  PREVIEW_DURATION_S,
  PREVIEW_COOKIE_MAX_AGE_S,
  PREVIEW_COOKIE_PERMANENT_S,
  previewCookieName,
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
  // same-origin, so cookies/preview state carry over — not a bare JSON error.
  // Sec-Fetch-Dest distinguishes that from our own page's legitimate iframe embed.
  const isEntryPoint = path.length === 1 && path[0] === "index.html"
  if (isEntryPoint && request.headers.get("sec-fetch-dest") === "document") {
    return NextResponse.redirect(new URL("/flipbook", request.url))
  }

  const purchased = await hasPurchased(session?.user?.id, book.id)
  const signedIn = Boolean(session?.user?.id)
  const cookieName = previewCookieName(bookSlug, signedIn)
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
      maxAge: signedIn ? PREVIEW_COOKIE_MAX_AGE_S : PREVIEW_COOKIE_PERMANENT_S,
    })
  }

  return response
}
