import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  PREVIEW_DURATION_S,
  PREVIEW_HEARTBEAT_TICK_S,
  PREVIEW_COOKIE_MAX_AGE_S,
  previewCookieName,
  resolveBook,
  hasPurchased,
  verifyPreviewCookie,
  makePreviewCookie,
} from "@/lib/flipbook-access"

// The client pings this only while the flipbook is open and the tab is
// visible (see FlipbookPage's Page Visibility handling) — pausing here
// instead of stopping the client's timer is what makes the preview budget
// pause on inactivity instead of just resetting on reload. Each accepted
// ping is worth a fixed, server-defined slice of time, never a
// client-supplied duration, so the total can't be inflated by messing with
// the clock or by spamming this endpoint.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const bookSlug = body?.bookSlug
  if (!bookSlug) {
    return NextResponse.json({ error: "Missing bookSlug" }, { status: 400 })
  }

  const [book, session] = await Promise.all([
    resolveBook(bookSlug),
    auth.api.getSession({ headers: await headers() }),
  ])
  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const purchased = await hasPurchased(session?.user?.id, book.id)
  if (purchased) {
    return NextResponse.json({ purchased: true, expired: false, remainingS: PREVIEW_DURATION_S }, { headers: { "Cache-Control": "no-store" } })
  }

  const signedIn = Boolean(session?.user?.id)
  const cookieName = previewCookieName(bookSlug, signedIn)
  const existing = request.cookies.get(cookieName)?.value
  const verified = existing ? verifyPreviewCookie(existing, book.id) : null
  const usedS = verified?.usedS ?? 0

  const newUsedS = Math.min(usedS + PREVIEW_HEARTBEAT_TICK_S, PREVIEW_DURATION_S)
  const expired = newUsedS >= PREVIEW_DURATION_S

  const response = NextResponse.json(
    { purchased: false, expired, remainingS: PREVIEW_DURATION_S - newUsedS },
    { headers: { "Cache-Control": "no-store" } }
  )

  response.cookies.set(cookieName, makePreviewCookie(book.id, newUsedS), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_COOKIE_MAX_AGE_S,
  })

  return response
}
