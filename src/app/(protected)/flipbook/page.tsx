import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import FlipbookPage from "@/components/FlipbookPage"

export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  return <FlipbookPage user={session.user} />
}
