'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Minimize, Mail, User, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { authClient } from '@/lib/auth-client'

interface Purchase {
  product_name: string
  product_type: string
  created_at: string
}

interface PurchasesData {
  purchases: Purchase[]
  deviceCount: number
}

interface FlipbookNavbarProps {
  user: { id: string; name: string | null; email: string }
  onClose: () => void
  onToggleFullScreen: () => void
}

export default function FlipbookNavbar({ onClose, onToggleFullScreen }: FlipbookNavbarProps) {
  const router = useRouter()
  const [purchasesData, setPurchasesData] = useState<PurchasesData | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (!dropdownOpen) return
    fetch('/api/user/purchases')
      .then(r => r.json())
      .then(setPurchasesData)
      .catch(() => {})
  }, [dropdownOpen])

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Left: minimize */}
      <header className="fixed top-0 left-0 right-0 h-12 z-[60] flex items-center px-4 bg-transparent pointer-events-none">
        <button
          onClick={onToggleFullScreen}
          title="Exit Full Screen"
          className="pointer-events-auto text-white/80 hover:text-white transition-opacity"
        >
          <Minimize className="w-5 h-5" />
        </button>
      </header>

      {/* Right: vertical stack — X, then profile, then messages */}
      <div className="fixed top-3 right-4 z-[60] flex flex-col items-center gap-3 bg-black/40 backdrop-blur-sm rounded-2xl py-2 px-1.5">
        <button
          onClick={onClose}
          title="Exit Full Screen"
          className="flex items-center justify-center p-2 -m-2 text-white/80 hover:text-white transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account"
              className="flex items-center justify-center p-2 -m-2 text-white/80 hover:text-white transition-opacity"
            >
              <User className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs text-[#aaa] font-normal uppercase tracking-widest">
              My Purchases
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {!purchasesData ? (
                <div className="px-2 py-2 text-xs text-[#aaa]">Loading…</div>
              ) : purchasesData.purchases.length === 0 ? (
                <div className="px-2 py-2 text-xs text-[#aaa]">No purchases yet.</div>
              ) : (
                purchasesData.purchases.map((p, i) => (
                  <div key={i} className="px-2 py-1.5">
                    <p className="text-sm text-[#111] leading-snug">
                      {p.product_type === 'flipbook'
                        ? `Flipbook — ${purchasesData.deviceCount} of 3 devices active`
                        : p.product_name}
                    </p>
                    <p className="text-xs text-[#aaa] mt-0.5">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-sm text-red-500 cursor-pointer focus:text-red-500"
              onClick={handleSignOut}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => router.push('/dashboard/messages')}
          aria-label="Messages"
          className="flex items-center justify-center p-2 -m-2 text-white/80 hover:text-white transition-opacity"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}
