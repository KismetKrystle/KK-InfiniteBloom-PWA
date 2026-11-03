import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { resolveBook, hasPurchased } from "@/lib/flipbook-access"
import FlipbookPage from "@/components/FlipbookPage"

// Only one active book/tenant today — resolve this from the route/tenant
// context instead of a constant once a second book exists.
const BOOK_SLUG = "kismet-krystle"

// Everyone lands on the reader: buyers read the whole book, everyone else
// gets the 3-minute preview and then the buy / sign-in panel.
export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  const book = session ? await resolveBook(BOOK_SLUG) : undefined
  const hasAccess = session && book ? await hasPurchased(session.user, book.id) : false

  const user = session ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email } : null
  return <FlipbookPage user={user} hasAccess={hasAccess} bookSlug={BOOK_SLUG} />
}
