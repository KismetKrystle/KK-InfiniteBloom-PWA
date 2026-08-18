'use client'

import { useState } from 'react'

interface Chapter {
  title: string
  url: string
}

// Paste each chapter's SoundCloud playlist share URL below.
const CHAPTERS: Chapter[] = [
  { title: 'Chapter 1: Attention', url: 'https://soundcloud.com/kismetkrystle/sets/chapter-1-attention-the/s-D97NnRE1cDF' },
  { title: 'Chapter 2: Beyond the Surface', url: 'https://soundcloud.com/kismetkrystle/sets/chapter-2-beyond-the-surface/s-qL4mlrZIZ37' },
  { title: 'Chapter 3: It’s Only the Beginning', url: 'https://soundcloud.com/kismetkrystle/sets/chapter-3-its-only-the/s-Ng7IbN36tkK' },
  { title: 'Chapter 4: Too Often Forgotten', url: 'https://soundcloud.com/kismetkrystle/sets/chapter-4-too-often-1/s-5ybiinUgQ6O' },
  { title: 'Chapter 5: A Talk with Divine', url: 'https://soundcloud.com/kismetkrystle/sets/chapter-5-a-talk-with-divine/s-5JvoLM3HTaa' },
  { title: 'Chapter 6: When the Pen Continues', url: 'https://soundcloud.com/kismetkrystle/sets/the-infinite-bloom-chapter-6/s-hzQpZaZGdvK' },
]

// Private/unlisted SoundCloud sets carry a "/s-XXXXXXX" secret token as the
// last path segment. The widget won't resolve that from the url= param alone —
// it needs the token split out into its own secret_token= param.
function buildEmbedSrc(url: string): string {
  const secretMatch = url.match(/\/(s-[A-Za-z0-9]+)\/?$/)
  const baseUrl = secretMatch ? url.slice(0, secretMatch.index) : url

  const params = new URLSearchParams({
    url: baseUrl,
    color: '#f27d26',
    auto_play: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
    show_tracklist: 'true',
  })
  if (secretMatch) params.set('secret_token', secretMatch[1])

  return `https://w.soundcloud.com/player/?${params.toString()}`
}

export default function AudioChapters() {
  const [active, setActive] = useState(0)
  const chapter = CHAPTERS[active]

  const embedSrc = chapter.url ? buildEmbedSrc(chapter.url) : null

  return (
    <div>
      <select
        value={active}
        onChange={(e) => setActive(Number(e.target.value))}
        className="w-full sm:w-auto mb-6 px-4 py-2.5 rounded-xl border border-[#d4d4d4] text-sm font-medium text-[#111] bg-white outline-none focus:border-[#F27D26] transition-colors"
      >
        {CHAPTERS.map((c, i) => (
          <option key={c.title} value={i} disabled={!c.url}>
            {c.title}{!c.url ? ' (coming soon)' : ''}
          </option>
        ))}
      </select>

      {embedSrc ? (
        <iframe
          key={chapter.url}
          title={chapter.title}
          width="100%"
          height="600"
          allow="autoplay"
          src={embedSrc}
          className="rounded-xl border border-[#d4d4d4]"
        />
      ) : (
        <p className="text-sm text-[#aaa]">
          Add this chapter&apos;s SoundCloud playlist URL to <code>CHAPTERS</code> in{' '}
          <code>src/components/AudioChapters.tsx</code>.
        </p>
      )}
    </div>
  )
}
