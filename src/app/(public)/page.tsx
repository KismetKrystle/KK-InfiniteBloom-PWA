import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import Homepage from "./_components/Homepage"
import BookSchema from "@/components/BookSchema"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)

  let hasPurchase = false
  if (session) {
    const rows = await sql`
      SELECT 1 FROM purchases p
      JOIN user_profiles up ON p.user_id = up.id
      WHERE up.auth_user_id = ${session.user.id}
        AND p.status = 'completed'
        AND p.access_granted = true
      UNION ALL
      SELECT 1 FROM access_grants ag
      WHERE lower(ag.email) = lower(${session.user.email})
        AND ag.revoked_at IS NULL
        AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
      LIMIT 1
    `
    hasPurchase = rows.length > 0
  }

  const user = session
    ? { id: session.user.id, name: session.user.name ?? null, email: session.user.email }
    : null

  return (
    <>
      <BookSchema />
      <Homepage user={user} hasPurchase={hasPurchase} />
    </>
  )
}
