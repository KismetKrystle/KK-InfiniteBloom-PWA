import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 })

  const { name, email, inquiries, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Mail service not configured" }, { status: 500 })
  }

  const inquiryList =
    Array.isArray(inquiries) && inquiries.length > 0
      ? inquiries.join(", ")
      : "Not specified"

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Infinite Bloom <onboarding@resend.dev>",
      to: "kismetthepoet@gmail.com",
      reply_to: email,
      subject: `New inquiry: ${inquiryList}`,
      text: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiryList}\n\n${message}`,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
