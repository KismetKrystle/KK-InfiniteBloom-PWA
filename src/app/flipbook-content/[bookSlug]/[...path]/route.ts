import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/lib/auth"
import { r2Client, R2_BUCKET } from "@/lib/r2"
import { resolveBook, hasPurchased } from "@/lib/flipbook-access"

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

  // Buyers only — there's no free preview. The sample lives on
  // kismetkrystle.com as static images, so nothing here is ever public.
  if (!(await hasPurchased(session?.user, book.id))) {
    return errorResponse("Purchase required", 403)
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

  // Static sub-assets (images/JS/CSS never change per book) get a long
  // private cache so reopening the flipbook hits the browser cache instead
  // of re-running the whole chain per file. The entry HTML stays
  // short-lived so a revoked grant can't outlive it for long.
  const cacheControl = isEntryPoint ? "private, max-age=300" : "private, max-age=604800, immutable"

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": object.ContentType ?? "application/octet-stream",
      // Gated content: never let a shared/edge cache serve one visitor's response to another.
      "Cache-Control": cacheControl,
    },
  })
}
