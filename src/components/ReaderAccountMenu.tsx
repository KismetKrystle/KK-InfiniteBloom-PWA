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
          <button aria-label="Account" className="p-2 text-[#555] hover:text-[#111] transition-colors">
            <User className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <p className="text-[10px] uppercase tracking-widest text-[#aaa]">Signed in as</p>
            <p className="text-sm text-[#111] truncate">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setNoteOpen(true)} className="cursor-pointer">
            <Mail className="w-4 h-4" /> Write to Kismet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Write to Kismet</DialogTitle>
          <DialogDescription>
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
              className="w-full rounded-lg border border-[#ddd] p-3 text-sm focus:outline-none focus:border-[#111] resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#aaa]">
                {message.length}/{MAX_NOTE_LENGTH}
              </span>
              <button
                type="submit"
                disabled={status === 'sending' || !message.trim()}
                className="px-5 py-2 rounded-full bg-[#111] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending…' : 'Send note'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
