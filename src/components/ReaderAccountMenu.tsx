'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { authClient } from '@/lib/auth-client'

const MAX_NOTE_LENGTH = 2000

export default function ReaderAccountMenu({ user }: { user: { name: string | null; email: string } }) {
  const router = useRouter()
  const [noteOpen, setNoteOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label="Account" className="p-2 hover:text-[var(--kk-blue)] transition-colors">
            <User className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="kk w-64 rounded-none border kk-rule">
          <DropdownMenuLabel className="font-normal">
            <p className="kk-micro text-[var(--kk-muted)]">Signed in as</p>
            <p className="text-sm truncate">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setNoteOpen(true)} className="cursor-pointer">
            <Mail className="w-4 h-4" /> Write to Kismet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer">
            <LogOut className="w-4 h-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NoteDialog open={noteOpen} onOpenChange={setNoteOpen} email={user.email} />
    </>
  )
}

function NoteDialog({ open, onOpenChange, email }: { open: boolean; onOpenChange: (open: boolean) => void; email: string }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Could not send your note.')
      setStatus('sent')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your note.')
      setStatus('error')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next && status === 'sent') setStatus('idle')
      }}
    >
      <DialogContent className="kk max-w-md rounded-none border kk-rule">
        <DialogHeader className="gap-3 text-left">
          <span className="kk-micro">The Infinite Bloom / A note</span>
          <DialogTitle className="kk-display text-[48px] font-black">
            WRITE TO <span className="kk-blue">KISMET.</span>
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[var(--kk-muted)]">
            {status === 'sent'
              ? `Sent. Kismet reads every note — any reply will come to ${email}.`
              : `A note straight to Kismet's inbox. Replies come to ${email}.`}
          </DialogDescription>
        </DialogHeader>
        {status !== 'sent' && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              required
              rows={6}
              placeholder="What's on your mind?"
              aria-label="Your note"
              className="kk-input resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="kk-micro text-[var(--kk-muted)]">
                {message.length}/{MAX_NOTE_LENGTH}
              </span>
              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="kk-solid"
              >
                {status === 'sending' ? 'Sending…' : 'Send note'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
