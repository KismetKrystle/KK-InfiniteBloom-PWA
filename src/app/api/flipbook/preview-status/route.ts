import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PREVIEW_DURATION_S, previewCookieName, resolveBook, hasPurchased, verifyPreviewCookie } from "@/lib/flipbook-access"

// Lets the flipbook page check preview eligibility before ever loading the
// reader iframe — without this, a visitor whose preview already expired in
// an earlier visit would have their first content request rejected by the
// flipbook-content route, surfacing its raw JSON error inside the iframe
// instead of the "Free Preview Ended" card.
export async function GET(request: NextRequest) {
  const bookSlug = request.nextUrl.searchParams.get("bookSlug")
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
    return NextResponse.json({ purchased: true, expired: false }, { headers: { "Cache-Control": "no-store" } })
  }

  const cookieName = previewCookieName(bookSlug, Boolean(session?.user?.id))
  const existing = request.cookies.get(cookieName)?.value
  const verified = existing ? verifyPreviewCookie(existing, book.id) : null
  const usedS = verified?.usedS ?? 0

  const expired = usedS >= PREVIEW_DURATION_S
  const remainingS = Math.max(0, PREVIEW_DURATION_S - usedS)

  return NextResponse.json({ purchased: false, expired, remainingS }, { headers: { "Cache-Control": "no-store" } })
}
