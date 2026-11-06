import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { Pool } from "pg"
import { sendEmail } from "@/lib/email"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  // Readers stay signed in for 90 days; each visit after the first day
  // pushes that out again, so regular readers effectively never sign in twice.
  session: {
    expiresIn: 60 * 60 * 24 * 90,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    // A 6-digit emailed code is the only way in. It's typed into the same
    // browser (or installed app) the reader is using — unlike a link, which
    // opens wherever the mail app decides. Proving the inbox is also what
    // lets an email-matched access grant (a Payment Link purchase) count.
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 15,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== "sign-in") return
        await sendEmail({
          to: email,
          subject: `${otp} is your code for The Infinite Bloom`,
          text: `Your code to open The Infinite Bloom:\n\n${otp}\n\nEnter it on the page where you asked for it. It expires in 15 minutes.\n\nYou can always get a new code at read.kismetkrystle.com with this email. If you didn't ask for one, you can ignore this email.`,
        })
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
