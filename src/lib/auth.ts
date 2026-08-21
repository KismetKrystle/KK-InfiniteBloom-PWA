import { betterAuth } from "better-auth"
import { Pool } from "pg"

async function sendResetPasswordEmail({ user, url }: { user: { email: string }; url: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("Cannot send password reset email: RESEND_API_KEY not set")
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Infinite Bloom <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset your Infinite Bloom password",
      text: `Someone requested a password reset for your Infinite Bloom account.\n\nReset your password: ${url}\n\nIf you didn't request this, you can safely ignore this email — your password won't change.`,
    }),
  })

  if (!res.ok) {
    console.error("Failed to send password reset email:", await res.text().catch(() => res.statusText))
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ user, url })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
