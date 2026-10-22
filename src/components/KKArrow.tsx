// The diagonal arrow used throughout www.kismetkrystle.com.
export default function KKArrow({ className = 'w-[1.1em] h-[1.1em]' }: { className?: string }) {
  return (
    <svg className={`inline-block shrink-0 ${className}`} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M5 27L27 5M12 5H27V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  )
}
