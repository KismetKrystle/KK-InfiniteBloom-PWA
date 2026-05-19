'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import BentoGrid from './BentoGrid'

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <main className="min-h-screen md:h-screen md:overflow-hidden bg-[#f5f5f5] flex flex-col">
      <Navbar user={user} />

      {/* Title — Oswald 175px desktop, scales down to fit one line on mobile */}
      <div className="px-4 flex-shrink-0 text-center overflow-visible relative z-0">
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(35px, 11vw, 175px)',
            lineHeight: 1,
            fontWeight: 700,
            color: '#111',
            letterSpacing: '-0.01em',
            marginBottom: '-0.4em',
            whiteSpace: 'nowrap',
            transform: hoveredCard ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'transform 200ms ease-out',
          }}
        >
          {hoveredCard ?? 'Kismet Krystle'}
        </h1>
      </div>

      {/* Grid — z-10 so cards paint over the title text */}
      <div className="flex-1 md:min-h-0 md:overflow-hidden px-4 relative z-10">
        <BentoGrid
          user={user}
          hasPurchase={hasPurchase}
          onHover={setHoveredCard}
        />
      </div>

      <footer className="relative z-10 py-4 text-center text-xs text-[#aaa]">
        Krystle Wilson © 2026
      </footer>
    </main>
  )
}
