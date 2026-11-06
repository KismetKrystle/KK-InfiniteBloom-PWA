// All outgoing mail goes through Resend. EMAIL_FROM must use a domain
// verified in Resend — the onboarding@resend.dev fallback only delivers to
// the Resend account owner's own inbox, so real readers never receive it.
const DEFAULT_FROM = "Infinite Bloom <onboarding@resend.dev>"

export const NOTES_TO = process.env.NOTES_TO_EMAIL ?? "kismetthepoet@gmail.com"

export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  replyTo?: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error(`Cannot send email "${subject}": RESEND_API_KEY not set`)
    return false
  }

  const reply = replyTo ?? process.env.EMAIL_REPLY_TO
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to,
      subject,
      text,
      ...(reply ? { reply_to: reply } : {}),
    }),
  })

  if (!res.ok) {
    console.error(`Failed to send email "${subject}":`, await res.text().catch(() => res.statusText))
    return false
  }
  return true
}
