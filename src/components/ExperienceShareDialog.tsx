'use client'

import { useState } from 'react'
import { Heart, Share2, MessageSquareQuote, ArrowLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import UserTestimonialForm from './UserTestimonialForm'

interface ExperienceShareDialogProps {
  userEmail: string
  userName: string
}

const DEFAULT_SHARE_TEXT =
  'Just experienced The Infinite Bloom by Kismet Krystle — poetry, audio narrations, and reflections in one place.'

export default function ExperienceShareDialog({ userEmail, userName }: ExperienceShareDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [view, setView] = useState<'choice' | 'compose'>('choice')
  const [message, setMessage] = useState(DEFAULT_SHARE_TEXT)
  const [testimonialOpen, setTestimonialOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  function openDialog() {
    setView('choice')
    setMessage(DEFAULT_SHARE_TEXT)
    setDialogOpen(true)
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: 'The Infinite Bloom', text: message, url: `${window.location.origin}/` })
      setDialogOpen(false)
    } catch {
      // User cancelled the native share sheet — leave the dialog open.
    }
  }

  function openPlatform(platform: 'x' | 'facebook') {
    const url = encodeURIComponent(`${window.location.origin}/`)
    const text = encodeURIComponent(message)
    const shareUrl =
      platform === 'x'
        ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        : `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  async function copyLink() {
    // The URL on its own line (not inline with the message) is what makes most
    // apps' auto-linker actually turn it into a clickable link once pasted.
    await navigator.clipboard.writeText(`${message}\n\n${window.location.origin}/`)
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  return (
    <>
      <div className="flex items-center space-x-3 cursor-pointer" onClick={openDialog}>
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 hover:border-pink-300 rounded-lg p-2 transition-colors">
          <Heart className="w-4 h-4 text-pink-500" />
        </div>
        <span>Share Your Experience</span>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {view === "choice" ? (
            <>
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
                <DialogDescription>How would you like to share what Infinite Bloom meant to you?</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <button
                  onClick={() => {
                    setDialogOpen(false)
                    setTestimonialOpen(true)
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-pink-300 hover:bg-pink-50/50 transition-colors text-left"
                >
                  <MessageSquareQuote className="w-5 h-5 text-pink-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Leave a Testimonial</p>
                    <p className="text-xs text-muted-foreground">Share a quote that may be featured on the site.</p>
                  </div>
                </button>

                <button
                  onClick={() => setView("compose")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-pink-300 hover:bg-pink-50/50 transition-colors text-left"
                >
                  <Share2 className="w-5 h-5 text-pink-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Share on Social</p>
                    <p className="text-xs text-muted-foreground">Post a link to Infinite Bloom for friends to discover.</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <button
                  onClick={() => setView("choice")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 -ml-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <DialogTitle>Share on Social</DialogTitle>
                <DialogDescription>Edit the message however you&apos;d like before sharing.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-[#d4d4d4] text-sm text-[#111] outline-none focus:border-[#F27D26] transition-colors resize-none"
                />
                <p className="text-xs text-muted-foreground -mt-2">
                  A link to the site is added automatically when you share.
                </p>

                {canNativeShare && (
                  <button
                    onClick={handleNativeShare}
                    disabled={!message.trim()}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#F27D26" }}
                  >
                    Share…
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPlatform("x")}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-pink-300 transition-colors"
                  >
                    X / Twitter
                  </button>
                  <button
                    onClick={() => openPlatform("facebook")}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-pink-300 transition-colors"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={copyLink}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-pink-300 transition-colors"
                  >
                    {copyStatus === "copied" ? "Copied!" : "Copy link"}
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UserTestimonialForm
        userEmail={userEmail}
        userName={userName}
        open={testimonialOpen}
        onClose={() => setTestimonialOpen(false)}
      />
    </>
  )
}
