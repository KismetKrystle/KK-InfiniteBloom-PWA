'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface Device {
  id: string
  device_label: string | null
  last_seen: string
}

interface SharedNavbarProps {
  user: { id: string; name: string | null; email: string } | null
  dark?: boolean
}

export default function SharedNavbar({ user, dark = false }: SharedNavbarProps) {
  const router = useRouter()
  const [purchasesData, setPurchasesData] = useState<PurchasesData | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [devicesOpen, setDevicesOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Account'

  useEffect(() => {
    if (!dropdownOpen || !user) return
    fetch('/api/user/purchases')
      .then(r => r.json())
      .then(setPurchasesData)
      .catch(() => {})
  }, [dropdownOpen, user])

  useEffect(() => {
    if (!devicesOpen || !user) return
    fetch('/api/user/devices')
      .then(r => r.json())
      .then(setDevices)
      .catch(() => {})
  }, [devicesOpen, user])

  async function handleSignOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleLogoutDevice(deviceId: string) {
    await fetch('/api/user/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    })
    setDevices(prev => prev.filter(d => d.id !== deviceId))
  }

  async function handleLogoutAll() {
    await fetch('/api/user/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    await authClient.signOut()
    router.push('/login')
  }

  const gradientColor = dark ? 'rgba(0,0,0,0.5)' : 'white'

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 h-12 z-[60] flex items-center justify-between px-4',
          dark ? 'bg-black/60 backdrop-blur-sm' : 'bg-white',
        ].join(' ')}
      >
        <a href="/" className="flex items-center h-full">
          <img
            src="https://res.cloudinary.com/dsoojlgg1/image/upload/v1779143359/infinite_bloom_logo_ncxs5k.png"
            alt="Infinite Bloom"
            className="h-8 w-auto"
          />
        </a>

        {!user ? (
          <button
            onClick={() => router.push('/login')}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500, letterSpacing: '0.04em' }}
            className={dark ? 'text-white' : 'text-[#111]'}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/messages')}
              aria-label="Messages"
              className={[
                'flex items-center justify-center transition-opacity p-2 -m-2',
                dark ? 'text-white/70 hover:text-white' : 'text-[#888] hover:text-[#111]',
              ].join(' ')}
            >
              <Mail className="w-4 h-4" />
            </button>

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500 }}
                  className={dark ? 'text-white' : 'text-[#111]'}
                >
                  Hi, {firstName}
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
                        {p.product_type === 'flipbook' && (
                          <button
                            className="text-xs text-[#F27D26] mt-1 hover:underline"
                            onClick={() => {
                              setDropdownOpen(false)
                              setDevicesOpen(true)
                            }}
                          >
                            Manage devices
                          </button>
                        )}
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
          </div>
        )}

        {/* Gradient fade — child element that bleeds below the bar */}
        <div
          className="absolute left-0 right-0 top-full h-6 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${gradientColor}, transparent)` }}
        />
      </header>

      {/* Manage Devices Dialog */}
      <Dialog open={devicesOpen} onOpenChange={setDevicesOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Active Devices</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {devices.length === 0 ? (
              <p className="text-sm text-[#aaa]">No devices registered.</p>
            ) : (
              devices.map(device => (
                <div key={device.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-[#111] truncate">
                      {device.device_label ?? 'Unknown device'}
                    </p>
                    <p className="text-xs text-[#aaa]">
                      Last seen {new Date(device.last_seen).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogoutDevice(device.id)}
                    className="text-xs text-red-500 hover:underline shrink-0"
                  >
                    Log out
                  </button>
                </div>
              ))
            )}
          </div>
          {devices.length > 0 && (
            <button
              onClick={handleLogoutAll}
              className="mt-4 w-full py-2 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Log out of all devices
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
