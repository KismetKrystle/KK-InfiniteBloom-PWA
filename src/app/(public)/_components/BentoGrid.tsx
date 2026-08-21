'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import ContactOverlay from './ContactOverlay'
import PricingOverlay from './PricingOverlay'
import AboutOverlay from './AboutOverlay'
import AnimatedCardTitle from '@/components/AnimatedCardTitle'

interface User {
  id: string
  name: string | null
  email: string
}

interface BentoGridProps {
  user: User | null
  hasPurchase: boolean
  onHover: (label: string | null) => void
  headingText: string
  headingPulsed: boolean
}

function BentoCard({
  children,
  className = '',
  onClick,
  accent = false,
  hoverLabel,
  onHover,
  onHoveredChange,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: boolean
  hoverLabel?: string
  onHover?: (label: string | null) => void
  onHoveredChange?: (hovered: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)

  const isFinePointer = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  const handleEnter = () => {
    setHovered(true)
    onHoveredChange?.(true)
    if (onHover && hoverLabel && isFinePointer()) onHover(hoverLabel)
  }
  const handleLeave = () => {
    setHovered(false)
    onHoveredChange?.(false)
    if (onHover && isFinePointer()) onHover(null)
  }
  const handleTouchStart = () => {
    if (onHover && hoverLabel) onHover(hoverLabel)
  }

  const bg = accent
    ? hovered ? 'rgba(250, 160, 75, 0.95)' : 'rgba(242, 125, 38, 0.85)'
    : hovered ? 'rgba(245, 245, 245, 0.95)' : 'rgba(224, 224, 224, 0.85)'

  const shadow = hovered
    ? '0 12px 40px rgba(0,0,0,0.14)'
    : '0 2px 8px rgba(0,0,0,0.06)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTouchStart}
      style={{
        background: bg,
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        boxShadow: shadow,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease-out, transform 200ms ease-out, background 150ms ease',
      }}
      className={[
        'relative rounded-[29px] md:rounded-[32px] border flex flex-col overflow-hidden min-h-0',
        'cursor-pointer select-none group',
        accent ? 'border-[#F27D26]' : 'border-[#d4d4d4]',
        className,
      ].join(' ')}
    >
      <ArrowUpRight
        className={[
          'absolute top-4 right-4 w-4 h-4 transition-opacity duration-150',
          'opacity-0 group-hover:opacity-100',
          accent ? 'text-black/60' : 'text-[#888]',
        ].join(' ')}
      />
      {children}
    </div>
  )
}

function CardLabel({
  label,
  sub,
  accent = false,
  light = false,
  animated = false,
  isHovered = false,
}: {
  label: string
  sub?: string
  accent?: boolean
  light?: boolean
  animated?: boolean
  isHovered?: boolean
}) {
  const labelColor = accent ? 'black' : light ? 'white' : '#111'
  const subColor = accent ? 'rgba(0,0,0,0.6)' : light ? 'rgba(255,255,255,0.7)' : '#888'

  return (
    <div className="mt-auto p-5 pt-2 relative z-10">
      <p
        className="leading-snug"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(18px, 1.5vw, 22px)',
          fontWeight: 500,
          color: labelColor,
        }}
      >
        {animated ? <AnimatedCardTitle isHovered={isHovered}>{label}</AnimatedCardTitle> : label}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: subColor }}>
          {sub}
        </p>
      )}
    </div>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 'clamp(35px, 11vw, 175px)',
  lineHeight: 1,
  fontWeight: 700,
  color: '#111',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
  textAlign: 'center',
}

