import ReaderShell from "@/components/ReaderShell"
import MagicLinkForm from "@/components/MagicLinkForm"

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
    <ReaderShell>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">Sign in</h1>
        <p className="text-sm leading-relaxed text-[#555]">
          Enter your email and we&apos;ll send you a link — no password needed.
        </p>
      </div>
      <MagicLinkForm next={safeNext(callbackUrl)} />
    </ReaderShell>
  )
}
