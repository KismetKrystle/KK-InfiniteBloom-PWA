'use client'

import { useEffect, useState } from 'react'

const SESSION_KEY = 'audioWelcomeModalShown'

interface AudioWelcomeModalProps {
  unlockedVia: 'purchase' | 'claim' | null
}

export default function AudioWelcomeModal({ unlockedVia }: AudioWelcomeModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!unlockedVia) return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
      sessionStorage.setItem(SESSION_KEY, 'true')
      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [unlockedVia])

  if (!visible || !unlockedVia) return null

  const isClaim = unlockedVia === 'claim'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-semibold text-[#111] mb-3">
          {isClaim ? 'Thank you for your book!' : 'Thank you for your purchase!'}
        </h2>

        <p className="text-sm text-[#666] mb-2">
          {isClaim
            ? 'We verified your physical copy of Infinite Bloom. You now have full access to all 6 chapters with complete poem narrations.'
            : "Here's full access to every chapter's complete narration — listen to full poems anytime."}
        </p>

        <p className="text-sm text-[#666] mb-4">
          These recordings are companion material to the book, designed to accompany your reading experience.
        </p>

        <div className="bg-[#fdf3ea] border border-[#F27D26]/30 rounded-xl p-3 mb-4 text-sm">
          <p className="font-medium text-[#111] mb-2">Your access includes:</p>
          <ul className="text-[#444] space-y-1">
            <li>All 6 chapters in full</li>
            <li>Complete poem narrations</li>
            <li>Listen while you read</li>
          </ul>
        </div>

        <p className="text-xs text-[#aaa] italic mb-6">
          Future: music collaborations will be released separately.
        </p>

        <button
          onClick={() => setVisible(false)}
          className="w-full px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#F27D26' }}
        >
          Start Listening
        </button>
      </div>
    </div>
  )
}
