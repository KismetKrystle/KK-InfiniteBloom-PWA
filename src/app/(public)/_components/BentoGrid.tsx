'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import ContactOverlay from './ContactOverlay'
import PricingOverlay from './PricingOverlay'
import AboutOverlay from './AboutOverlay'
import SignInOverlay from './SignInOverlay'

interface User {
  id: string
  name: string | null
  email: string
}

interface BentoGridProps {
  user: User | null
  hasPurchase: boolean
  onHover: (label: string | null) => void
}

function BentoCard({
  children,
  className = '',
  onClick,
  accent = false,
  hoverLabel,
  onHover,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  accent?: boolean
  hoverLabel?: string
  onHover?: (label: string | null) => void
}) {
  const [hovered, setHovered] = useState(false)

  const isFinePointer = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

  const handleEnter = () => {
    setHovered(true)
    if (onHover && hoverLabel && isFinePointer()) onHover(hoverLabel)
  }
  const handleLeave = () => {
    setHovered(false)
    if (onHover && isFinePointer()) onHover(null)
  }

  const bg = accent
    ? hovered ? 'rgba(232, 112, 31, 0.92)' : 'rgba(242, 125, 38, 0.85)'
    : hovered ? 'rgba(227, 227, 227, 0.85)' : 'rgba(235, 235, 235, 0.75)'

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        background: bg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'background 150ms ease',
      }}
      className={[
        'relative rounded-[32px] border flex flex-col overflow-hidden min-h-[160px] md:min-h-0',
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
}: {
  label: string
  sub?: string
  accent?: boolean
  light?: boolean
}) {
  const labelColor = accent ? 'black' : light ? 'white' : '#111'
  const subColor = accent ? 'rgba(0,0,0,0.6)' : light ? 'rgba(255,255,255,0.7)' : '#888'

  return (
    <div className="mt-auto p-5 pt-2 relative z-10">
      <p
        className="leading-snug md:group-hover:animate-[labelPop_300ms_ease-in-out]"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(18px, 1.5vw, 22px)',
          fontWeight: 500,
          color: labelColor,
        }}
      >
        {label}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: subColor }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function BentoGrid({ user, hasPurchase, onHover }: BentoGridProps) {
  const router = useRouter()
  const [contactOpen, setContactOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  const anyOverlayOpen = contactOpen || pricingOpen || aboutOpen || signInOpen

  const handleAccess = () => {
    if (!user) { setSignInOpen(true); return }
    if (hasPurchase) { router.push('/flipbook'); return }
    setPricingOpen(true)
  }

  const handleAudio = () => {
    if (!user) { setSignInOpen(true); return }
    router.push('/flipbook')
  }

  return (
    <>
      <div
        style={{ opacity: anyOverlayOpen ? 0.3 : 1, transition: 'opacity 220ms ease-out' }}
        className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-4 gap-[10px] md:h-full"
      >

        {/* About — mobile: col-span-2, row 1 | desktop: col 1, rows 1–2 */}
        <BentoCard
          className="col-span-2 md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3"
          onClick={() => setAboutOpen(true)}
          hoverLabel="About"
          onHover={onHover}
        >
          <img
            src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg"
            alt="Kismet Krystle"
            className="absolute top-4 right-4 w-16 h-16 md:w-28 md:h-28 rounded-full object-cover object-top"
          />
          <CardLabel label="About" sub="Poet · author · speaker" />
        </BentoCard>

        {/* Access — mobile: col-span-2, row 2 | desktop: cols 2–4, rows 1–2 */}
        <BentoCard
          className="col-span-2 md:col-start-2 md:col-end-5 md:row-start-1 md:row-end-3"
          onClick={handleAccess}
          hoverLabel="Access"
          onHover={onHover}
        >
          {/* Mobile: right-aligned | Desktop: centered */}
          <div className="absolute inset-0 flex items-center justify-end md:justify-center p-4 md:p-0 pointer-events-none">
            <img
              src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1779156322/book_at_angle-v2_bg-removed_aqt9d7.png"
              alt="The Infinite Bloom"
              className="h-[65%] md:h-[70%] w-auto object-contain"
            />
          </div>
          {/* Gradient behind label */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{ height: '35%', background: 'linear-gradient(to top, rgba(235,235,235,0.95) 0%, transparent 100%)' }}
          />
          <CardLabel label="Access Book" sub="Digital flipbook · audio · reflections" />
        </BentoCard>

        {/* Audio — mobile: col 1, row 3 | desktop: cols 1–2, rows 3–4 */}
        <BentoCard
          className="md:col-start-1 md:col-end-3 md:row-start-3 md:row-end-5"
          onClick={handleAudio}
          hoverLabel="Audio Poems"
          onHover={onHover}
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
          <CardLabel label="Audio poems" />
        </BentoCard>

        {/* Events — mobile: col 2, row 3 | desktop: col 3, rows 3–4 (swapped with Get the Book) */}
        <BentoCard
          className="md:col-start-3 md:col-end-4 md:row-start-3 md:row-end-5"
          hoverLabel="Events"
          onHover={onHover}
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
          <CardLabel light label="Events" />
        </BentoCard>

        {/* Get the Book — mobile: col 1, row 4 | desktop: col 4, row 3 (swapped with Events) */}
        <BentoCard
          accent
          className="md:col-start-4 md:col-end-5 md:row-start-3 md:row-end-4"
          onClick={() => setPricingOpen(true)}
          hoverLabel="Get the Book"
          onHover={onHover}
        >
          <CardLabel accent label="Get the book" />
        </BentoCard>

        {/* Contact — mobile: col 2, row 4 | desktop: col 4, row 4 */}
        <BentoCard
          className="md:col-start-4 md:col-end-5 md:row-start-4 md:row-end-5"
          onClick={() => setContactOpen(true)}
          hoverLabel="Contact"
          onHover={onHover}
        >
          <CardLabel label="Contact" />
        </BentoCard>

      </div>

      {contactOpen && <ContactOverlay onClose={() => setContactOpen(false)} />}
      {pricingOpen && <PricingOverlay onClose={() => setPricingOpen(false)} />}
      {aboutOpen   && <AboutOverlay   onClose={() => setAboutOpen(false)}   />}
      {signInOpen  && <SignInOverlay  onClose={() => setSignInOpen(false)}  />}
    </>
  )
}
