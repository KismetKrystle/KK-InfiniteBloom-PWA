import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PREVIEW_DURATION_S, previewCookieName, resolveBook, hasPurchased, verifyPreviewCookie } from "@/lib/flipbook-access"

// Lets the page check the preview before loading the reader, so a visitor
// whose 3 minutes ran out on an earlier visit sees the "get your copy"
// prompt straight away instead of a reader that fails to load.
export async function GET(request: NextRequest) {
  const bookSlug = request.nextUrl.searchParams.get("bookSlug")
  if (!bookSlug) return NextResponse.json({ error: "Missing bookSlug" }, { status: 400 })

  const [book, session] = await Promise.all([resolveBook(bookSlug), auth.api.getSession({ headers: await headers() })])
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const noStore = { headers: { "Cache-Control": "no-store" } }
  if (await hasPurchased(session?.user, book.id)) {
    return NextResponse.json({ purchased: true, expired: false, remainingS: PREVIEW_DURATION_S }, noStore)
  }

  const existing = request.cookies.get(previewCookieName(bookSlug, Boolean(session)))?.value
  const usedS = (existing ? verifyPreviewCookie(existing, book.id) : null)?.usedS ?? 0
  return NextResponse.json(
    { purchased: false, expired: usedS >= PREVIEW_DURATION_S, remainingS: Math.max(0, PREVIEW_DURATION_S - usedS) },
    noStore
  )
}
