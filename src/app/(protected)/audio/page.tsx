import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import SharedNavbar from '@/components/SharedNavbar'
import AudioChapters from '@/components/AudioChapters'
import DonateSection from '@/components/DonateSection'
import CommentSection from '@/components/CommentSection'
import AudioSignupGate from '@/components/AudioSignupGate'

export default async function AudioPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  let hasPurchased = false
  if (session) {
    const rows = await sql`
      SELECT 1 FROM purchases pu
      WHERE pu.user_id = (
        SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
      )
      AND pu.status = 'completed'
      AND pu.access_granted = true
      LIMIT 1
    `
    hasPurchased = rows.length > 0
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session?.user ?? null} />
      <main
        className="max-w-3xl mx-auto px-4 pt-20 pb-12"
        style={session ? undefined : { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}
      >
        <h1 className="text-2xl font-bold text-[#111] mb-1">Infinite Bloom: Audio Poems</h1>
        <p className="text-sm text-[#666] mb-6">
          Each poem read aloud by Kismet Krystle, intimate acapella recordings from the book,
          organized by chapter below.
        </p>
        <AudioChapters />

        {!hasPurchased && (
          <div className="mt-8">
            <a
              href="/?pricing=open"
              className="inline-block px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#F27D26' }}
            >
              Get the Book
            </a>
          </div>
        )}

        <DonateSection />

        <CommentSection context="audio" prompt="Tell us what these poems meant to you." user={session?.user ?? null} />
      </main>

      {!session && <AudioSignupGate />}
    </div>
  )
}
