'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Chrome/Edge on desktop register the installed app in chrome://apps but
// don't place a Desktop icon by default — that's a separate, manual step
// only those platforms require. Mobile install flows (Android/iOS) already
// place a home screen icon automatically, so the tip would be noise there.
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export default function PWAInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showDesktopTip, setShowDesktopTip] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      if (!isMobileDevice()) setShowDesktopTip(true)
    }
  }

  return (
    <>
      {!isInstalled && installPrompt && (
        <button onClick={handleInstall} className="kk-outline whitespace-nowrap" style={{ padding: "8px 12px", fontSize: 12 }}>
          <Download className="w-3.5 h-3.5" />
          Add to Home Screen
        </button>
      )}

      {showDesktopTip && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs bg-[#f5f3ed] shadow-2xl border border-[#aaa79e] p-5">
          <button
            onClick={() => setShowDesktopTip(false)}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-[#aaa] hover:text-[#111] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs uppercase tracking-widest text-[#aaa] mb-2">App installed</p>
          <p className="text-sm text-[#111] leading-relaxed mb-3">
            Want an icon on your Desktop too? Chrome doesn&apos;t add one automatically.
          </p>
          <ol className="text-xs text-[#555] leading-relaxed list-decimal list-inside space-y-1">
            <li>Open a new tab and go to <span className="font-mono text-[#111]">chrome://apps</span></li>
            <li>Right-click the Infinite Bloom tile</li>
            <li>Choose &quot;Create shortcut...&quot; and check &quot;Open as window&quot;</li>
          </ol>
        </div>
      )}
    </>
  )
}
