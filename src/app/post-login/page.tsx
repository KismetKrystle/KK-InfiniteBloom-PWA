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

  // /flipbook itself resolves purchased vs. preview state — signing in never
  // implies access on its own, so every login lands there regardless of purchase status.
  redirect("/flipbook")
}
