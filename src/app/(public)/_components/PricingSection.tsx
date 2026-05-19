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

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 space-y-3">
          <h2 className="text-3xl font-light text-[#e0e0e0]">Get the book</h2>
          <div className="w-12 h-px bg-[#F27D26]" />
          <p className="text-[#888] text-sm">Choose the format that works for you.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 flex flex-col gap-4 ${
                p.highlight
                  ? "border-[#F27D26]/40 bg-[#F27D26]/5"
                  : "border-[#222] bg-[#111]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-4 text-xs px-2 py-0.5 bg-[#F27D26] text-black rounded-full font-medium">
                  Best value
                </span>
              )}
              <div>
                <p className="text-xs text-[#555] uppercase tracking-widest mb-1">{p.name}</p>
                <p className="text-2xl font-light text-[#e0e0e0]">{p.price}</p>
              </div>
              <p className="text-sm text-[#888] leading-relaxed flex-1">{p.description}</p>
              <ul className="space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-[#555] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#F27D26] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-auto w-full py-2.5 rounded-xl border border-[#333] text-[#444] text-sm cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
