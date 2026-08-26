'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Headphones, BookOpen } from "lucide-react"
import OverlayShell from "./OverlayShell"

const SHARED_FEATURES =
  "All 45 poems. All 143 insights. Audio narration by the author. Every page formatted to match the poem's cadence and rhythm."

const products = [
  {
    id: "digital",
    name: "Digital Flipbook",
    price: "$20",
    description: "Take it anywhere.",
    features: [
      "Accessed via embedded player",
      "Read it, listen to it, revisit it offline forever",
      "No wifi required. 2-device access",
    ],
    closingLine: "This is how the book was designed to be experienced.",
    highlight: false,
    productType: "flipbook",
    purchasable: true,
    externalLink: null as string | null,
    icon: Headphones,
  },
  {
    id: "physical-color",
    name: "Physical Book",
    price: "$33",
    description: "The complete vision in your hands.",
    features: [
      "Full-color pages",
      "Audio narration via QR code beside each title",
      "A collectible to hold, mark up, and return to",
      "Art you can archive",
    ],
    closingLine: null,
    highlight: false,
    productType: "physical-color",
    purchasable: false,
    externalLink: "https://a.co/d/02C4lAL5",
    icon: BookOpen,
  },
]

const fallbackTestimonials = [
  {
    author: "A. Johnson",
    title: "Reader",
    quote: "Infinite Bloom stopped me in my tracks. I had to sit with myself and reflect.",
  },
  {
    author: "M. Davis",
    title: "Poet & Educator",
    quote: "Kismet has a gift for turning inward experience into universal truth.",
  },
  {
    author: "T. Williams",
    title: "Reader",
    quote: "The audio narration makes this unlike any book experience I have had before.",
  },
]

interface PricingOverlayProps {
  onClose: () => void
  user: { id: string; name: string | null; email: string } | null
}

export default function PricingOverlay({ onClose, user }: PricingOverlayProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState(fallbackTestimonials)

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setTestimonials(
            data.testimonials.map((t: { author_name: string; author_title: string | null; content: string }) => ({
              author: t.author_name,
              title: t.author_title ?? "Reader",
              quote: t.content,
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  async function handleBuy(productType: string, id: string) {
    if (!user) {
      router.push("/login")
      return
    }

    setError(null)
    setLoadingId(id)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout")
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setLoadingId(null)
    }
  }

  return (
    <OverlayShell onClose={onClose}>
      <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
        <div className="mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#aaa]">Get the book</p>
          <h2 className="text-3xl font-light text-[#111]">Choose your format</h2>
          <div className="w-12 h-px bg-[#F27D26]" />
          <p className="text-sm text-[#888]">{SHARED_FEATURES}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 ${
                p.highlight
                  ? "border-[#F27D26]/40 bg-[#F27D26]/5"
                  : "border-[#d4d4d4] bg-white"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-4 text-xs px-2 py-0.5 bg-[#F27D26] text-black rounded-full font-medium">
                  Best value
                </span>
              )}
              <div className="w-9 h-9 rounded-lg bg-[#F27D26]/10 flex items-center justify-center">
                <p.icon className="w-5 h-5" style={{ color: "#F27D26" }} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111] mb-1">{p.name}</p>
                <p className="text-2xl font-light text-[#111]">{p.price}</p>
              </div>
              <p className="text-sm text-[#888] leading-relaxed">{p.description}</p>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-[#aaa] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#F27D26] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {p.closingLine && (
                <p className="text-xs text-[#888] italic leading-relaxed">{p.closingLine}</p>
              )}
              {p.purchasable ? (
                <button
                  onClick={() => handleBuy(p.productType, p.id)}
                  disabled={loadingId === p.id}
                  className="mt-auto w-full py-2.5 rounded-xl text-black text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#F27D26" }}
                >
                  {loadingId === p.id ? "Redirecting…" : user ? "Get the Book" : "Sign in to purchase"}
                </button>
              ) : p.externalLink ? (
                <a
                  href={p.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full py-2.5 rounded-xl text-black text-sm font-medium text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F27D26" }}
                >
                  Buy on Amazon
                </a>
              ) : (
                <button
                  disabled
                  className="mt-auto w-full py-2.5 rounded-xl border border-[#d4d4d4] text-[#bbb] text-sm cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-16">{error}</p>}
        {!error && <div className="mb-16" />}

        <div className="border-t border-[#d4d4d4] pt-16">
          <p className="text-xs uppercase tracking-widest text-[#aaa] mb-10">What readers say</p>
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t) => (
              <div key={t.author} className="space-y-4">
                <p className="text-sm text-[#555] leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-xs font-medium text-[#111]">{t.author}</p>
                  <p className="text-xs text-[#aaa]">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OverlayShell>
  )
}
