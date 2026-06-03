'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface AnimatedCardTitleProps {
  children: string
  className?: string
  isHovered: boolean
  subtle?: boolean
}

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), s => s.segment)
  }
  return Array.from(text)
}

export default function AnimatedCardTitle({ children, className, isHovered, subtle = false }: AnimatedCardTitleProps) {
  const prefersReduced = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768)
  }, [])

  useEffect(() => {
    if (isHovered) {
      setCycleKey(k => k + 1)
    }
  }, [isHovered])

  if (!isDesktop || prefersReduced) {
    return <span className={className}>{children}</span>
  }

  if (subtle) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={children}
          className={className}
          style={{ display: 'inline-block' }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }}
          exit={{ y: -10, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    )
  }

  const chars = splitGraphemes(children)
  const total = chars.length

  const exitY        = subtle ? '-40%'  : '-35%'
  const enterY       = subtle ? '30%'   : '28%'
  const staggerStep  = subtle ? 0.015   : 0.008
  const exitDuration = subtle ? 0.25    : 0.32
  const damping      = subtle ? 35      : 48
  const stiffness    = subtle ? 300     : 280

  return (
    <span className={className} aria-label={children}>
      {chars.map((char, i) => {
        const delay = (total - 1 - i) * staggerStep
        return (
          <span
            key={i}
            aria-hidden={true}
            style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: '0.1em' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={`${cycleKey}-${i}`}
                style={{ display: 'inline-block' }}
                initial={{ y: enterY, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { type: 'spring', damping, stiffness, delay },
                }}
                exit={{
                  y: exitY,
                  opacity: 0,
                  transition: { duration: exitDuration, ease: 'easeInOut', delay },
                }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
    </span>
  )
}
