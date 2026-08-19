'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Testimonial {
  id: string
  author_name: string
  author_title: string | null
  author_email: string | null
  content: string
  rating: number | null
  is_approved: boolean
  created_at: string
}

export default function TestimonialAdminList({ testimonials: initial }: { testimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initial)

  async function setApproved(id: string, isApproved: boolean) {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, is_approved: isApproved } : t)))
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved }),
    }).catch(() => {})
  }

  async function handleDelete(id: string) {
    const prev = testimonials
    setTestimonials((cur) => cur.filter((t) => t.id !== id))
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' }).catch(() => null)
    if (!res?.ok) setTestimonials(prev)
  }

  if (testimonials.length === 0) {
    return <p className="text-sm text-[#aaa] text-center py-16">No testimonials yet.</p>
  }

  return (
    <div className="space-y-3">
      {testimonials.map((t) => (
        <div key={t.id} className="rounded-xl border border-[#d4d4d4] p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="text-sm font-medium text-[#111]">
                {t.author_name}
                {t.author_title && <span className="text-[#aaa] font-normal"> · {t.author_title}</span>}
              </p>
              <p className="text-xs text-[#aaa]">
                {t.author_email} · {new Date(t.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                t.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {t.is_approved ? 'Approved' : 'Pending'}
            </span>
          </div>

          {t.rating && (
            <div className="flex items-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="w-3.5 h-3.5"
                  style={{ color: n <= t.rating! ? '#F27D26' : '#e0e0e0', fill: n <= t.rating! ? '#F27D26' : 'none' }}
                />
              ))}
            </div>
          )}

          <p className="text-sm text-[#111] whitespace-pre-wrap mb-3">{t.content}</p>

          <div className="flex items-center gap-2">
            {!t.is_approved ? (
              <button
                onClick={() => setApproved(t.id, true)}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F27D26' }}
              >
                Approve
              </button>
            ) : (
              <button
                onClick={() => setApproved(t.id, false)}
                className="px-3 py-1.5 rounded-lg border border-[#d4d4d4] text-[#666] text-xs font-medium hover:border-[#aaa] transition-colors"
              >
                Unpublish
              </button>
            )}
            <button
              onClick={() => handleDelete(t.id)}
              className="px-3 py-1.5 rounded-lg text-red-500 text-xs font-medium hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
