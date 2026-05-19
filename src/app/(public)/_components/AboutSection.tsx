export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-4 border-t border-[#222]">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div className="order-2 md:order-1 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-light text-[#e0e0e0]">About Kismet</h2>
            <div className="w-12 h-px bg-[#F27D26]" />
          </div>
          <p className="text-[#888] leading-relaxed text-sm">
            Kismet Krystle is a poet, author, and speaker whose work sits at the
            intersection of consciousness, creativity, and culture. With over two decades
            of lived experience woven into every line, her poetry invites readers into
            quiet moments of recognition — the kind that shift something inside you.
          </p>
          <p className="text-[#888] leading-relaxed text-sm">
            The Infinite Bloom is her most intimate work yet: 45 poems, 45 audio
            narrations, and 143 insights designed to be returned to again and again.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["Poet", "Author", "Speaker"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full border border-[#222] text-[#555]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="order-1 md:order-2 flex justify-center">
          <img
            src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1765783633/Kismet_head_shot_wprdoh.jpg"
            alt="Kismet Krystle"
            className="w-full max-w-sm rounded-2xl object-cover object-top aspect-[3/4]"
          />
        </div>
      </div>
    </section>
  )
}
