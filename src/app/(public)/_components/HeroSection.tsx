'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import RandomInsightCard from './RandomInsightCard'

// 7 rows, opacity peaking at the true center (row 4), fading symmetrically
// outward through the surrounding roles. Directions alternate, anchored so
// the center row scrolls left.
const ROWS: { direction: 'left' | 'right'; opacity: number; word: string }[] = [
  { direction: 'right', opacity: 0.2, word: 'POET' },
  { direction: 'left', opacity: 0.4, word: 'KISMET' },
  { direction: 'right', opacity: 0.6, word: 'SPEAKER' },
  { direction: 'left', opacity: 1, word: 'KISMET' },
  { direction: 'right', opacity: 0.6, word: 'AUTHOR' },
  { direction: 'left', opacity: 0.4, word: 'KISMET' },
  { direction: 'right', opacity: 0.2, word: 'ENTREPRENEUR' },
]

function repeatWord(word: string): string {
  return Array(20).fill(word).join('        ')
}

// 35s at full speed, slowed to 35% of that (-65%), then slowed a further
// 25%, then a further 10% on top of that — duration scales inversely with
// speed at each step.
const LOOP_DURATION_S = 35 / 0.35 / 0.75 / 0.9

const FADE_START_PX = 200
const FADE_END_PX = 500

export default function HeroSection() {
  const [fadeOpacity, setFadeOpacity] = useState(1)
  const tickingRef = useRef(false)

  useEffect(() => {
    function computeOpacity() {
      const y = window.scrollY
      if (y <= FADE_START_PX) return 1
      if (y >= FADE_END_PX) return 0
      return 1 - (y - FADE_START_PX) / (FADE_END_PX - FADE_START_PX)
    }
    function onScroll() {
      if (tickingRef.current) return
      tickingRef.current = true
      requestAnimationFrame(() => {
        setFadeOpacity(computeOpacity())
        tickingRef.current = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      className="fixed inset-0 z-[100] overflow-hidden bg-black pointer-events-none"
      style={{ opacity: fadeOpacity, transition: 'opacity 100ms linear' }}
    >
      {/* Background photo, true color */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-kismet.jpg')" }}
      />

      {/* Running "KISMET" banner */}
      <div className="absolute inset-0 flex flex-col justify-center">
        {ROWS.map((row, i) => (
          <div key={i} className="shrink-0 overflow-hidden" style={{ opacity: row.opacity }}>
            <div
              className="flex w-max whitespace-nowrap"
              style={{
                animation: `${row.direction === 'left' ? 'marqueeLeft' : 'marqueeRight'} ${LOOP_DURATION_S}s linear infinite`,
              }}
            >
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  aria-hidden={copy === 1}
                  className="shrink-0 pr-12 font-bold text-white"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(72px, 12vw, 120px)',
                    lineHeight: 0.85,
                  }}
                >
                  {repeatWord(row.word)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Random insight, centered over the banner */}
      <RandomInsightCard />

      {/* Scroll-down hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <span
          className="text-xs uppercase tracking-widest text-white/80"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Scroll
        </span>
        <ChevronDown className="w-6 h-6 text-white/80" />
      </div>
    </section>
  )
}
