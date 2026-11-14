'use client'

import { useEffect, useState } from 'react'
import { Share, SquarePlus, X } from 'lucide-react'

// iPhone and iPad can't offer a one-tap install the way Android and desktop
// Chrome do (see PWAInstallButton), so iOS buyers get the manual steps
// instead. Shown once, a little way into reading; the account menu can
// bring it back.
const DISMISSED_KEY = 'ib-ios-install-tip-dismissed'
const SHOW_AFTER_MS = 30_000

export type IosInstallState = 'not-ios' | 'installed' | 'in-app-browser' | 'can-install'

export function getIosInstallState(): IosInstallState {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; touch support gives it away.
  const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  if (!isIos) return 'not-ios'

  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  if (standalone) return 'installed'

  // Instagram, Facebook, the Google app and similar open links in their own
  // browser, which has no "Add to Home Screen". Real Safari, and Chrome,
  // Firefox and Edge on iOS, can add to the home screen.
  const knownInApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|GSA\/|Twitter|LinkedInApp|Snapchat|TikTok|musical_ly/i.test(ua)
  if (knownInApp || !/Safari\//.test(ua)) return 'in-app-browser'
  return 'can-install'
}

function readDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export default function IosInstallTip({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [state, setState] = useState<IosInstallState>('not-ios')

  useEffect(() => {
    const current = getIosInstallState()
    setState(current)
    if (current === 'not-ios' || current === 'installed' || readDismissed()) return
    const timer = setTimeout(() => onOpenChange(true), SHOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [onOpenChange])

  function dismiss(forever: boolean) {
    if (forever) {
      try {
        localStorage.setItem(DISMISSED_KEY, '1')
      } catch {
        // Storage unavailable — it just shows again next visit.
      }
    }
    onOpenChange(false)
  }

  if (!open || state === 'not-ios' || state === 'installed') return null

  return (
    <div
      role="dialog"
      aria-label="Add The Infinite Bloom to your home screen"
      className="kk fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md border kk-rule shadow-2xl p-5 sm:p-6"
    >
      <button
        type="button"
        onClick={() => dismiss(false)}
        aria-label="Close"
        className="absolute top-3 right-3 p-1 text-[var(--kk-muted)] hover:text-[var(--kk-ink)]"
      >
        <X className="w-4 h-4" />
      </button>

      <span className="kk-micro block mb-2">Reading tip</span>
      <h2 className="kk-display text-[34px] mb-3">
        KEEP IT ON YOUR <span className="kk-blue">HOME SCREEN.</span>
      </h2>

      {state === 'in-app-browser' ? (
        <p className="text-sm leading-relaxed text-[var(--kk-muted)]">
          You&apos;re reading inside another app&apos;s browser, which can&apos;t add to your home screen. Open{' '}
          <span className="text-[var(--kk-ink)]">read.kismetkrystle.com</span> in <strong>Safari</strong> (look for{' '}
          <em>Open in Safari</em> in this app&apos;s <strong>⋯</strong> menu), then follow the steps there.
        </p>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-[var(--kk-muted)] mb-4">
            Open the book like an app, full screen, any time. Pages you&apos;ve read stay saved on your phone.
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="kk-micro mt-0.5">01</span>
              <span>
                Tap <strong>Share</strong> <Share className="inline w-4 h-4 -mt-1 mx-0.5" aria-hidden="true" /> in your
                browser&apos;s toolbar.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="kk-micro mt-0.5">02</span>
              <span>
                Scroll down and tap <strong>Add to Home Screen</strong>{' '}
                <SquarePlus className="inline w-4 h-4 -mt-1 mx-0.5" aria-hidden="true" />. Not there? Tap{' '}
                <em>Edit Actions</em> at the bottom to add it.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="kk-micro mt-0.5">03</span>
              <span>Open the new icon and sign in once with your email code.</span>
            </li>
          </ol>
        </>
      )}

      <button type="button" onClick={() => dismiss(true)} className="kk-text-link text-xs mt-5">
        Don&apos;t show this again
      </button>
    </div>
  )
}
