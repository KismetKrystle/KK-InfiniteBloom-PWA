'use client'

import { useRouter } from 'next/navigation'

interface NavbarProps {
  user: { name: string | null; email: string } | null
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '16px',
  fontWeight: 500,
  color: '#111111',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: '4px 0',
  letterSpacing: '0.05em',
  textDecoration: 'none',
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  return (
    <nav className="flex items-center justify-between px-4 py-3 flex-shrink-0">
      <img
        src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1779143359/infinite_bloom_logo_ncxs5k.png"
        alt="Infinite Bloom"
        className="h-12 w-auto"
      />
      <button
        onClick={() => router.push(user ? '/flipbook' : '/login')}
        style={btnStyle}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
      >
        Sign In
      </button>
    </nav>
  )
}
