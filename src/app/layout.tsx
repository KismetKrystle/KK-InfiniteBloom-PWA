import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Infinite Bloom",
  description: "Evolving by Perspective",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