export default function BentoGrid({ user, hasPurchase, onHover, headingText, headingPulsed }: BentoGridProps) {
  const router = useRouter()
  const [contactOpen, setContactOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutHovered, setAboutHovered] = useState(false)
  const [accessHovered, setAccessHovered] = useState(false)
  const [audioHovered, setAudioHovered] = useState(false)
  const [eventsHovered, setEventsHovered] = useState(false)
  const [blogHovered, setBlogHovered] = useState(false)
  const [contactHovered, setContactHovered] = useState(false)
  const [getBookHovered, setGetBookHovered] = useState(false)

  const anyOverlayOpen = contactOpen || pricingOpen || aboutOpen

  // Deep link from the flipbook paywall CTA (?pricing=open) — auto-open the purchase overlay.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pricing') === 'open') {
      setPricingOpen(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const handleAccess = () => {
    router.push('/flipbook')
  }

  const handleAudio = () => {
    router.push('/audio')
  }

  return (
    <>
      <div
        style={{ opacity: anyOverlayOpen ? 0.3 : 1, transition: 'opacity 220ms ease-out' }}
        className="flex flex-col h-full"
      >

        {/* Top grid: About + Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-1 gap-[10px] flex-1 min-h-0">

          {/* About */}
          <BentoCard
            className="col-span-2 md:col-span-1"
            onClick={() => setAboutOpen(true)}
            hoverLabel="About"
            onHover={onHover}
            onHoveredChange={setAboutHovered}
          >
            <img
              src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg"
              alt="Kismet Krystle"
              className="absolute top-9 right-4 w-20 h-20 md:w-36 md:h-36 rounded-full object-cover object-top"
            />
            <CardLabel label="About" sub="Poet · Author · Speaker · Entrepeneur" animated isHovered={aboutHovered} />
          </BentoCard>

          {/* Access */}
          <BentoCard
            className="col-span-2 md:col-span-3"
            onClick={handleAccess}
            hoverLabel="Access"
            onHover={onHover}
            onHoveredChange={setAccessHovered}
          >
            <div className="absolute inset-0 flex items-center justify-end md:justify-center p-4 md:p-0 pointer-events-none">
              <img
                src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1779156322/book_at_angle-v2_bg-removed_aqt9d7.png"
                alt="The Infinite Bloom"
                className="h-[65%] md:h-[70%] w-auto object-contain"
              />
            </div>
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{ height: '35%', background: 'linear-gradient(to top, rgba(235,235,235,0.95) 0%, transparent 100%)' }}
            />
            <CardLabel label="Access Book" sub="Digital Flipbook" animated isHovered={accessHovered} />
          </BentoCard>

        </div>

        {/* Heading */}
        <div className="text-center py-4 flex-shrink-0">
          <h1 style={headingStyle}>
            <AnimatedCardTitle subtle isHovered={headingPulsed}>
              {headingText}
            </AnimatedCardTitle>
          </h1>
        </div>

        {/* Bottom grid: Audio + Events + Blog + Contact */}
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-[10px] flex-1 min-h-0">

          {/* Audio */}
          <BentoCard
            className="col-span-1 md:col-span-2 md:row-span-2"
            onClick={handleAudio}
            hoverLabel="Audio Poems"
            onHover={onHover}
            onHoveredChange={setAudioHovered}
          >
            <div className="flex-1 flex items-end p-5 pb-3">
              <div className="flex items-end gap-[3px]">
                {[5, 9, 13, 8, 11, 6, 10, 14, 7, 12, 8, 10, 6, 13, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-[#F27D26] origin-bottom"
                    style={{
                      height: `${h * 3}px`,
                      opacity: user ? 1 : 0.35,
                      animation: user
                        ? `audioBar ${0.8 + (i % 3) * 0.3}s ease-in-out ${i * 0.08}s infinite alternate`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
            <CardLabel label="Audio Poems" animated isHovered={audioHovered} />
          </BentoCard>

          {/* Events */}
          <BentoCard
            className="col-span-1 md:col-span-1 md:row-span-2"
            hoverLabel="Events"
            onHover={onHover}
            onHoveredChange={setEventsHovered}
          >
            <video
              src="https://res.cloudinary.com/dsoojlgg1/video/upload/v1779179503/kismet-ase-2025_b7npxb.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{ height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
            />
            <CardLabel light label="Events" animated isHovered={eventsHovered} />
          </BentoCard>

          {/* Blog */}
          <BentoCard
            className="col-span-1 md:col-span-1"
            onClick={() => router.push('/blog')}
            hoverLabel="Blog"
            onHover={onHover}
            onHoveredChange={setBlogHovered}
          >
            <CardLabel label="Blog" animated isHovered={blogHovered} />
          </BentoCard>

          {/* Contact */}
          <BentoCard
            className="col-span-1 md:col-span-1"
            onClick={() => setContactOpen(true)}
            hoverLabel="Contact"
            onHover={onHover}
            onHoveredChange={setContactHovered}
          >
            <CardLabel label="Contact & Follow" animated isHovered={contactHovered} />
          </BentoCard>

        </div>

        {/* Get Book — full-width bar */}
        <BentoCard
          accent
          className="flex-shrink-0 mt-[10px]"
          onClick={() => setPricingOpen(true)}
          hoverLabel="Buy Book"
          onHover={onHover}
          onHoveredChange={setGetBookHovered}
        >
          <div className="flex-1 flex items-center justify-center py-4 px-5">
            <p
              className="text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(22px, 3.2vw, 35px)',
                fontWeight: 700,
                color: 'white',
              }}
            >
              <AnimatedCardTitle isHovered={getBookHovered}>Buy Book</AnimatedCardTitle>
            </p>
          </div>
        </BentoCard>

      </div>

      {contactOpen && <ContactOverlay onClose={() => setContactOpen(false)} />}
      {pricingOpen && <PricingOverlay onClose={() => setPricingOpen(false)} user={user} />}
      {aboutOpen   && <AboutOverlay   onClose={() => setAboutOpen(false)}   />}
    </>
  )
}
