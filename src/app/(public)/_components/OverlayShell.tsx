'use client'

import { useEffect, useState, useCallback } from "react"
import { ArrowLeft, X } from "lucide-react"

interface OverlayShellProps {
  onClose: () => void
  children: React.ReactNode
}

export default function OverlayShell({ onClose, children }: OverlayShellProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = useCallback(() => {
    setMounted(false)
    setTimeout(onClose, 220)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.98)",
        transition: "opacity 220ms ease-out, transform 220ms ease-out",
      }}
      onClick={handleClose}
    >
      <div className="fixed top-0 left-0 z-10 flex flex-col items-start gap-4 px-4 py-2.5">
        <img
          src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1779143359/infinite_bloom_logo_ncxs5k.png"
          alt="Infinite Bloom"
          className="h-10 w-auto"
        />
        <button
          onClick={(e) => { e.stopPropagation(); handleClose() }}
          aria-label="Back"
          className="ml-1 text-[#111] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); handleClose() }}
        className="fixed top-6 right-6 text-[#aaa] hover:text-[#111] transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      {/* stopPropagation so clicks on content don't bubble to the backdrop */}
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
