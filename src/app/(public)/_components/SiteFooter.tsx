export default function SiteFooter() {
  return (
    <footer className="border-t border-[#222] py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#555]">
        <span>© 2025 Kismet Krystle</span>
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/kismetthepoet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e0e0e0] transition-colors"
          >
            Instagram @kismetthepoet
          </a>
          <a
            href="https://tiktok.com/@kismetkrystle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#e0e0e0] transition-colors"
          >
            TikTok @kismetkrystle
          </a>
        </div>
      </div>
    </footer>
  )
}
