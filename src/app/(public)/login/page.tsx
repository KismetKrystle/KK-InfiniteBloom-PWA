import ReaderShell, { ShellHeading } from "@/components/ReaderShell"
import CodeSignInForm from "@/components/CodeSignInForm"

// Only ever pass a same-site relative path through — an unvalidated value
// would otherwise be an open-redirect vector (e.g. //evil.com).
function safeNext(callbackUrl: string | undefined): string | undefined {
  let decoded: string | undefined
  try {
    decoded = callbackUrl ? decodeURIComponent(callbackUrl) : undefined
  } catch {
    return undefined
  }
  return decoded && decoded.startsWith("/") && !decoded.startsWith("//") ? decoded : undefined
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <ReaderShell label="Sign in">
      <ShellHeading
        title={<>SIGN<br /><span className="kk-blue">IN.</span></>}
        body="Enter your email and we'll send you a 6-digit code — no password needed."
      />
      <CodeSignInForm next={safeNext(callbackUrl)} />
    </ReaderShell>
  )
}
