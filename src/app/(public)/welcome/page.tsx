import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { grantAccessFromCheckout } from "@/lib/book-purchase"
import ReaderShell from "@/components/ReaderShell"
import MagicLinkForm from "@/components/MagicLinkForm"
import WelcomeLinkSender from "@/components/WelcomeLinkSender"

// Stripe's Payment Link redirects here with ?session_id={CHECKOUT_SESSION_ID}.
// Granting here as well as in the webhook means the buyer never waits on
// webhook delivery to get in.
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: checkoutSessionId } = await searchParams

  let grant: { email: string } | null = null
  if (checkoutSessionId?.startsWith("cs_")) {
    try {
      grant = await grantAccessFromCheckout(checkoutSessionId)
    } catch (err) {
      console.error("[welcome] Could not confirm checkout", checkoutSessionId, err)
    }
  }

  if (!grant || !checkoutSessionId) {
    return (
      <ReaderShell>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111]">Thank you!</h1>
          <p className="text-sm leading-relaxed text-[#555]">
            We couldn&apos;t confirm your payment on this page, but it may still be processing. Enter the email you
            used at checkout and we&apos;ll send you a link to your book.
          </p>
        </div>
        <MagicLinkForm />
      </ReaderShell>
    )
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const alreadySignedIn = session?.user.email.toLowerCase() === grant.email

  return (
    <ReaderShell>
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.25em] text-[#777]">PAYMENT RECEIVED</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">Welcome to The Infinite Bloom</h1>
      </div>
      {alreadySignedIn ? (
        <Link
          href="/flipbook"
          className="inline-block px-6 py-3 rounded-full bg-[#111] text-white text-sm hover:opacity-90 transition-opacity"
        >
          Open your book
        </Link>
      ) : (
        <WelcomeLinkSender checkoutSessionId={checkoutSessionId} email={grant.email} />
      )}
    </ReaderShell>
  )
}
