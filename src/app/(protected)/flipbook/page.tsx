import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import FlipbookPage from "@/components/FlipbookPage"
import SharedNavbar from "@/components/SharedNavbar"

export default async function FlipbookRoute() {
  const session = await auth.api.getSession({ headers: headers() })
  if (!session) redirect("/login")

  return (
    <>
      <SharedNavbar user={session.user} />
      <div className="pt-12">
        <FlipbookPage user={session.user} />
      </div>
      <footer className="py-4 text-center text-xs text-[#aaa]">
        Krystle Wilson © 2026
      </footer>
    </>
  )
}
