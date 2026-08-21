import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import SharedNavbar from '@/components/SharedNavbar'

export default async function BlogPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session?.user ?? null} />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <p className="text-xs uppercase tracking-widest text-[#aaa] mb-3">Blog</p>
        <h1 className="text-3xl font-light text-[#111] mb-2">Coming Soon</h1>
        <p className="text-sm text-[#888] max-w-sm">
          Thoughts on poetry, creativity, and conscious living — from Kismet Krystle.
        </p>
      </main>
    </div>
  )
}
