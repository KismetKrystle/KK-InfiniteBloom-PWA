import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import SharedNavbar from '@/components/SharedNavbar'

interface Message {
  id: string
  from_admin: boolean
  subject: string
  content: string
  created_at: string
}

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: headers() })
  if (!session) redirect('/login')

  const messages = (await sql`
    SELECT id, from_admin, subject, content, created_at
    FROM messages
    WHERE from_user_id = (
      SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
    )
    OR to_user_id = (
      SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
    )
    ORDER BY created_at ASC
  `) as Message[]

  return (
    <>
      <SharedNavbar user={session.user} />
      <main className="min-h-screen bg-[#f5f5f5] flex flex-col pt-24">
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
          <h1
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#111' }}
            className="mb-8"
          >
            Messages
          </h1>

          {messages.length === 0 ? (
            <p className="text-sm text-[#aaa] text-center py-16">No messages yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map(msg => {
                const isOutgoing = !msg.from_admin
                return (
                  <div
                    key={msg.id}
                    className={['flex flex-col max-w-[80%]', isOutgoing ? 'self-end items-end' : 'self-start items-start'].join(' ')}
                  >
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{
                        background: isOutgoing ? '#111' : 'rgba(224,224,224,0.9)',
                        color: isOutgoing ? 'white' : '#111',
                      }}
                    >
                      {msg.subject && (
                        <p className="text-xs font-medium mb-1 opacity-60 uppercase tracking-widest">
                          {msg.subject}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className="text-[11px] text-[#aaa] mt-1 px-1">
                      {isOutgoing ? 'You' : 'Kismet Krystle'} ·{' '}
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
