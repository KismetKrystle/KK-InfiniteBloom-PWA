import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { resolveBook, hasPurchased } from "@/lib/flipbook-access"
import { BOOK_PAYMENT_LINK } from "@/lib/book-purchase"
import FlipbookPage from "@/components/FlipbookPage"
import ReaderShell from "@/components/ReaderShell"
import MagicLinkForm from "@/components/MagicLinkForm"
import SignOutButton from "@/components/SignOutButton"

// Only one active book/tenant today — resolve this from the route/tenant
// context instead of a constant once a second book exists.
const BOOK_SLUG = "kismet-krystle"

export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <ReaderShell>
        <Heading
          title="Open your book"
          body="Enter the email you used at checkout and we'll send you a link — no password needed."
        />
        <MagicLinkForm />
        <BuyLink />
      </ReaderShell>
    )
  }

  const book = await resolveBook(BOOK_SLUG)
  const purchased = book ? await hasPurchased(session.user, book.id) : false

  if (!purchased) {
    return (
      <ReaderShell>
        <Heading
          title="We couldn't find your copy"
          body={`There's no purchase for ${session.user.email} yet. If you just bought it, give it a minute and refresh. Used a different email at checkout? Sign out and use that one.`}
        />
        <SignOutButton />
        <BuyLink />
      </ReaderShell>
    )
  }

  const user = { id: session.user.id, name: session.user.name ?? null, email: session.user.email }
  return <FlipbookPage user={user} bookSlug={BOOK_SLUG} />
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111]">{title}</h1>
      <p className="text-sm leading-relaxed text-[#555]">{body}</p>
    </div>
  )
}

function BuyLink() {
  return (
    <p className="text-xs text-[#777]">
      Don&apos;t have the book yet?{" "}
      <a href={BOOK_PAYMENT_LINK} className="text-[#111] underline">
        Get the digital edition — $20
      </a>
    </p>
  )
}
