'use client'

import { useEffect, useState } from 'react'

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  return `${name.slice(0, 1)}•••@${domain}`
}

// Sends the sign-in link once per checkout automatically (guarded across
// reloads), with a manual resend for when it lands in spam or expires.
export default function WelcomeLinkSender({ checkoutSessionId, email }: { checkoutSessionId: string; email: string }) {
  const [status, setStatus] = useState<'sending' | 'sent' | 'error'>('sending')

  async function send() {
    setStatus('sending')
    try {
      const res = await fetch('/api/welcome/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutSessionId }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    const key = `welcome-link-sent:${checkoutSessionId}`
    try {
      if (sessionStorage.getItem(key)) {
        setStatus('sent')
        return
      }
      sessionStorage.setItem(key, '1')
    } catch {
      // Storage unavailable — just send.
    }
    send()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutSessionId])

  return (
    <div className="space-y-4" role="status">
      <p className="text-sm leading-relaxed text-[#555]">
        {status === 'sending' && 'Sending your link…'}
        {status === 'sent' && (
          <>
            We&apos;ve emailed a link to <span className="text-[#111] font-medium">{maskEmail(email)}</span>. Open it on
            the device you want to read on — no password needed.
          </>
        )}
        {status === 'error' && "We couldn't send the email just now. Try again below."}
      </p>
      {status !== 'sending' && (
        <button type="button" onClick={send} className="text-xs underline text-[#777] hover:text-[#111] transition-colors">
          {status === 'error' ? 'Try again' : "Didn't get it? Send it again"}
        </button>
      )}
      <p className="text-xs text-[#999]">
        Later, sign in any time at read.kismetkrystle.com with this email.
      </p>
    </div>
  )
}
