'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface AccountSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AccountSettingsDialog({ open, onOpenChange }: AccountSettingsDialogProps) {
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (!open) return
    setLoaded(false)
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setMarketingConsent(Boolean(data.marketingConsent))
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [open])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, marketingConsent }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile & Settings</DialogTitle>
          <DialogDescription>Manage your account details</DialogDescription>
        </DialogHeader>

        {!loaded ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-muted-foreground">{name || '—'}</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{email || '—'}</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="settings-phone" className="text-sm font-medium">Phone</label>
              <input
                id="settings-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (status !== 'idle') setStatus('idle')
                }}
                className="w-full border-b border-[#d4d4d4] py-2 text-sm outline-none focus:border-[#F27D26] transition-colors bg-transparent"
              />
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => {
                  setMarketingConsent(e.target.checked)
                  if (status !== 'idle') setStatus('idle')
                }}
                className="mt-0.5 accent-[#F27D26]"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Email me with new poems, updates, and blog posts.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={status === 'saving'}
                className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#F27D26' }}
              >
                {status === 'saving' ? 'Saving…' : 'Save'}
              </button>
              {status === 'saved' && <span className="text-sm text-[#4a8a4a]">Saved.</span>}
              {status === 'error' && <span className="text-sm text-red-500">Something went wrong.</span>}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
