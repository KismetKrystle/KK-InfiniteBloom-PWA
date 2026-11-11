'use client'

import { useState, useRef, useEffect } from 'react'
import { Maximize, Minimize, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import ExperienceShareDialog from './ExperienceShareDialog'
import CommentSection from './CommentSection'
import ReaderAccountMenu from './ReaderAccountMenu'
import PWAInstallButton from './PWAInstallButton'
import PreviewEndedPanel from './PreviewEndedPanel'
import KKArrow from './KKArrow'
import { BOOK_LOGO_URL, BOOK_PAYMENT_LINK, MAIN_SITE_URL } from '@/lib/book-links'

// Must match PREVIEW_HEARTBEAT_TICK_S in src/lib/flipbook-access.ts — the
// server is the source of truth for the budget; this only paces check-ins.
const HEARTBEAT_TICK_MS = 5_000

interface FlipbookPageProps {
  user: { id: string; name: string | null; email: string } | null
  hasAccess: boolean
  bookSlug: string
}

function formatRemaining(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Buyers get the whole book with everything else tucked away: account
// actions in the top-right menu, Reflections behind the floating bubble.
// Everyone else gets the same reader for a 2-minute preview, then the
// "get your copy / sign in" panel.
export default function FlipbookPage({ user, hasAccess, bookSlug }: FlipbookPageProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [reflectionsOpen, setReflectionsOpen] = useState(false)
  const [reflectionCount, setReflectionCount] = useState<number | null>(null)
  const [preview, setPreview] = useState<'checking' | 'reading' | 'ended'>(hasAccess ? 'reading' : 'checking')
  const [remainingS, setRemainingS] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!hasAccess) return
    fetch('/api/comments?context=flipbook')
      .then((r) => r.json())
      .then((data) => setReflectionCount(Array.isArray(data.comments) ? data.comments.length : null))
      .catch(() => {})
  }, [hasAccess])

  // Know whether the preview is already used up before loading the reader,
  // so a returning visitor goes straight to the panel instead of a reader
  // whose pages the server will refuse.
  useEffect(() => {
    if (hasAccess) return
    fetch(`/api/flipbook/preview-status?bookSlug=${encodeURIComponent(bookSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        setRemainingS(data.remainingS ?? 0)
        setPreview(data.expired ? 'ended' : 'reading')
      })
      .catch(() => setPreview('reading'))
  }, [hasAccess, bookSlug])

  // Each heartbeat (sent only while the tab is visible) spends one tick of
  // the server-side budget; the local countdown just keeps the display
  // moving between check-ins.
  useEffect(() => {
    if (hasAccess || preview !== 'reading') return

    async function heartbeat() {
      if (document.hidden) return
      try {
        const res = await fetch('/api/flipbook/preview-heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookSlug }),
        })
        const data = await res.json()
        if (data.purchased) return
        setRemainingS(data.remainingS ?? 0)
        if (data.expired) setPreview('ended')
      } catch {
        // Network hiccup — try again on the next tick.
      }
    }

    const beat = setInterval(heartbeat, HEARTBEAT_TICK_MS)
    const tick = setInterval(() => {
      if (!document.hidden) setRemainingS((s) => Math.max(0, s - 1))
    }, 1000)
    return () => {
      clearInterval(beat)
      clearInterval(tick)
    }
  }, [hasAccess, preview, bookSlug])

  // When FlipHTML5 triggers native browser fullscreen on the iframe, the browser hides
  // everything outside it — including our exit button. Intercept it on mobile and
  // switch to our own fullscreen instead, where our controls stay visible.
  useEffect(() => {
    function onFullscreenChange() {
      const isMobile = window.innerWidth < 768
      if (document.fullscreenElement === iframeRef.current && isMobile) {
        document.exitFullscreen().catch(() => {})
        setIsFullScreen(true)
      } else if (!document.fullscreenElement && isFullScreen) {
        setIsFullScreen(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [isFullScreen])

  // Offline reading for buyers only — scoped so it can never intercept
  // anything outside the book reader (see flipbook-sw.js), and preview
  // responses are no-store so they're never written to its cache anyway.
  useEffect(() => {
    if (hasAccess && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/flipbook-sw.js', { scope: '/flipbook-content/' }).catch(() => {})
    }
  }, [hasAccess])

  // An expired preview never loads the reader at all; one that runs out
  // mid-read keeps the page underneath, covered by the panel.
  const [readerStarted, setReaderStarted] = useState(false)
  useEffect(() => {
    if (preview === 'reading') setReaderStarted(true)
  }, [preview])

  return (
    <div className="kk h-dvh flex flex-col">
      {!isFullScreen && (
        <header className="shrink-0 flex items-center gap-4 min-h-[72px] sm:min-h-[88px] px-4 sm:px-7 border-b kk-rule">
          <a href={MAIN_SITE_URL} className="flex items-center gap-4 shrink-0" title="Back to kismetkrystle.com">
            <img src={BOOK_LOGO_URL} alt="The Infinite Bloom — back to kismetkrystle.com" className="h-14 sm:h-[72px] w-auto" />
            <span className="hidden md:inline text-[20px] font-black tracking-[-1px] whitespace-nowrap">KISMET / KRYSTLE</span>
          </a>

          {!hasAccess && preview === 'reading' && (
            <div className="hidden sm:flex items-center gap-4 border-l kk-rule pl-4">
              <span className="kk-micro" aria-live="off">
                Preview · {formatRemaining(remainingS)} left
              </span>
              <a href={BOOK_PAYMENT_LINK} className="kk-text-link text-xs">
                Get your copy · $20 <KKArrow />
              </a>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            {hasAccess && (
              // Mounted for the page's lifetime so it catches the one-time
              // beforeinstallprompt event; renders nothing unless installable.
              <div className="mr-2">
                <PWAInstallButton />
              </div>
            )}
            {preview !== 'ended' && (
              <button
                onClick={() => setIsFullScreen(true)}
                aria-label="Full screen"
                title="Full screen"
                className="p-2 hover:text-[var(--kk-blue)] transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>
            )}
            {user ? (
              <ReaderAccountMenu user={user} isBuyer={hasAccess} />
            ) : (
              <a href="/login?callbackUrl=%2Fflipbook" className="kk-text-link text-xs ml-2">
                Sign in
              </a>
            )}
          </div>
        </header>
      )}

      {!hasAccess && preview === 'reading' && !isFullScreen && (
        // Phones don't have room for the countdown in the header.
        <div className="sm:hidden flex items-center justify-between px-4 py-2 border-b kk-rule">
          <span className="kk-micro">Preview · {formatRemaining(remainingS)} left</span>
          <a href={BOOK_PAYMENT_LINK} className="kk-text-link text-xs">
            Get your copy · $20
          </a>
        </div>
      )}

      <div className={isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'relative flex-1 min-h-0 bg-white'}>
        {isFullScreen && (
          <button
            onClick={() => setIsFullScreen(false)}
            aria-label="Exit full screen"
            title="Exit full screen"
            className="absolute top-3 left-3 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}
        {readerStarted && (
          <iframe
            ref={iframeRef}
            src={`/flipbook-content/${bookSlug}/index.html`}
            className="w-full h-full border-0"
            title="The Infinite Bloom"
            // The book's narration plays inside the reader.
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={() => {
              // Served same-origin through our own proxy route, so we can
              // reach in and override the reader's default gray backdrop.
              try {
                const doc = iframeRef.current?.contentDocument
                if (!doc) return
                const style = doc.createElement('style')
                style.textContent = 'html, body { background: #ffffff !important; }'
                doc.head.appendChild(style)
              } catch {
                // Not reachable for some reason — leave the reader's own background as-is.
              }
            }}
          />
        )}
        {preview === 'ended' && (
          <PreviewEndedPanel
            user={user}
            onClose={isFullScreen ? () => setIsFullScreen(false) : undefined}
          />
        )}
      </div>

      {hasAccess && !isFullScreen && (
        <button
          onClick={() => setReflectionsOpen(true)}
          aria-label={reflectionCount ? `Reflections (${reflectionCount})` : 'Reflections'}
          title="Reflections"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[var(--kk-ink)] text-[var(--kk-paper)] shadow-lg flex items-center justify-center hover:bg-[var(--kk-blue)] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {reflectionCount ? (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[var(--kk-blue)] text-white font-mono text-[10px] flex items-center justify-center">
              {reflectionCount > 99 ? '99+' : reflectionCount}
            </span>
          ) : null}
        </button>
      )}

      {hasAccess && user && (
        <Sheet open={reflectionsOpen} onOpenChange={setReflectionsOpen}>
          <SheetContent side="right" className="kk w-full sm:max-w-md overflow-y-auto gap-0 border-l kk-rule">
            <SheetHeader className="px-6 pt-6 pb-5 border-b kk-rule gap-3">
              <span className="kk-micro">The Infinite Bloom / Readers</span>
              <SheetTitle className="kk-display text-[56px] font-black">
                REFLEC<span className="kk-blue">TIONS.</span>
              </SheetTitle>
              <SheetDescription className="kk-subhead text-[17px] text-[var(--kk-muted)]">
                What stayed with other readers — and a place to leave yours.
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 py-6">
              <ExperienceShareDialog userEmail={user.email} userName={user.name} />
              <CommentSection context="flipbook" prompt="What stayed with you?" user={user} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
