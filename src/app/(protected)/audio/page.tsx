import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAudioAccess } from '@/lib/audio-access'
import SharedNavbar from '@/components/SharedNavbar'
import AudioChapters from '@/components/AudioChapters'
import DonateSection from '@/components/DonateSection'
import CommentSection from '@/components/CommentSection'
import AudioSignupGate from '@/components/AudioSignupGate'
import BookClaimForm from '@/components/BookClaimForm'
import AudioWelcomeModal from '@/components/AudioWelcomeModal'

export default async function AudioPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const { purchased, claimed, hasAccess } = await getAudioAccess(session?.user?.id)

  const unlockedVia = purchased ? 'purchase' : claimed ? 'claim' : null

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session?.user ?? null} />
      <main
        className="max-w-3xl mx-auto px-4 pt-24 pb-12"
        style={hasAccess ? undefined : { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}
      >
        <h1 className="text-2xl font-bold text-[#111] mb-1">Infinite Bloom: Audio Poems</h1>
        <p className="text-sm text-[#666] mb-6">
          Each poem read aloud by Kismet Krystle, intimate acapella recordings from the book,
          organized by chapter below.
        </p>
        <AudioChapters />

        <DonateSection />

        <CommentSection context="audio" prompt="Tell us what these poems meant to you." user={session?.user ?? null} />
      </main>

      {!session && <AudioSignupGate />}

      {session && !hasAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto bg-white/70 backdrop-blur-sm">
          <div className="w-full max-w-sm max-h-full overflow-y-auto bg-white rounded-2xl border border-[#d4d4d4] shadow-2xl px-6 py-6">
            <h2 className="text-lg font-medium text-[#111] mb-1">Full audio access is exclusive to book owners</h2>
            <p className="text-sm text-[#888] mb-2">
              These recordings are companion material to Infinite Bloom, designed to accompany your reading
              experience — not a standalone album.
            </p>
            <p className="text-sm text-[#888] mb-4">
              Own a copy already? Claim your access below. Otherwise, grab the book to unlock every chapter.
            </p>
            <p className="text-xs text-[#aaa] italic mb-4">
              Future: music collaborations will be released separately.
            </p>

            <a
              href="/?pricing=open"
              className="inline-block mb-5 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#F27D26' }}
            >
              Get the Book
            </a>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#d4d4d4]" />
              <span className="text-xs text-[#aaa]">or claim with your physical copy</span>
              <div className="flex-1 h-px bg-[#d4d4d4]" />
            </div>

            <BookClaimForm />
          </div>
        </div>
      )}

      <AudioWelcomeModal unlockedVia={unlockedVia} />
    </div>
  )
}
