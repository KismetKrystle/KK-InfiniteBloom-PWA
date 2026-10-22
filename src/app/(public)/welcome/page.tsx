import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { grantAccessFromCheckout } from "@/lib/book-purchase"
import ReaderShell, { ShellHeading } from "@/components/ReaderShell"
import CodeSignInForm from "@/components/CodeSignInForm"
import WelcomeCodeSignIn from "@/components/WelcomeCodeSignIn"
import KKArrow from "@/components/KKArrow"

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
      <ReaderShell label="Welcome">
        <ShellHeading
          eyebrow="Thank you"
          title={<>ALMOST<br /><span className="kk-blue">THERE.</span></>}
          body="We couldn't confirm your payment on this page — it may still be processing. Enter the email you used at checkout and we'll send you a code to open your book."
        />
        <CodeSignInForm />
      </ReaderShell>
    )
  }

  const session = await auth.api.getSession({ headers: await headers() })
  const alreadySignedIn = session?.user.email.toLowerCase() === grant.email

  return (
    <ReaderShell label="Welcome">
      <ShellHeading
        eyebrow="Payment received · thank you"
        title={<>WELCOME TO<br /><span className="kk-blue">THE BLOOM.</span></>}
        body={alreadySignedIn ? undefined : "Your copy is ready. Enter the code we just emailed you to start reading — on this device, no password needed."}
      />
      {alreadySignedIn ? (
        <Link href="/flipbook" className="kk-solid">
          Open your book <KKArrow />
        </Link>
      ) : (
        <WelcomeCodeSignIn checkoutSessionId={checkoutSessionId} email={grant.email} />
      )}
      <p className="text-xs leading-relaxed text-[var(--kk-muted)] border-t kk-rule pt-5">
        Coming back later or on another device? Go to read.kismetkrystle.com and sign in with this same email.
      </p>
    </ReaderShell>
  )
}
