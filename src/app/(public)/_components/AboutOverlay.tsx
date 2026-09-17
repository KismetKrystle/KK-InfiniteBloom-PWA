'use client'

import { Mail } from "lucide-react"
import OverlayShell from "./OverlayShell"
import { SOCIAL_LINKS } from "@/components/socialLinks"

interface AboutOverlayProps {
  onClose: () => void
}

export default function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <OverlayShell onClose={onClose}>
      <div className="min-h-screen flex items-center px-6 md:px-16 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center w-full">
          <div className="order-2 md:order-1 space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#aaa]">About</p>
              <h2 className="text-3xl font-light text-[#111]">Kismet Krystle</h2>
              <div className="w-12 h-px bg-[#F27D26]" />
            </div>
            <p className="text-[#888] leading-relaxed text-sm">
              Kismet Krystle is a spoken word poet, author, and creative technologist exploring
              consciousness, transformation, and the systems that shape human experience. She is
              the author of <em>The Infinite Bloom: Evolving by Perspective</em> and the 2025 Ubud
              Writers &amp; Readers Festival Slam Poetry Champion.
            </p>
            <p className="text-[#888] leading-relaxed text-sm">
              Her journey as a creative builder began at Texas A&amp;M University, where she studied
              Environmental Design, an architecture-focused degree, and became a founding member of
              a poetry community that cultivated voice and expression among emerging poets. Armed
              with a Master&apos;s degree in Architecture from UNLV and years of designing homes and
              commercial spaces, Kismet learned to think in systems, how space, form, and intention
              shape human experience. That same spatial and systems thinking informs both her poetry
              and her broader creative work.
            </p>
            <p className="text-[#888] leading-relaxed text-sm">
              After spending eleven years in Las Vegas featured across the city&apos;s most prominent
              open mics and earning a place on the Spit Your Truth slam poetry team, Kismet&apos;s
              passion for urban food access and sustainable living systems converged with her
              architectural background. During her graduate studies, she began experimenting with
              urban hydroponic systems, designing and testing growing solutions for local businesses,
              research that would eventually seed her vision for Plyant. In Bali, she continued this
              work in deeper research and private design, refining her understanding of integrated
              food systems and spatial thinking.
            </p>
            <p className="text-[#888] leading-relaxed text-sm">
              The bridge from poetry to technology came unexpectedly: in 2022, commissioned to write
              a poem about emerging AI and technology, Kismet&apos;s curiosity sparked. That creative
              inquiry led to an invitation to her first hackathon, and ultimately to founding Plyant,
              an AI-powered platform democratizing personalized food intelligence and urban
              agriculture. Today, her performance has carried her across Asia, Europe, and North
              America. Known for a presence that is soul-piercing and deeply relatable, her delivery
              moves audiences to feel, and many to pick up a pen for the first time. She was the
              co-host of <em>All Soul Everything</em>, a live spoken word and multi-arts event series
              rooted in community and authentic expression, for five years. Her work bridges the oral
              and written tradition, carrying the pulse of performance into poetic mental
              reconditioning and immersive monologue, and the systems thinking that shapes human
              flourishing.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Poet", "Author", "Speaker", "Entrepreneur"].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full border border-[#d4d4d4] text-[#888]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="mailto:kismetthepoet@gmail.com"
                title="Email"
                aria-label="Email"
                className="text-[#888] hover:text-[#F27D26] transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
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
                    title={`Add your ${name} link in socialLinks.tsx`}
                    aria-hidden="true"
                    className="text-[#d4d4d4] cursor-not-allowed"
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                )
              )}
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <img
              src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg"
              alt="Kismet Krystle"
              className="w-full max-w-sm rounded-2xl object-cover object-top aspect-[3/4]"
            />
          </div>
        </div>
      </div>
    </OverlayShell>
  )
}
