import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import FlipbookPage from "@/components/FlipbookPage"

export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: await headers() })

  let hasPurchased = false
  if (session) {
    const rows = await sql`
      SELECT 1 FROM purchases pu
      JOIN products p ON pu.product_id = p.id
      WHERE pu.user_id = (
        SELECT id FROM user_profiles WHERE auth_user_id = ${session.user.id}
      )
      AND p.type = 'flipbook'
      AND pu.status = 'completed'
      AND pu.access_granted = true
      LIMIT 1
    `
    hasPurchased = rows.length > 0
  }

  return (
    <>
      <FlipbookPage user={session?.user ?? null} hasPurchased={hasPurchased} />
      <footer className="py-4 text-center text-xs text-[#aaa]">
        Krystle Wilson © 2026
      </footer>
    </>
  )
}
