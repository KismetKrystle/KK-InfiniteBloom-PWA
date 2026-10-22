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
    <div className="h-dvh flex flex-col bg-white">
      {!isFullScreen && (
        <header className="h-12 shrink-0 flex items-center justify-between gap-3 px-4 border-b border-[#e5e2da] bg-[#f5f3ed]">
          <a
            href="https://www.kismetkrystle.com"
            className="text-xs text-[#555] hover:text-[#111] transition-colors whitespace-nowrap"
          >
            ← <span className="hidden sm:inline">kismetkrystle.com</span>
            <span className="sm:hidden">Home</span>
          </a>
          <span className="text-[10px] tracking-[0.25em] text-[#555] truncate">THE INFINITE BLOOM</span>
          <div className="flex items-center gap-1">
            {/* Mounted for the page's lifetime so it catches the one-time
                beforeinstallprompt event; renders nothing unless installable. */}
            <div className="mr-1">
              <PWAInstallButton />
            </div>
            <button
              onClick={() => setIsFullScreen(true)}
              aria-label="Full screen"
              title="Full screen"
              className="p-2 text-[#555] hover:text-[#111] transition-colors"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <ReaderAccountMenu user={user} />
          </div>
        </header>
      )}

      <div className={isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'relative flex-1 min-h-0'}>
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
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-[#111] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
          {reflectionCount ? (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#2180c6] text-[10px] font-medium flex items-center justify-center">
              {reflectionCount > 99 ? '99+' : reflectionCount}
            </span>
          ) : null}
        </button>
      )}

      <Sheet open={reflectionsOpen} onOpenChange={setReflectionsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b border-[#eee]">
            <SheetTitle>Reflections</SheetTitle>
            <SheetDescription>What stayed with other readers — and a place to leave yours.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-6">
            <ExperienceShareDialog userEmail={user.email} userName={user.name} />
            <CommentSection context="flipbook" prompt="What stayed with you?" user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
