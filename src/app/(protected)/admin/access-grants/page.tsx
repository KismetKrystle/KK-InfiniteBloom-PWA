import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import SharedNavbar from '@/components/SharedNavbar'
import AccessGrantAdminList from '@/components/AccessGrantAdminList'

interface AccessGrantRow {
  id: string
  email: string
  note: string | null
  granted_by: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

export default async function AccessGrantsAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const profileRows = await sql`
    SELECT role FROM user_profiles WHERE auth_user_id = ${session.user.id}
  `
  const isAdmin = profileRows[0]?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <SharedNavbar user={session.user} />
        <main className="max-w-2xl mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-sm text-[#aaa]">You don&apos;t have access to this page.</p>
        </main>
      </div>
    )
  }

  const grants = (await sql`
    SELECT id, email, note, granted_by, expires_at, revoked_at, created_at
    FROM access_grants
    ORDER BY revoked_at IS NOT NULL, created_at DESC
  `) as AccessGrantRow[]

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session.user} />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-[#111] mb-1">Access Grants</h1>
        <p className="text-sm text-[#666] mb-6">
          Give an email free access to the digital flipbook and audio, no purchase required.
          Access applies as soon as they sign in with that email — same 2-device limit as a purchase.
        </p>
        <AccessGrantAdminList grants={grants} />
      </main>
    </div>
  )
}
