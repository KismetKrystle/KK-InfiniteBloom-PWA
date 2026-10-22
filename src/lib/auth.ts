import { betterAuth } from "better-auth"
import { magicLink } from "better-auth/plugins"
import { Pool } from "pg"
import { sendEmail } from "@/lib/email"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  plugins: [
    // Magic link is the only way in: proving the inbox is what lets an
    // email-matched access grant (e.g. a Payment Link purchase) unlock the book.
    magicLink({
      expiresIn: 60 * 15,
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Open your copy of The Infinite Bloom",
          text: `Click below to open The Infinite Bloom — no password needed:\n\n${url}\n\nThis link works once and expires in 15 minutes. You can always get a fresh one at read.kismetkrystle.com with this email.\n\nIf you didn't request this, you can safely ignore this email.`,
        })
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
