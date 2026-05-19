'use client'

import OverlayShell from "./OverlayShell"

interface AboutOverlayProps {
  onClose: () => void
}

export default function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <OverlayShell onClose={onClose}>
      <div className="min-h-screen flex items-center px-6 md:px-16 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center w-full">
          <div className="order-2 md:order-1 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#aaa]">About</p>
              <h2 className="text-3xl font-light text-[#111]">Kismet Krystle</h2>
              <div className="w-12 h-px bg-[#F27D26]" />
            </div>
            <p className="text-[#888] leading-relaxed text-sm">
              Kismet Krystle is a poet, author, and speaker whose work sits at the
              intersection of consciousness, creativity, and culture. With over two decades
              of lived experience woven into every line, her poetry invites readers into
              quiet moments of recognition — the kind that shift something inside you.
            </p>
            <p className="text-[#888] leading-relaxed text-sm">
              The Infinite Bloom is her most intimate work yet: 45 poems, 45 audio
              narrations, and 143 insights designed to be returned to again and again.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Poet", "Author", "Speaker"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border border-[#d4d4d4] text-[#888]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <img
              src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg"
              alt="Kismet Krystle"
              className="w-full max-w-sm rounded-2xl object-cover object-top aspect-[3/4]"
            />
          </div>
        </div>
      </div>
    </OverlayShell>
  )
}
