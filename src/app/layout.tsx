import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Infinite Bloom",
  description: "Evolving by Perspective",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
}

export const viewport = {
  themeColor: "#1a4d5c",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
