import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Same-origin by default, so the client always talks to whichever domain
  // the reader is on instead of a hardcoded fallback.
  baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  plugins: [magicLinkClient()],
})
