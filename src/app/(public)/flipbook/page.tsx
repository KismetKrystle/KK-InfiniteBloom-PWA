import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { resolveBook, hasPurchased } from "@/lib/flipbook-access"
import { BOOK_PAYMENT_LINK } from "@/lib/book-purchase"
import FlipbookPage from "@/components/FlipbookPage"
import ReaderShell, { ShellHeading } from "@/components/ReaderShell"
import CodeSignInForm from "@/components/CodeSignInForm"
import SignOutButton from "@/components/SignOutButton"
import KKArrow from "@/components/KKArrow"

// Only one active book/tenant today — resolve this from the route/tenant
// context instead of a constant once a second book exists.
const BOOK_SLUG = "kismet-krystle"

export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return (
      <ReaderShell label="Reader">
        <ShellHeading
          eyebrow="Your copy"
          title={<>OPEN YOUR<br /><span className="kk-blue">BOOK.</span></>}
          body="Enter the email you used at checkout. We'll send you a 6-digit code — no password needed."
        />
        <CodeSignInForm />
        <BuyLink />
      </ReaderShell>
    )
  }

  const book = await resolveBook(BOOK_SLUG)
  const purchased = book ? await hasPurchased(session.user, book.id) : false

  if (!purchased) {
    return (
      <ReaderShell label="Reader">
        <ShellHeading
          eyebrow="Signed in"
          title={<>NO COPY<br /><span className="kk-blue">FOUND.</span></>}
          body={
            <>
              There&apos;s no purchase for <span className="text-[var(--kk-ink)]">{session.user.email}</span> yet. If
              you just bought it, give it a minute and refresh. Used a different email at checkout? Sign out and use
              that one.
            </>
          }
        />
        <SignOutButton />
        <BuyLink />
      </ReaderShell>
    )
  }

  const user = { id: session.user.id, name: session.user.name ?? null, email: session.user.email }
  return <FlipbookPage user={user} bookSlug={BOOK_SLUG} />
}

function BuyLink() {
  return (
    <div className="border-t kk-rule pt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
      <span className="text-sm text-[var(--kk-muted)]">Don&apos;t have the book yet?</span>
      <a href={BOOK_PAYMENT_LINK} className="kk-text-link">
        Get the digital book · $20 <KKArrow />
      </a>
    </div>
  )
}
