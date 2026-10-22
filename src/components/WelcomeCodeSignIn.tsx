'use client'

import CodeSignInForm from './CodeSignInForm'

// After checkout the buyer's email is already known, so the code goes out
// automatically and they only have to type it in.
export default function WelcomeCodeSignIn({ checkoutSessionId, email }: { checkoutSessionId: string; email: string }) {
  async function requestCode() {
    const res = await fetch('/api/welcome/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutSessionId }),
    }).catch(() => null)
    return Boolean(res?.ok)
  }

  return <CodeSignInForm lockedEmail={email} requestCode={requestCode} autoSendKey={checkoutSessionId} />
}
