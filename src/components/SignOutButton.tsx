'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function SignOutButton() {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <button type="button" onClick={signOut} className="kk-outline">
      Sign out
    </button>
  )
}
