import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  PREVIEW_DURATION_S,
  PREVIEW_HEARTBEAT_TICK_S,
  previewCookieName,
  previewCookieOptions,
  resolveBook,
  hasPurchased,
  verifyPreviewCookie,
  makePreviewCookie,
} from "@/lib/flipbook-access"

// The client pings this only while the reader is open and the tab is
// visible, so the preview budget pauses on inactivity instead of resetting
// on reload. Each ping is worth a fixed, server-defined slice of time.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const bookSlug = body?.bookSlug
  if (!bookSlug) return NextResponse.json({ error: "Missing bookSlug" }, { status: 400 })

  const [book, session] = await Promise.all([resolveBook(bookSlug), auth.api.getSession({ headers: await headers() })])
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const noStore = { headers: { "Cache-Control": "no-store" } }
  if (await hasPurchased(session?.user, book.id)) {
    return NextResponse.json({ purchased: true, expired: false, remainingS: PREVIEW_DURATION_S }, noStore)
  }

  const cookieName = previewCookieName(bookSlug, Boolean(session))
  const existing = request.cookies.get(cookieName)?.value
  const usedS = (existing ? verifyPreviewCookie(existing, book.id) : null)?.usedS ?? 0
  const newUsedS = Math.min(usedS + PREVIEW_HEARTBEAT_TICK_S, PREVIEW_DURATION_S)

  const response = NextResponse.json(
    { purchased: false, expired: newUsedS >= PREVIEW_DURATION_S, remainingS: PREVIEW_DURATION_S - newUsedS },
    noStore
  )
  response.cookies.set(cookieName, makePreviewCookie(book.id, newUsedS), previewCookieOptions())
  return response
}
