// Shared frame for the small screens around the reader (sign in, no access,
// post-purchase welcome), styled like www.kismetkrystle.com.
export default function ReaderShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <main className="kk min-h-dvh flex flex-col px-4 sm:px-7">
      <header className="flex items-center gap-6 min-h-[70px] border-b kk-rule">
        <a href="https://www.kismetkrystle.com" className="text-[22px] font-black tracking-[-1.1px] whitespace-nowrap">
          KISMET / KRYSTLE
        </a>
        <a href="https://www.kismetkrystle.com/#book" className="kk-micro ml-auto hidden sm:inline border-b border-[#999] pb-[3px]">
          Back to the site
        </a>
      </header>
      <div className="flex justify-between py-5 border-b border-[#bbb8af] kk-micro">
        <span>The Infinite Bloom</span>
        <span>{label}</span>
      </div>
      <div className="flex-1 flex items-center justify-center py-14">
        <div className="w-full max-w-md space-y-7">{children}</div>
      </div>
    </main>
  )
}

export function ShellHeading({ eyebrow, title, body }: { eyebrow?: string; title: React.ReactNode; body?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {eyebrow && <span className="kk-micro block">{eyebrow}</span>}
      <h1 className="kk-display text-[clamp(48px,11vw,72px)]">{title}</h1>
      {body && <p className="text-[15px] leading-[1.65] text-[var(--kk-muted)]">{body}</p>}
    </div>
  )
}
