// Shared frame for the small one-card screens around the reader (sign in,
// no access, post-purchase welcome).
export default function ReaderShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#f5f3ed] flex flex-col">
      <header className="h-12 flex items-center justify-between px-4 border-b border-[#d8d5cc]">
        <a href="https://www.kismetkrystle.com" className="text-xs text-[#555] hover:text-[#111] transition-colors">
          ← kismetkrystle.com
        </a>
        <span className="text-[10px] tracking-[0.25em] text-[#555]">THE INFINITE BLOOM</span>
        <span className="w-24" aria-hidden="true" />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">{children}</div>
      </div>
    </main>
  )
}
