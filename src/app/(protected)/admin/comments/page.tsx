import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import SharedNavbar from '@/components/SharedNavbar'

interface CommentRow {
  id: string
  content: string
  context: string
  created_at: string
  updated_at: string
  display_name: string | null
  email: string
}

export default async function CommentsAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const profileRows = await sql`
    SELECT role FROM user_profiles WHERE auth_user_id = ${session.user.id}
  `
  const isAdmin = profileRows[0]?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <SharedNavbar user={session.user} />
        <main className="max-w-2xl mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-sm text-[#aaa]">You don&apos;t have access to this page.</p>
        </main>
      </div>
    )
  }

  const comments = (await sql`
    SELECT c.id, c.content, c.context, c.created_at, c.updated_at,
           up.display_name, up.email
    FROM comments c
    LEFT JOIN user_profiles up ON up.id = c.user_id
    ORDER BY c.created_at DESC
  `) as CommentRow[]

  const contextLabel = (context: string) => (context === 'flipbook' ? 'Flipbook' : 'Audio')

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session.user} />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-[#111] mb-1">Comments</h1>
        <p className="text-sm text-[#666] mb-6">
          {comments.length} comment{comments.length === 1 ? '' : 's'} from readers, across the audio and flipbook pages.
        </p>

        {comments.length === 0 ? (
          <p className="text-sm text-[#aaa] text-center py-16">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl border border-[#d4d4d4] p-4">
                <p className="text-sm text-[#111] whitespace-pre-wrap mb-2">{c.content}</p>
                <p className="text-xs text-[#aaa]">
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-[#f0f0f0] text-[#666] mr-1.5">
                    {contextLabel(c.context)}
                  </span>
                  {c.display_name ?? c.email ?? 'Unknown reader'} ·{' '}
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {c.updated_at !== c.created_at ? ' · edited' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
