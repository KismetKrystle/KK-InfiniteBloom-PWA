import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { resolveBook, hasPurchased } from '@/lib/flipbook-access'
import { sendEmail, NOTES_TO } from '@/lib/email'

const BOOK_SLUG = 'kismet-krystle'
const MAX_LENGTH = 2000

// "Write to Kismet": a reader's note lands in Kismet's inbox with reply-to
// set to the reader, so a reply from Gmail goes straight to them.
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const book = await resolveBook(BOOK_SLUG)
  if (!book || !(await hasPurchased(session.user, book.id))) {
    return NextResponse.json({ error: 'Readers only' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > MAX_LENGTH) {
    return NextResponse.json({ error: `Write between 1 and ${MAX_LENGTH} characters.` }, { status: 400 })
  }

  const from = session.user.name ? `${session.user.name} (${session.user.email})` : session.user.email
  const sent = await sendEmail({
    to: NOTES_TO,
    replyTo: session.user.email,
    subject: `Reader note from ${session.user.name || session.user.email}`,
    text: `${message}\n\n— ${from}\nReply to this email to answer them directly.`,
  })
  if (!sent) return NextResponse.json({ error: 'Could not send your note. Please try again.' }, { status: 502 })

  return NextResponse.json({ ok: true })
}
