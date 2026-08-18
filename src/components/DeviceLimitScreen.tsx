'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SharedNavbar from './SharedNavbar'

interface Device {
  id: string
  device_label: string | null
  last_seen: string
}

interface DeviceLimitScreenProps {
  user: { id: string; name: string | null; email: string }
}

export default function DeviceLimitScreen({ user }: DeviceLimitScreenProps) {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/user/devices')
      .then((r) => r.json())
      .then(setDevices)
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  async function handleLogout(deviceId: string) {
    await fetch('/api/user/devices', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    })
    setDevices((prev) => prev.filter((d) => d.id !== deviceId))
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={user} />
      <main className="max-w-md mx-auto px-4 pt-24 pb-12 text-center">
        <h1 className="text-xl font-bold text-[#111] mb-2">Device limit reached</h1>
        <p className="text-sm text-[#666] mb-8">
          Your Infinite Bloom flipbook is already active on 2 devices. Log out of one below to read here instead.
        </p>

        {!loaded ? (
          <p className="text-sm text-[#aaa]">Loading…</p>
        ) : (
          <div className="space-y-3 text-left mb-8">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#d4d4d4] p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#111] truncate">{device.device_label ?? 'Unknown device'}</p>
                  <p className="text-xs text-[#aaa]">Last seen {new Date(device.last_seen).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleLogout(device.id)}
                  className="text-xs text-red-500 hover:underline shrink-0"
                >
                  Log out
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.refresh()}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F27D26' }}
        >
          Try again
        </button>
      </main>
    </div>
  )
}
