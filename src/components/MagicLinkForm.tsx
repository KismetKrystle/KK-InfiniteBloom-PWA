'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Input } from '@/components/ui/input'

interface MagicLinkFormProps {
  // Where to land after the link is clicked — always routed through
  // /post-login so the reader's profile row exists first.
  next?: string
  defaultEmail?: string
}

export default function MagicLinkForm({ next, defaultEmail = '' }: MagicLinkFormProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendLink() {
    setError('')
    setLoading(true)
    const callbackURL = next ? `/post-login?next=${encodeURIComponent(next)}` : '/post-login'
    const { error } = await authClient.signIn.magicLink({ email, callbackURL })
    setLoading(false)
    if (error) {
      setError(error.message ?? 'Could not send the link. Please try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center space-y-2" role="status">
        <p className="text-sm text-[#555]">
          Check <span className="text-[#111] font-medium">{email}</span> for a link to open your book. It expires in 15
          minutes.
        </p>
        <button
          type="button"
          onClick={sendLink}
          disabled={loading}
          className="text-xs underline text-[#777] hover:text-[#111] transition-colors disabled:opacity-50"
        >
          {loading ? 'Sending…' : "Didn't get it? Send it again"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendLink()
        }}
        className="flex items-center gap-2"
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1 rounded-full"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Email me a link"
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#111] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
