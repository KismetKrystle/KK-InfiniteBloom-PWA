'use client'

import { useState } from "react"
import OverlayShell from "./OverlayShell"
import { SOCIAL_LINKS } from "@/components/socialLinks"

const INQUIRY_TYPES = ["Performance", "Writing", "Public Speaking", "Interview", "Other"]

interface ContactOverlayProps {
  onClose: () => void
}

export default function ContactOverlay({ onClose }: ContactOverlayProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [inquiries, setInquiries] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const toggleInquiry = (type: string) => {
    setInquiries((prev) =>
      prev.includes(type) ? prev.filter((i) => i !== type) : [...prev, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, inquiries, message }),
      })
      setStatus(res.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <OverlayShell onClose={onClose}>
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left — headline */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-20 border-b md:border-b-0 md:border-r border-[#d4d4d4]">
          <p className="text-xs uppercase tracking-widest text-[#aaa] mb-4">Contact &amp; Follow</p>
          <h2 className="text-3xl md:text-4xl font-light text-[#111] leading-snug">
            Let&apos;s connect
          </h2>
          <a
            href="mailto:kismetthepoet@gmail.com"
            className="mt-4 text-[#F27D26] hover:underline text-sm"
          >
            kismetthepoet@gmail.com
          </a>

          <div className="flex items-center gap-4 mt-6">
            {SOCIAL_LINKS.map(({ name, url, icon: Icon }) =>
              url ? (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  aria-label={name}
                  className="text-[#888] hover:text-[#F27D26] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ) : (
                <span
                  key={name}
                  title={`Add your ${name} link in ContactOverlay.tsx`}
                  aria-hidden="true"
                  className="text-[#d4d4d4] cursor-not-allowed"
                >
                  <Icon className="w-5 h-5" />
                </span>
              )
            )}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-20">
          {status === "sent" ? (
            <div className="space-y-2">
              <p className="text-[#111] text-lg">Message sent.</p>
              <p className="text-[#888] text-sm">I&apos;ll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
              <div className="space-y-1">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#d4d4d4] py-2 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#d4d4d4] py-2 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Inquiry type</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {INQUIRY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleInquiry(type)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        inquiries.includes(type)
                          ? "border-[#F27D26] text-[#F27D26] bg-[#F27D26]/10"
                          : "border-[#d4d4d4] text-[#888] hover:border-[#aaa]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#aaa] uppercase tracking-widest">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-[#d4d4d4] py-2 text-[#111] text-sm outline-none focus:border-[#F27D26] transition-colors resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 rounded-xl bg-[#F27D26] text-black text-sm font-medium hover:bg-[#e06d1a] transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </OverlayShell>
  )
}
