import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export default async function PostLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  // Create user_profiles row on first login — no-op on subsequent logins.
  // ON CONFLICT DO NOTHING (no target column) handles both the auth_user_id
  // and email unique constraints without throwing.
  await sql`
    INSERT INTO user_profiles (auth_user_id, email, display_name)
    VALUES (
      ${session.user.id},
      ${session.user.email},
      ${session.user.name ?? null}
    )
    ON CONFLICT DO NOTHING
  `

  const rows = await sql`
    SELECT p.id FROM purchases p
    JOIN user_profiles up ON p.user_id = up.id
    WHERE up.auth_user_id = ${session.user.id}
      AND p.status = 'completed'
      AND p.access_granted = true
    LIMIT 1
  `

  redirect(rows.length > 0 ? "/flipbook" : "/dashboard")
}
