'use client'

import { useEffect, useState } from 'react'

interface Insight {
  id: number
  insight_number: number
  content: string
  source_type: 'insight' | 'poem-line'
  source_poem_number: number | null
  source_poem_title: string | null
  page_number: number | null
}

export default function RandomInsightCard() {
  const [insight, setInsight] = useState<Insight | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/insights/random')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setInsight(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
      <div
        className="max-w-xl rounded-2xl border border-white/15 bg-white/30 backdrop-blur-sm px-8 py-6 text-center"
        style={{ opacity: insight ? 1 : 0, transition: 'opacity 500ms ease-out' }}
      >
        <p
          className="text-black/95"
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: 'clamp(22px, 3.2vw, 34px)',
            fontStyle: 'italic',
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          {insight ? `"${insight.content}"` : ' '}
        </p>
        <p
          className="mt-4 text-xs uppercase tracking-widest text-black/60"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {insight &&
            (insight.source_type === 'poem-line'
              ? `${insight.source_poem_title} — Insight #${insight.insight_number}`
              : `Insight #${insight.insight_number}`)}
        </p>
      </div>
    </div>
  )
}
