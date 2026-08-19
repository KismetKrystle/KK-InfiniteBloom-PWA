'use client'

import { useState, useEffect, useRef } from 'react'

// 9 rows, opacity peaking at the true center (row 5), fading symmetrically
// outward. Directions alternate, anchored so the center row scrolls left.
const ROWS: { direction: 'left' | 'right'; opacity: number }[] = [
  { direction: 'left', opacity: 0.1 },
  { direction: 'right', opacity: 0.2 },
  { direction: 'left', opacity: 0.4 },
  { direction: 'right', opacity: 0.6 },
  { direction: 'left', opacity: 1 },
  { direction: 'right', opacity: 0.6 },
  { direction: 'left', opacity: 0.4 },
  { direction: 'right', opacity: 0.2 },
  { direction: 'left', opacity: 0.1 },
]

const WORD_REPEAT = Array(20).fill('KISMET').join('        ')

// 35s at full speed, slowed to 35% of that (-65%), then slowed a further 25%
// on top of that — duration scales inversely with speed at each step.
const LOOP_DURATION_S = 35 / 0.35 / 0.75

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
                  {WORD_REPEAT}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
