'use client'

import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"

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
