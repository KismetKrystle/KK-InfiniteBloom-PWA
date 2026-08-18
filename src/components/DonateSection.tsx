'use client'

import { Heart } from 'lucide-react'

interface DonationLink {
  name: string
  url: string
}

// Paste your donation links below.
const DONATIONS: DonationLink[] = [
  { name: 'PayPal', url: 'https://paypal.me/Kismetkrystle' },
  { name: 'Cash App', url: 'https://cash.app/$kismetkrystle' },
  { name: 'Wise', url: 'https://wise.com/pay/me/krystlew10' },
  { name: 'Buy Me a Coffee', url: '' },
]

export default function DonateSection() {
  return (
    <div className="mt-8 pt-6 border-t border-[#d4d4d4]">
      <p className="text-sm text-[#666] mb-3">Enjoying the poems? Support more work like this:</p>
      <div className="flex flex-wrap gap-2">
        {DONATIONS.map((d) =>
          d.url ? (
            <a
              key={d.name}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-[#F27D26] text-black hover:opacity-90 transition-opacity"
            >
              <Heart className="w-3.5 h-3.5" />
              {d.name}
            </a>
          ) : (
            <span
              key={d.name}
              title="Add this link in src/components/DonateSection.tsx"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-[#d4d4d4] text-[#aaa] opacity-40 cursor-not-allowed"
            >
              <Heart className="w-3.5 h-3.5" />
              {d.name}
            </span>
          )
        )}
      </div>
    </div>
  )
}
