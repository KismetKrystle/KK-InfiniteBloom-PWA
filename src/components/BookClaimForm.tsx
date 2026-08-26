'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookClaimForm() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!photo) {
      setError('A photo is required to verify ownership.')
      return
    }
    if (!consent) {
      setError('Please confirm you’re okay with us potentially featuring your photo.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('orderNumber', orderNumber)
      formData.append('photo', photo)

      const res = await fetch('/api/book-claims', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to submit claim. Please try again.')
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError('Something went wrong uploading your claim. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-700 text-sm">
        Claim submitted — audio access granted. Refresh to start listening.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <div>
        <label className="block text-xs text-[#888] uppercase tracking-widest mb-1">Amazon Order # (optional)</label>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="123-4567890-1234567"
          disabled={loading}
          className="w-full px-3 py-2 rounded-xl border border-[#d4d4d4] text-sm outline-none focus:border-[#F27D26] transition-colors disabled:opacity-50"
        />
        <p className="text-xs text-[#aaa] mt-1">Or share any proof of purchase.</p>
      </div>

      <div>
        <label className="block text-xs text-[#888] uppercase tracking-widest mb-1">
          Photo with the book <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          disabled={loading}
          required
          className="w-full text-sm disabled:opacity-50"
        />
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={loading}
          className="mt-0.5 accent-[#F27D26]"
        />
        <span className="text-xs text-[#888] leading-snug">
          I understand Infinite Bloom may feature this photo on social media to celebrate our reader community.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#F27D26' }}
      >
        {loading ? 'Submitting…' : 'Claim Access'}
      </button>
    </form>
  )
}
