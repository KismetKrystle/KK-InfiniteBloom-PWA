import type { Metadata } from "next"
import "./globals.css"

const SITE_URL = "https://www.kismetkrystle.com"
const OG_IMAGE = "https://res.cloudinary.com/dsoojlgg1/image/upload/v1779156322/book_at_angle-v2_bg-removed_aqt9d7.png"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kismet Krystle | Poet & Speaker | Infinite Bloom Author",
  description:
    "Infinite Bloom: 45 poems by Kismet Krystle, an award-winning poet & speaker. Read, listen, and explore 143 reflective insights. Available as digital flipbook ($20) and full-color physical book ($33).",
  keywords: ["poetry book", "spoken word", "Kismet Krystle", "audio poems", "digital book"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Kismet Krystle | Poet & Speaker | Infinite Bloom Author",
    description:
      "45 poems with author narration. Read, listen, revisit offline. Explore 143 reflective insights about growth, spirituality, and human connection.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Infinite Bloom Poetry Book Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kismet Krystle | Poet & Speaker | Infinite Bloom Author",
    description: "45 poems with author narration. Read, listen, and explore reflective insights.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "Kismet Krystle" }],
  creator: "Kismet Krystle",
}

export const viewport = {
  themeColor: "#1a4d5c",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
