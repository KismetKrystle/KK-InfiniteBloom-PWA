'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Navbar from './Navbar'
import BentoGrid from './BentoGrid'
import HeroSection from './HeroSection'

interface User {
  id: string
  name: string | null
  email: string
}

interface HomepageProps {
  user: User | null
  hasPurchase: boolean
}

export default function Homepage({ user, hasPurchase }: HomepageProps) {
  const [headingText, setHeadingText] = useState('Kismet Krystle')
  const [headingPulsed, setHeadingPulsed] = useState(false)
  const headingPulseRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Arriving from another page via the navbar logo (?section=bento) should
  // land past the hero, on the bento grid, instead of at the top. Browsers
  // auto-restore the last scroll position for a URL on load by default,
  // which would otherwise cause that same jump on every plain visit too —
  // take manual control so it only happens when the flag says so.
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    if (new URLSearchParams(window.location.search).get('section') === 'bento') {
      window.scrollTo(0, 520)
      window.history.replaceState(null, '', window.location.pathname)
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (headingPulseRef.current) clearTimeout(headingPulseRef.current)
    setHeadingPulsed(true)
    headingPulseRef.current = setTimeout(() => setHeadingPulsed(false), 50)
  }, [headingText])

  const handleHover = (label: string | null) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return
    if (resetRef.current) clearTimeout(resetRef.current)
    if (label !== null) {
      setHeadingText(label)
    } else {
      resetRef.current = setTimeout(() => setHeadingText('Kismet Krystle'), 150)
    }
  }

  return (
    // Extra height below the viewport gives the page something to actually
    // scroll through while the hero overlay fades — the landing page itself
    // stays pinned (sticky) at the top the whole time, unchanged underneath.
    <div className="relative" style={{ height: 'calc(100vh + 600px)' }}>
      <HeroSection />

      <div className="sticky top-0">
        <main className="h-screen overflow-hidden bg-[#f5f5f5] flex flex-col">
          <Navbar user={user} />

          <div className="h-16 flex-shrink-0" />

          <div className="flex-1 min-h-0 overflow-hidden px-4">
            <BentoGrid
              user={user}
              hasPurchase={hasPurchase}
              onHover={handleHover}
              headingText={headingText}
              headingPulsed={headingPulsed}
            />
          </div>

          <footer className="relative flex-shrink-0 py-4 text-center text-xs text-[#aaa]">
            Krystle Wilson © 2026
          </footer>
        </main>
      </div>
    </div>
  )
}
