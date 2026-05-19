'use client'

import OverlayShell from "./OverlayShell"

const products = [
  {
    id: "digital",
    name: "Digital Flipbook",
    price: "$14.99",
    description: "Interactive flipbook with audio narrations and reflections. 2-device access.",
    features: ["45 poems", "45 audio narrations", "143 insights", "Interactive flipbook", "2 devices"],
    highlight: false,
  },
  {
    id: "ebook",
    name: "Ebook",
    price: "$9.99",
    description: "The complete poetry collection in ebook format. Read anywhere.",
    features: ["45 poems", "143 insights", "PDF + ePub", "Lifetime access"],
    highlight: false,
  },
  {
    id: "physical",
    name: "Physical Book",
    price: "$24.99",
    description: "Printed paperback delivered to your door.",
    features: ["45 poems", "Printed paperback", "Free shipping (US)", "Signed option"],
    highlight: false,
  },
  {
    id: "bundle",
    name: "Bundle",
    price: "$19.99",
    description: "Digital flipbook + ebook together. Best value.",
    features: ["Everything in Digital", "Everything in Ebook"],
    highlight: true,
  },
]

const testimonials = [
  {
    author: "A. Johnson",
    title: "Reader",
    quote: "Infinite Bloom stopped me in my tracks. I read it twice in one sitting.",
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
}

export default function PricingOverlay({ onClose }: PricingOverlayProps) {
  return (
    <OverlayShell onClose={onClose}>
      <div className="px-6 md:px-16 py-20 max-w-5xl mx-auto">
        <div className="mb-12 space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#aaa]">Get the book</p>
          <h2 className="text-3xl font-light text-[#111]">Choose your format</h2>
          <div className="w-12 h-px bg-[#F27D26]" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
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
              <div>
                <p className="text-xs text-[#aaa] uppercase tracking-widest mb-1">{p.name}</p>
                <p className="text-2xl font-light text-[#111]">{p.price}</p>
              </div>
              <p className="text-sm text-[#888] leading-relaxed flex-1">{p.description}</p>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-[#aaa] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#F27D26] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-auto w-full py-2.5 rounded-xl border border-[#d4d4d4] text-[#bbb] text-sm cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>

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
