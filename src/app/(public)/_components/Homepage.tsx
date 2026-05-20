'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar'
import BentoGrid from './BentoGrid'
import AnimatedCardTitle from '@/components/AnimatedCardTitle'

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
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (headingPulseRef.current) clearTimeout(headingPulseRef.current)
    setHeadingPulsed(true)
    headingPulseRef.current = setTimeout(() => setHeadingPulsed(false), 50)
  }, [headingText])

  const handleHover = (label: string | null) => {
    setHeadingText(label ?? 'Kismet Krystle')
  }

  const headingStyle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'clamp(35px, 11vw, 175px)',
    lineHeight: 1,
    fontWeight: 700,
    color: '#111',
    letterSpacing: '-0.01em',
    marginBottom: '-0.35em',
    whiteSpace: 'nowrap',
  }

  return (
    <main className="min-h-screen md:h-screen md:overflow-hidden bg-[#f5f5f5] flex flex-col">
      <Navbar user={user} />

      <div className="h-20 flex-shrink-0" />

      <div className="px-4 flex-shrink-0 text-center overflow-visible relative z-0">
        <h1 style={headingStyle}>
          <AnimatedCardTitle subtle isHovered={headingPulsed}>
            {headingText}
          </AnimatedCardTitle>
        </h1>
      </div>

      <div className="flex-1 md:min-h-0 md:overflow-hidden px-4 relative z-10">
        <BentoGrid
          user={user}
          hasPurchase={hasPurchase}
          onHover={handleHover}
        />
      </div>

      <footer className="relative flex-shrink-0 py-4 text-center text-xs text-[#aaa]">
        Krystle Wilson © 2026
      </footer>
    </main>
  )
}
