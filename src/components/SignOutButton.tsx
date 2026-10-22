'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={className ?? 'px-5 py-2.5 rounded-full border border-[#111] text-sm text-[#111] hover:bg-[#111] hover:text-white transition-colors'}
    >
      Sign out
    </button>
  )
}
