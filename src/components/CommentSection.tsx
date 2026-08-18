'use client'

import { useState, useEffect } from 'react'
import { Heart, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  author_name: string
  author_image: string | null
  like_count: number
  liked_by_me: boolean
  is_mine: boolean
}

interface CommentSectionProps {
  context: 'audio' | 'flipbook'
  prompt?: string
}

export default function CommentSection({ context, prompt = 'Tell us what you thought.' }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState<'idle' | 'submitting' | 'error'>('idle')

  useEffect(() => {
    fetch(`/api/comments?context=${context}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
      .catch(() => {})
  }, [context])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setStatus('submitting')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, context }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setComments((prev) => [data.comment, ...prev])
      setContent('')
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setEditStatus('idle')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return
    setEditStatus('submitting')
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: data.comment.content, updated_at: data.comment.updated_at } : c))
      )
      setEditingId(null)
      setEditContent('')
    } catch {
      setEditStatus('error')
    }
  }

  async function handleDelete(id: string) {
    const prev = comments
    setComments((cur) => cur.filter((c) => c.id !== id))
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
    } catch {
      setComments(prev)
    }
  }

  async function toggleLike(id: string) {
    setComments((cur) =>
      cur.map((c) =>
        c.id === id ? { ...c, liked_by_me: !c.liked_by_me, like_count: c.like_count + (c.liked_by_me ? -1 : 1) } : c
      )
    )
    try {
      const res = await fetch(`/api/comments/${id}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setComments((cur) => cur.map((c) => (c.id === id ? { ...c, liked_by_me: data.liked, like_count: data.like_count } : c)))
    } catch {
      setComments((cur) =>
        cur.map((c) =>
          c.id === id ? { ...c, liked_by_me: !c.liked_by_me, like_count: c.like_count + (c.liked_by_me ? -1 : 1) } : c
        )
      )
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-[#d4d4d4]">
      <h2 className="text-sm font-semibold text-[#111] mb-1">Comments</h2>
      <p className="text-sm text-[#666] mb-3">{prompt}</p>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Share your thoughts…"
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-[#d4d4d4] text-sm text-[#111] outline-none focus:border-[#F27D26] transition-colors resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!content.trim() || status === 'submitting'}
            className="px-5 py-2 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#F27D26' }}
          >
            {status === 'submitting' ? 'Sending…' : 'Submit'}
          </button>
          {status === 'error' && <span className="text-sm text-red-500">Something went wrong. Please try again.</span>}
        </div>
      </form>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-[#d4d4d4] p-3">
              <div className="flex items-start gap-3">
                {c.author_image ? (
                  <img
                    src={c.author_image}
                    alt={c.author_name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#F27D26] text-black text-xs font-semibold flex items-center justify-center shrink-0">
                    {c.author_name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111]">{c.author_name}</p>

                  {editingId === c.id ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        className="w-full px-3 py-2 rounded-lg border border-[#d4d4d4] text-sm text-[#111] outline-none focus:border-[#F27D26] transition-colors resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={!editContent.trim() || editStatus === 'submitting'}
                          className="px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                          style={{ backgroundColor: '#F27D26' }}
                        >
                          {editStatus === 'submitting' ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 rounded-lg border border-[#d4d4d4] text-[#666] text-xs font-medium hover:border-[#aaa] transition-colors"
                        >
                          Cancel
                        </button>
                        {editStatus === 'error' && <span className="text-xs text-red-500">Couldn&apos;t save. Try again.</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#111] whitespace-pre-wrap mt-0.5">{c.content}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => toggleLike(c.id)}
                      className="flex items-center gap-1.5 text-xs transition-colors"
                    >
                      <Heart
                        className="w-3.5 h-3.5"
                        style={{ color: c.liked_by_me ? '#F27D26' : '#aaa', fill: c.liked_by_me ? '#F27D26' : 'none' }}
                      />
                      <span style={{ color: c.liked_by_me ? '#F27D26' : '#aaa' }}>
                        {c.like_count > 0 ? c.like_count : 'Like'}
                      </span>
                    </button>
                    <span className="text-xs text-[#aaa]">
                      {new Date(c.created_at).toLocaleDateString()}
                      {c.updated_at !== c.created_at ? ' · edited' : ''}
                    </span>
                  </div>
                </div>

                {c.is_mine && editingId !== c.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Comment options"
                        className="p-1 -m-1 text-[#aaa] hover:text-[#111] transition-colors shrink-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(c)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(c.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
