import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { sql } from '@/lib/db'
import SharedNavbar from '@/components/SharedNavbar'
import TestimonialAdminList from '@/components/TestimonialAdminList'

interface TestimonialRow {
  id: string
  author_name: string
  author_title: string | null
  author_email: string | null
  content: string
  rating: number | null
  is_approved: boolean
  created_at: string
}

export default async function TestimonialsAdminPage() {
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

  const testimonials = (await sql`
    SELECT id, author_name, author_title, author_email, content, rating, is_approved, created_at
    FROM testimonials
    ORDER BY is_approved ASC, created_at DESC
  `) as TestimonialRow[]

  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar user={session.user} />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-[#111] mb-1">Testimonials</h1>
        <p className="text-sm text-[#666] mb-6">
          Pending review appear first. Approved ones show in the "What Readers Say" section.
        </p>
        <TestimonialAdminList testimonials={testimonials} />
      </main>
    </div>
  )
}
