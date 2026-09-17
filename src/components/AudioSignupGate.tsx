'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export default function AudioSignupGate() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const [passwordMode, setPasswordMode] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)

  const busy = loading || googleLoading || magicLinkLoading

  function togglePasswordMode(next: boolean) {
    setPasswordMode(next)
    setMagicLinkSent(false)
    setError('')
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signUpError } = await authClient.signUp.email({ email, password, name })
    if (signUpError) {
      setError(signUpError.message ?? 'Could not create your account.')
      setLoading(false)
      return
    }

    await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, marketingConsent }),
    }).catch(() => {})

    router.refresh()
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await authClient.signIn.email({ email, password })
    if (signInError) {
      setError(signInError.message ?? 'Invalid email or password.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  async function sendMagicLink() {
    setError('')
    setMagicLinkLoading(true)

    const { error: magicLinkError } = await authClient.signIn.magicLink({ email, callbackURL: '/post-login?next=/audio' })
    if (magicLinkError) {
      setError(magicLinkError.message ?? 'Could not send the link. Please try again.')
      setMagicLinkLoading(false)
      return
    }

    setMagicLinkSent(true)
    setMagicLinkLoading(false)
  }

  function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    sendMagicLink()
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const { error: googleError } = await authClient.signIn.social({ provider: 'google', callbackURL: '/post-login?next=/audio' })
      if (googleError) {
        setError(googleError.message ?? 'Google sign-in failed. Please try again.')
        setGoogleLoading(false)
      }
      // On success, better-auth redirects the browser — no further action needed here.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto bg-white/40 backdrop-blur-[2px]">
      <div className="w-full max-w-sm max-h-full overflow-y-auto bg-white rounded-2xl border border-[#d4d4d4] shadow-2xl px-6 py-7">
        {!passwordMode ? (
          <>
            <h2 className="text-lg font-medium text-[#111] mb-1 text-center">The Voice of the Poet</h2>
            <p className="text-sm text-[#888] mb-5 text-center">Enter your email to start listening.</p>

            {magicLinkSent ? (
              <div className="text-center py-2 space-y-2">
                <p className="text-sm text-[#666]">
                  Check <span className="text-[#111] font-medium">{email}</span> for a sign-in link.
                  It expires in 5 minutes.
                </p>
                <button
                  type="button"
                  onClick={sendMagicLink}
                  disabled={busy}
                  className="text-xs text-[#F27D26] hover:underline disabled:opacity-50"
                >
                  {magicLinkLoading ? 'Sending…' : "Didn't get it? Resend the link"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="flex items-center gap-2 mb-4">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  placeholder="you@email.com"
                  className="flex-1 px-4 py-2.5 rounded-full border border-[#d4d4d4] text-sm text-[#111] outline-none focus:border-[#F27D26] transition-colors"
                />
                <button
                  type="submit"
                  disabled={busy}
                  aria-label="Continue"
                  className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#F27D26] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {magicLinkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {error && <p className="text-sm text-red-500 mb-3 text-center">{error}</p>}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#d4d4d4]" />
              <span className="text-xs text-[#aaa]">or</span>
              <div className="flex-1 h-px bg-[#d4d4d4]" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 py-2 rounded-xl border border-[#d4d4d4] text-sm text-[#111] hover:border-[#aaa] transition-colors disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
              {googleLoading ? 'Connecting…' : 'Continue with Google'}
            </button>

            <button
              type="button"
              onClick={() => togglePasswordMode(true)}
              className="mt-4 w-full text-xs text-[#aaa] underline hover:text-[#111] transition-colors text-center"
            >
              Use a password instead
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-[#111] mb-1">
              {mode === 'signup' ? 'The Voice of the Poet' : 'Sign-in to listen'}
            </h2>
            <p className="text-sm text-[#888] mb-3">
              {mode === 'signup' ? 'Free to join, takes less than a minute.' : 'Welcome back.'}
            </p>

            <form onSubmit={mode === 'signup' ? handleSignup : handleSignin} className="space-y-2.5">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-0.5">
                    <label className="text-xs text-[#aaa] uppercase tracking-widest">Name</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={busy}
                      className="w-full bg-transparent border-b border-[#d4d4d4] py-1.5 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-xs text-[#aaa] uppercase tracking-widest">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={busy}
                      className="w-full bg-transparent border-b border-[#d4d4d4] py-1.5 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-0.5">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="w-full bg-transparent border-b border-[#d4d4d4] py-1.5 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  className="w-full bg-transparent border-b border-[#d4d4d4] py-1.5 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              {mode === 'signup' && (
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    disabled={busy}
                    className="mt-0.5 accent-[#F27D26]"
                  />
                  <span className="text-xs text-[#888] leading-snug">
                    Email me with new poems, updates, and blog posts.
                  </span>
                </label>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-[#F27D26] text-black text-sm font-medium hover:bg-[#e06d1a] transition-colors disabled:opacity-50"
              >
                {loading ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : mode === 'signup' ? 'Start Listening' : 'Sign In'}
              </button>
            </form>

            <p className="mt-3 text-xs text-[#aaa] text-center">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('signin'); setError('') }} className="text-[#F27D26] hover:underline">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button onClick={() => { setMode('signup'); setError('') }} className="text-[#F27D26] hover:underline">
                    Create an account
                  </button>
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => togglePasswordMode(false)}
              className="mt-2 w-full text-xs text-[#aaa] underline hover:text-[#111] transition-colors text-center"
            >
              Just email me a sign-in link
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
