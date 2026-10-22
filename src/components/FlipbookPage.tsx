'use client'

import { useState, useRef, useEffect } from 'react'
import { Maximize, Minimize, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import ExperienceShareDialog from './ExperienceShareDialog'
import CommentSection from './CommentSection'
import ReaderAccountMenu from './ReaderAccountMenu'
import PWAInstallButton from './PWAInstallButton'

interface FlipbookPageProps {
  user: { id: string; name: string | null; email: string }
  bookSlug: string
}

// Only buyers ever reach this component (see app/(public)/flipbook/page.tsx),
// so the book fills the screen and everything else is tucked away: account
// actions in the top-right menu, Reflections behind the floating bubble.
export default function FlipbookPage({ user, bookSlug }: FlipbookPageProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [reflectionsOpen, setReflectionsOpen] = useState(false)
  const [reflectionCount, setReflectionCount] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    fetch('/api/comments?context=flipbook')
      .then((r) => r.json())
      .then((data) => setReflectionCount(Array.isArray(data.comments) ? data.comments.length : null))
      .catch(() => {})
  }, [])

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

  // Offline reading — scoped so it can never intercept anything outside the
  // book reader (see flipbook-sw.js and the flipbook-content route).
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/flipbook-sw.js', { scope: '/flipbook-content/' }).catch(() => {})
    }
  }, [])

  return (
    <div className="kk h-dvh flex flex-col">
      {!isFullScreen && (
        <header className="shrink-0 flex items-center gap-4 min-h-[56px] px-4 sm:px-7 border-b kk-rule">
          <a
            href="https://www.kismetkrystle.com"
            className="text-[17px] sm:text-[20px] font-black tracking-[-1px] whitespace-nowrap"
          >
            KISMET / KRYSTLE
          </a>
          <span className="kk-micro hidden md:inline border-l kk-rule pl-4">The Infinite Bloom / Reader</span>
          <div className="ml-auto flex items-center gap-1">
            {/* Mounted for the page's lifetime so it catches the one-time
                beforeinstallprompt event; renders nothing unless installable. */}
            <div className="mr-2">
              <PWAInstallButton />
            </div>
            <button
              onClick={() => setIsFullScreen(true)}
              aria-label="Full screen"
              title="Full screen"
              className="p-2 hover:text-[var(--kk-blue)] transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <ReaderAccountMenu user={user} />
          </div>
        </header>
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
      </div>

      {!isFullScreen && (
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
    </div>
  )
}
