'use client'

import { useState } from 'react'

interface AccessGrant {
  id: string
  email: string
  note: string | null
  granted_by: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

function statusOf(grant: AccessGrant): { label: string; className: string } {
  if (grant.revoked_at) return { label: 'Revoked', className: 'bg-red-100 text-red-700' }
  if (grant.expires_at && new Date(grant.expires_at) <= new Date()) {
    return { label: 'Expired', className: 'bg-[#eee] text-[#888]' }
  }
  return { label: 'Active', className: 'bg-green-100 text-green-700' }
}

export default function AccessGrantAdminList({ grants: initial }: { grants: AccessGrant[] }) {
  const [grants, setGrants] = useState(initial)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/access-grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          note: note || undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to add grant.')
        return
      }

      setGrants((prev) => [data.grant, ...prev])
      setEmail('')
      setNote('')
      setExpiresAt('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleRevoke(id: string, revoked: boolean) {
    const prev = grants
    setGrants((cur) => cur.map((g) => (g.id === id ? { ...g, revoked_at: revoked ? new Date().toISOString() : null } : g)))

    const res = await fetch(`/api/admin/access-grants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revoked }),
    }).catch(() => null)

    if (!res?.ok) setGrants(prev)
  }

  async function handleDelete(id: string) {
    const prev = grants
    setGrants((cur) => cur.filter((g) => g.id !== id))
    const res = await fetch(`/api/admin/access-grants/${id}`, { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) setGrants(prev)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-[#d4d4d4] p-4 mb-6 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#888] uppercase tracking-widest mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="friend@example.com"
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg border border-[#d4d4d4] text-sm outline-none focus:border-[#F27D26] transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs text-[#888] uppercase tracking-widest mb-1">Expires (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg border border-[#d4d4d4] text-sm outline-none focus:border-[#F27D26] transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#888] uppercase tracking-widest mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Musician collab — met at event"
            disabled={submitting}
            className="w-full px-3 py-2 rounded-lg border border-[#d4d4d4] text-sm outline-none focus:border-[#F27D26] transition-colors disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#F27D26' }}
        >
          {submitting ? 'Granting…' : 'Grant Access'}
        </button>
      </form>

      {grants.length === 0 ? (
        <p className="text-sm text-[#aaa] text-center py-16">No access grants yet.</p>
      ) : (
        <div className="space-y-3">
          {grants.map((g) => {
            const status = statusOf(g)
            return (
              <div key={g.id} className="rounded-xl border border-[#d4d4d4] p-4">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="text-sm font-medium text-[#111]">{g.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <p className="text-xs text-[#aaa] mb-2">
                  Granted {new Date(g.created_at).toLocaleDateString()}
                  {g.granted_by && ` by ${g.granted_by}`}
                  {g.expires_at && ` · Expires ${new Date(g.expires_at).toLocaleDateString()}`}
                </p>

                {g.note && <p className="text-sm text-[#666] mb-3">{g.note}</p>}

                <div className="flex items-center gap-2">
                  {g.revoked_at ? (
                    <button
                      onClick={() => toggleRevoke(g.id, false)}
                      className="px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#F27D26' }}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleRevoke(g.id, true)}
                      className="px-3 py-1.5 rounded-lg border border-[#d4d4d4] text-[#666] text-xs font-medium hover:border-[#aaa] transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="px-3 py-1.5 rounded-lg text-red-500 text-xs font-medium hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
