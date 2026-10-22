'use client'

import { useEffect, useRef, useState } from 'react'
import { authClient } from '@/lib/auth-client'

interface CodeSignInFormProps {
  // Where to land after signing in — always routed through /post-login so
  // the reader's profile row exists first.
  next?: string
  // Post-purchase: the email is already known (from Stripe) and the code is
  // requested by the server, so the form starts on the code step.
  lockedEmail?: string
  requestCode?: () => Promise<boolean>
  // Sends the first code automatically, once per key (survives reloads).
  autoSendKey?: string
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  return domain ? `${name.slice(0, 1)}•••@${domain}` : email
}

export default function CodeSignInForm({ next, lockedEmail, requestCode, autoSendKey }: CodeSignInFormProps) {
  const [email, setEmail] = useState(lockedEmail ?? '')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>(lockedEmail ? 'code' : 'email')
  const [busy, setBusy] = useState(false)
  const [sentNotice, setSentNotice] = useState('')
  const [error, setError] = useState('')
  const codeInput = useRef<HTMLInputElement>(null)

  async function sendCode() {
    setError('')
    setBusy(true)
    let ok: boolean
    if (requestCode) {
      ok = await requestCode()
    } else {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
      ok = !error
    }
    setBusy(false)
    if (!ok) {
      setError("We couldn't send a code just now. Please try again.")
      return
    }
    setStep('code')
    setSentNotice(`We sent a 6-digit code to ${lockedEmail ? maskEmail(email) : email}.`)
    setTimeout(() => codeInput.current?.focus(), 0)
  }

  useEffect(() => {
    if (!autoSendKey) return
    const key = `code-sent:${autoSendKey}`
    try {
      if (sessionStorage.getItem(key)) {
        setSentNotice(`We sent a 6-digit code to ${maskEmail(email)}.`)
        return
      }
      sessionStorage.setItem(key, '1')
    } catch {
      // Storage unavailable — just send.
    }
    sendCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSendKey])

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await authClient.signIn.emailOtp({ email, otp: code })
    if (error) {
      setBusy(false)
      setCode('')
      setError(
        error.code === 'TOO_MANY_ATTEMPTS'
          ? 'Too many tries — send yourself a new code.'
          : error.code === 'OTP_EXPIRED'
            ? 'That code has expired — send yourself a new one.'
            : "That code didn't work. Check it, or send a new one."
      )
      return
    }
    // Full navigation so the server sees the new session cookie.
    window.location.href = next ? `/post-login?next=${encodeURIComponent(next)}` : '/post-login'
  }

  if (step === 'email') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendCode()
        }}
        className="space-y-3 text-left"
      >
        <label htmlFor="signin-email" className="kk-micro block text-[var(--kk-muted)]">
          Your email address
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={busy}
            className="kk-input flex-1"
          />
          <button type="submit" disabled={busy} className="kk-solid whitespace-nowrap">
            {busy ? 'Sending…' : 'Email me a code'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={verify} className="space-y-3 text-left">
      <p className="text-sm leading-relaxed text-[var(--kk-muted)]" role="status">
        {sentNotice || (busy ? 'Sending your code…' : '')}
      </p>
      <label htmlFor="signin-code" className="kk-micro block text-[var(--kk-muted)]">
        6-digit code
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="signin-code"
          ref={codeInput}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          disabled={busy}
          className="kk-input kk-code flex-1"
        />
        <button type="submit" disabled={busy || code.length !== 6} className="kk-solid whitespace-nowrap">
          {busy ? 'Checking…' : 'Open my book'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
        <button type="button" onClick={sendCode} disabled={busy} className="kk-text-link text-xs">
          Send a new code
        </button>
        {!lockedEmail && (
          <button
            type="button"
            onClick={() => {
              setStep('email')
              setCode('')
              setError('')
              setSentNotice('')
            }}
            className="kk-text-link text-xs"
          >
            Use a different email
          </button>
        )}
      </div>
    </form>
  )
}
