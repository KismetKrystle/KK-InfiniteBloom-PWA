import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { uploadPublicObject } from "@/lib/r2"

const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"])

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/png": return "png"
    case "image/webp": return "webp"
    case "image/heic": return "heic"
    case "image/heif": return "heif"
    default: return "jpg"
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const orderNumber = formData.get("orderNumber")
  const photo = formData.get("photo")

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Photo is required." }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(photo.type)) {
    return NextResponse.json({ error: "Photo must be a JPEG, PNG, WEBP, or HEIC image." }, { status: 400 })
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return NextResponse.json({ error: "Photo must be under 8MB." }, { status: 400 })
  }

  try {
    const bytes = Buffer.from(await photo.arrayBuffer())
    const key = `book-claims/${session.user.id}/${randomUUID()}.${extensionFor(photo.type)}`
    const photoUrl = await uploadPublicObject(key, bytes, photo.type)

    const result = await sql`
      INSERT INTO book_claims (user_id, order_number, photo_url, status, reviewed_at)
      SELECT id, ${typeof orderNumber === "string" && orderNumber.trim() ? orderNumber.trim() : null}, ${photoUrl}, 'approved', NULL
      FROM user_profiles WHERE auth_user_id = ${session.user.id}
      ON CONFLICT (user_id) DO UPDATE
      SET order_number = EXCLUDED.order_number,
          photo_url = EXCLUDED.photo_url,
          status = 'approved',
          reviewed_at = NULL
      RETURNING id, status
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Could not find your account." }, { status: 400 })
    }

    return NextResponse.json({ success: true, status: result[0].status })
  } catch (error) {
    console.error("book-claims submission failed", error)
    return NextResponse.json({ error: "Failed to submit claim." }, { status: 500 })
  }
}
