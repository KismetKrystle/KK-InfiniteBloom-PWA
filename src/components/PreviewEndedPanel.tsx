'use client'

import { useState } from 'react'
import CodeSignInForm from './CodeSignInForm'
import SignOutButton from './SignOutButton'
import KKArrow from './KKArrow'
import { BOOK_PAYMENT_LINK } from '@/lib/book-links'

// Shown over the reader once the 2-minute preview is used up. Not
// dismissible: the only ways forward are buying or signing in as a buyer.
export default function PreviewEndedPanel({
  user,
  onClose,
}: {
  user: { email: string } | null
  onClose?: () => void
}) {
  const [signingIn, setSigningIn] = useState(false)

  return (
    <div className="kk absolute inset-0 z-20 overflow-y-auto bg-[var(--kk-paper)]/95 backdrop-blur-sm flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-7">
        <div className="space-y-4">
          <span className="kk-micro block">Preview ended</span>
          <h2 className="kk-display text-[clamp(48px,11vw,72px)]">
            KEEP
            <br />
            <span className="kk-blue">READING.</span>
          </h2>
          <p className="text-[15px] leading-[1.65] text-[var(--kk-muted)]">
            Get your copy of The Infinite Bloom — all 45 poems, with Kismet reading every one aloud as you turn the
            pages.
          </p>
        </div>

        <a href={BOOK_PAYMENT_LINK} className="kk-solid w-full">
          Get your copy · $20 <KKArrow />
        </a>

        <div className="border-t kk-rule pt-6 space-y-4">
          {user ? (
            <>
              <p className="text-sm leading-relaxed text-[var(--kk-muted)]">
                You&apos;re signed in as <span className="text-[var(--kk-ink)]">{user.email}</span>, but there&apos;s
                no purchase for that email. Bought it with a different one? Sign out and use that email.
              </p>
              <SignOutButton />
            </>
          ) : signingIn ? (
            <CodeSignInForm next="/flipbook" />
          ) : (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="text-sm text-[var(--kk-muted)]">Already bought it?</span>
              <button type="button" onClick={() => setSigningIn(true)} className="kk-text-link">
                Sign in to keep reading
              </button>
            </div>
          )}
        </div>

        {onClose && (
          <button type="button" onClick={onClose} className="kk-text-link text-xs">
            Exit full screen
          </button>
        )}
      </div>
    </div>
  )
}
