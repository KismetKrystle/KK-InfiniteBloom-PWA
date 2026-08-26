'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { HelpCircle, Maximize, ExternalLink, X, User, Mail } from 'lucide-react'
import { ImageWithFallback } from './figma/ImageWithFallback'

import ExperienceShareDialog from './ExperienceShareDialog'
import PromptJournal from './PromptJournal'
import SharedNavbar from './SharedNavbar'
import FlipbookNavbar from './FlipbookNavbar'
import CommentSection from './CommentSection'
import PWAInstallButton from './PWAInstallButton'

// Must match PREVIEW_HEARTBEAT_TICK_S in src/lib/flipbook-access.ts — the
// server is the source of truth for the actual budget, this just paces how
// often the client checks in.
const HEARTBEAT_TICK_MS = 5_000
const GRACE_PERIOD_MS = 10_000
const SHOW_WRITE_REFLECT = false

interface FlipbookPageProps {
  user: { id: string; name: string | null; email: string } | null
  hasPurchased: boolean
  bookSlug: string
}

export default function FlipbookPage({ user, hasPurchased, bookSlug }: FlipbookPageProps) {
  const router = useRouter()
  const [showReflectionsInfo, setShowReflectionsInfo] = useState(false)
  const [showFlipbook, setShowFlipbook] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Preview state — unused when hasPurchased
  const [interactionCaptured, setInteractionCaptured] = useState(false)
  const [paywallActive, setPaywallActive] = useState(false)
  const [previewExpired, setPreviewExpired] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const graceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (graceRef.current) clearTimeout(graceRef.current)
    }
  }, [])

  // When FlipHTML5 triggers native browser fullscreen on the iframe, the browser hides
  // everything outside it — including our fixed icons. Intercept it and switch to our
  // custom fullscreen instead, where our UI stays visible.
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

  // Offline reading for purchasers only — scoped so it can never intercept
  // anything outside the book reader, and it only ever caches responses the
  // server already marked long-lived for a purchased viewer (see
  // flipbook-sw.js and the flipbook-content route).
  useEffect(() => {
    if (hasPurchased && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/flipbook-sw.js', { scope: '/flipbook-content/' }).catch(() => {})
    }
  }, [hasPurchased])

  async function handleOpenBook() {
    if (!hasPurchased) {
      try {
        const res = await fetch(`/api/flipbook/preview-status?bookSlug=${encodeURIComponent(bookSlug)}`)
        const data = await res.json()
        if (data.expired) {
          setPreviewExpired(true)
          setPaywallActive(true)
        }
      } catch {
        // Status check failed — fall through and let the content route's own
        // check be the source of truth instead of blocking the reader.
      }
    }
    setShowFlipbook(true)
  }

  // Only counts down while the reader is actually open in front of someone:
  // each tick is a heartbeat to the server, skipped whenever the tab is
  // backgrounded, so stepping away pauses the budget instead of burning it
  // — and since the server tracks the real total against the cookie, coming
  // back later (even after a reload) resumes from the true remaining time
  // instead of starting over.
  async function sendHeartbeat() {
    if (document.hidden) return
    try {
      const res = await fetch('/api/flipbook/preview-heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookSlug }),
      })
      const data = await res.json()
      if (data.expired) {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setPaywallActive(true)
      }
    } catch {
      // Network hiccup — try again on the next tick.
    }
  }

  function handleFirstInteraction() {
    setInteractionCaptured(true)
    graceRef.current = setTimeout(() => {
      countdownRef.current = setInterval(sendHeartbeat, HEARTBEAT_TICK_MS)
    }, GRACE_PERIOD_MS)
  }

  // Stops the heartbeat and resets local preview state on close so
  // reopening re-derives paywallActive fresh from the server via
  // handleOpenBook, instead of carrying stale in-memory state forward.
  function closeFlipbook() {
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (graceRef.current) clearTimeout(graceRef.current)
    countdownRef.current = null
    graceRef.current = null
    setInteractionCaptured(false)
    setPaywallActive(false)
    setPreviewExpired(false)
    setShowFlipbook(false)
  }

  // Sends a would-be buyer straight to the Stripe payment screen instead of
  // back through the product page — one less click between "I want this"
  // and paying. Anonymous visitors still need an account first, since
  // checkout is tied to a signed-in user.
  async function handleGetCopy() {
    if (!user) {
      router.push('/login')
      return
    }
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType: 'flipbook' }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not start checkout')
      window.location.href = data.url
    } catch {
      router.push('/?pricing=open')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {isFullScreen
        ? <FlipbookNavbar
            user={user}
            onClose={() => setIsFullScreen(false)}
            onToggleFullScreen={() => setIsFullScreen(false)}
          />
        : <SharedNavbar user={user} />
      }

      <div className="max-w-4xl mx-auto p-4 pt-14 md:py-8 md:pt-14">
        {user && (
          <div className="mb-4 md:mb-6 text-left">
            <h2 className="text-2xl">Welcome to Infinite Bloom, </h2>
            <h2> {user.name}!</h2>
          </div>
        )}

        {!isFullScreen && (
          <div className="flex justify-end mb-4">
            <PWAInstallButton />
          </div>
        )}

        {/* Flipbook */}
        <div className="mb-4 md:mb-6">
          {showFlipbook ? (
            <div className={isFullScreen ? 'fixed inset-0 z-50 bg-black' : 'relative max-w-4xl mx-auto w-full h-80 md:h-[600px] bg-white rounded-lg overflow-hidden shadow-xl'}>
              {!isFullScreen && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  {!previewExpired && (
                    <button
                      onClick={() => setIsFullScreen(true)}
                      title="Full Screen"
                      className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  )}

                  {/* Mobile-only icons — hidden on md+ where SharedNavbar is always visible */}
                  <div className="md:hidden flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-2">
                    <button
                      onClick={closeFlipbook}
                      aria-label="Close flipbook"
                      className="flex items-center justify-center p-1 text-white/80 hover:text-white transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {user && (
                      <button
                        onClick={() => router.push('/dashboard')}
                        aria-label="Account"
                        className="flex items-center justify-center p-1 text-white/80 hover:text-white transition-opacity"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    )}
                    {user && (
                      <button
                        onClick={() => router.push('/dashboard/messages')}
                        aria-label="Messages"
                        className="flex items-center justify-center p-1 text-white/80 hover:text-white transition-opacity"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {previewExpired ? (
                /* Already know the preview's used up before ever requesting the
                   reader — show the CTA directly instead of loading an iframe
                   that would just come back with a raw "Preview expired" error. */
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <div className="relative bg-white rounded-2xl px-8 py-10 max-w-sm mx-4 text-center">
                    <button
                      onClick={closeFlipbook}
                      aria-label="Close"
                      className="absolute top-3 right-3 text-[#aaa] hover:text-[#333] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <p className="text-xs uppercase tracking-widest text-[#aaa] mb-3">Free Preview Ended</p>
                    <h3 className="text-xl font-semibold text-[#111] mb-2">Enjoyed what you read?</h3>
                    <p className="text-sm text-[#666] mb-6">Get the full Infinite Bloom experience — every poem, every page.</p>
                    <button
                      onClick={handleGetCopy}
                      disabled={checkoutLoading}
                      className="block w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#F27D26' }}
                    >
                      {checkoutLoading ? 'Redirecting…' : 'Get Your Copy'}
                    </button>
                    {!user && (
                      <p className="mt-4 text-xs text-[#aaa]">
                        Already have access?{' '}
                        <a href="/login" className="text-[#F27D26] hover:underline">Sign in</a>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <iframe
                    ref={iframeRef}
                    src={`/flipbook-content/${bookSlug}/index.html`}
                    className="w-full h-full border-0"
                    title="Infinite Bloom Flipbook"
                    allowFullScreen
                    onLoad={() => {
                      // Served same-origin through our own proxy route, so we can
                      // reach in and override the reader's default gray backdrop.
                      try {
                        const doc = iframeRef.current?.contentDocument
                        if (!doc) return
                        doc.documentElement.style.background = '#ffffff'
                        doc.body.style.background = '#ffffff'
                        const style = doc.createElement('style')
                        style.textContent = 'html, body { background: #ffffff !important; }'
                        doc.head.appendChild(style)
                      } catch {
                        // Not reachable for some reason — leave the reader's own background as-is.
                      }
                    }}
                  />

                  {/* Transparent first-interaction capture overlay — sits above iframe, below controls */}
                  {!hasPurchased && !interactionCaptured && (
                    <div
                      className="absolute inset-0 z-[5] cursor-pointer"
                      onClick={handleFirstInteraction}
                      aria-hidden="true"
                    />
                  )}

                  {/* Paywall overlay — this session's countdown ran out while reading.
                      Not dismissible: the free preview is used up, so reading stops here
                      until purchase. Closing the flipbook entirely is still possible via
                      the mobile close (X) button in the top controls. */}
                  {!hasPurchased && paywallActive && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-white/80">
                      <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-10 max-w-sm mx-4 text-center">
                        <p className="text-xs uppercase tracking-widest text-[#aaa] mb-3">Free Preview Ended</p>
                        <h3 className="text-xl font-semibold text-[#111] mb-2">Enjoyed what you read?</h3>
                        <p className="text-sm text-[#666] mb-6">Get the full Infinite Bloom experience — every poem, every page.</p>
                        <button
                          onClick={handleGetCopy}
                          disabled={checkoutLoading}
                          className="block w-full py-3 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{ backgroundColor: '#F27D26' }}
                        >
                          {checkoutLoading ? 'Redirecting…' : 'Get Your Copy'}
                        </button>
                        {!user && (
                          <p className="mt-4 text-xs text-[#aaa]">
                            Already have access?{' '}
                            <a href="/login" className="text-[#F27D26] hover:underline">Sign in</a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div
              className="relative max-w-4xl mx-auto group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
              onClick={handleOpenBook}
            >
              <ImageWithFallback
                src="/flipbook-cover.png"
                alt="Infinite Bloom - Poetry Collection"
                className="w-full h-80 md:h-[600px] object-contain rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg">
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">Open Book</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Authenticated-only: personal reflection journal */}
        {user && SHOW_WRITE_REFLECT && (
          <>
            <div className="mb-4 md:mb-6">
              <Card className="bg-white rounded-xl shadow-lg border-0">
                <CardContent className="p-4 md:p-8">
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">Write & Reflect Companion</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                        onClick={() => setShowReflectionsInfo(!showReflectionsInfo)}
                        aria-label="Toggle reflections information"
                      >
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    {showReflectionsInfo && (
                      <p className="text-sm text-muted-foreground leading-relaxed text-center">
                        Explore thoughtful prompts, capture your insights, and preserve your reflections in one place.
                        Your personal writing space for poetry, thoughts, and moments of clarity.
                      </p>
                    )}
                  </div>
                  <PromptJournal userId={user.id} />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-24 h-px bg-border"></div>
            </div>
          </>
        )}

        {/* Share and comments — open to everyone; posting a comment or
            testimonial still requires signing in (handled within each). */}
        <div className="flex justify-center mb-4">
          <ExperienceShareDialog userEmail={user?.email ?? null} userName={user?.name ?? null} />
        </div>

        <CommentSection context="flipbook" prompt="Tell us what you thought of the book." user={user} />
      </div>
    </div>
  )
}
