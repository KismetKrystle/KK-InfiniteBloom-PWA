'use client'

import SharedNavbar from '@/components/SharedNavbar'

interface NavbarProps {
  user: { id: string; name: string | null; email: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  return <SharedNavbar user={user} />
}
