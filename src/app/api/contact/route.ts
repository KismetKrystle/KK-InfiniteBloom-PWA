import { NextRequest, NextResponse } from "next/server"
import { sendEmail, NOTES_TO } from "@/lib/email"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const { name, email, inquiries, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const inquiryList =
    Array.isArray(inquiries) && inquiries.length > 0
      ? inquiries.join(", ")
      : "Not specified"

  const sent = await sendEmail({
    to: NOTES_TO,
    replyTo: email,
    subject: `New inquiry: ${inquiryList}`,
    text: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiryList}\n\n${message}`,
  })

  if (!sent) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
