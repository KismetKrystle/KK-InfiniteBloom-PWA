import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { checkDeviceAccess } from "@/lib/devices"
import FlipbookPage from "@/components/FlipbookPage"
import DeviceLimitScreen from "@/components/DeviceLimitScreen"

// Only one active book/tenant today — Step 4 will resolve this from the
// route/tenant context instead of a constant once a second book exists.
const BOOK_SLUG = "kismet-krystle"

export default async function FlipbookRoute() {
  const hdrs = await headers()
  const session = await auth.api.getSession({ headers: hdrs })

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

  if (session && hasPurchased) {
    const deviceId = hdrs.get("x-device-id")
    if (deviceId) {
      const { allowed } = await checkDeviceAccess(session.user.id, deviceId, hdrs.get("user-agent"))
      if (!allowed) {
        return <DeviceLimitScreen user={session.user} />
      }
    }
  }

  return (
    <>
      <FlipbookPage user={session?.user ?? null} hasPurchased={hasPurchased} bookSlug={BOOK_SLUG} />
      <footer className="py-4 text-center text-xs text-[#aaa]">
        Krystle Wilson © 2026
      </footer>
    </>
  )
}
