# Digital book launch checklist

What this sets up: a buyer clicks **Buy Digital Book** on kismetkrystle.com, pays $20 through Stripe, and lands on `read.kismetkrystle.com/welcome`. Their email gets a sign-in link, and one click opens the book. Nobody can read the book without a purchase or a grant from you.

Do the parts **in order**. Each one ends with a ✅ check. Don't move on until the check passes.

---

## Part 1 — Point `read.kismetkrystle.com` at the PWA (Vercel + Cloudflare)

1. **Vercel →** the project connected to **KK-InfiniteBloom-PWA** → **Settings → Domains → Add** → `read.kismetkrystle.com`.
2. Vercel shows a **CNAME** target (something like `cname.vercel-dns.com` or `xxxx.vercel-dns-0xx.com`). Copy it.
3. **Cloudflare →** Domains → kismetkrystle.com → **DNS → Records → Add record**
   - Type: `CNAME` · Name: `read` · Target: *(what Vercel showed)*
   - Proxy status: **DNS only (grey cloud)**. Vercel has to see traffic directly to issue the HTTPS certificate.
4. ✅ Vercel shows **Valid Configuration** for `read.kismetkrystle.com`. This can take a few minutes.

## Part 2 — Database (Neon), about 5 minutes

Open **Neon → your project → SQL Editor**, then:

1. **Add the new columns.** Paste the whole file `migrations/0016_stripe_payment_link_grants.sql` and run it. It's safe to run twice.
2. **Check the book's Stripe price.** Run:
   ```sql
   SELECT name, stripe_price_id FROM products WHERE type = 'flipbook';
   ```
   Then in **Stripe → Product catalog**, open the product your **Buy Digital Book** Payment Link sells, and copy its **price ID** (starts with `price_`).
   - If they match, you're done here.
   - If they don't, run this, with your price ID in place of the placeholder:
     ```sql
     UPDATE products SET stripe_price_id = 'price_PASTE_HERE' WHERE type = 'flipbook';
     ```
   This matters: the code unlocks the book only when the purchase used **this** price. That's how the in-person Payment Link is kept from unlocking the digital book.
3. **Make yourself an admin** (for revoking access later):
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'kismetthepoet@gmail.com';
   ```
   If it says `UPDATE 0`, sign in at read.kismetkrystle.com once (after Part 5) and run it again.
4. ✅ `SELECT column_name FROM information_schema.columns WHERE table_name = 'access_grants';` lists `stripe_checkout_session_id` and `stripe_payment_intent_id`.

## Part 3 — Let the app email anyone (Resend), about 15 minutes plus waiting

Right now emails come from `onboarding@resend.dev`. Resend only delivers that address to **your own** inbox, so buyers would never get their link.

1. **Resend → Domains → Add domain** → `kismetkrystle.com`.
2. Resend lists a few DNS records (TXT/MX, usually on a `send` subdomain). Add each one in **Cloudflare DNS** exactly as shown, all **DNS only (grey cloud)**. Don't touch your existing records.
3. Wait for Resend to show **Verified**. Often minutes, sometimes up to a few hours.
4. ✅ Resend shows the domain as **Verified**.

> **Where does `books@kismetkrystle.com` go?** Nowhere. It's only the "From" name on outgoing email. Replies to sign-in emails go to the reply-to address (step 4 below), and "Write to Kismet" notes already reply straight to the reader. If you ever want mail *to* books@ to reach you, turn on **Cloudflare → Email → Email Routing** and forward it to your Gmail.

## Part 4 — Vercel environment variables

**Vercel → PWA project → Settings → Environment Variables.** Set these for **Production** (and Preview if you test on preview links):

| Name | Value | Why |
|---|---|---|
| `BETTER_AUTH_URL` | `https://read.kismetkrystle.com` | Sign-in links are built from this |
| `NEXT_PUBLIC_APP_URL` | `https://read.kismetkrystle.com` (or delete it) | Must not point at the old Vercel URL |
| `EMAIL_FROM` | `Kismet Krystle <books@kismetkrystle.com>` | Only **after** Part 3 is verified |
| `EMAIL_REPLY_TO` | `kismetthepoet@gmail.com` | Where replies to sign-in emails go |
| `NOTES_TO_EMAIL` | `kismetthepoet@gmail.com` | Optional. This is already the default. |
| `STRIPE_SECRET_KEY` | your **live** secret key (`sk_live_…`) | Check that it's live, not test |
| `STRIPE_WEBHOOK_SECRET` | from Part 6, step 1 | |

You can delete `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`. Google sign-in is gone.

Already set and unchanged: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, and all `R2_*` values.

## Part 5 — Deploy the code

Both repos have the work on branch `claude/flipbook-purchase-access-3t5bki`.

1. **Preview first (optional but smart):** Vercel builds a preview of the branch automatically. Its URL is in Vercel → Deployments. Cloudflare does the same for KK-Main (Worker → Deployments → preview URL). Click around both.
2. **Go live:** on GitHub, open each repo → **Pull requests → New** → base `main` ← compare `claude/flipbook-purchase-access-3t5bki` → **Create** → **Merge**. Do the **PWA first, then KK-Main**, so the "Open your book" links work the moment they appear.
3. ✅ `https://read.kismetkrystle.com` shows **"Open your book"** with an email box.
4. ✅ On kismetkrystle.com, **Read a few pages** shows two page spreads and a **Get the digital book · $20** button.

## Part 6 — Stripe

1. **Webhook:** Stripe (Live mode) → **Developers → Webhooks → Add endpoint**
   - URL: `https://read.kismetkrystle.com/api/webhooks/stripe`
   - Events: `checkout.session.completed` and `charge.refunded`
   - Copy the **Signing secret** (`whsec_…`) into Vercel as `STRIPE_WEBHOOK_SECRET`, then **redeploy** (Vercel → Deployments → ⋯ → Redeploy).
   - Delete any old endpoint that points at a `vercel.app` URL or `/api/stripe-webhook`.
2. **Payment Link redirect:** Stripe → **Payment Links → Buy Digital Book → Edit → After payment** → *Don't show confirmation page* → redirect to:
   ```
   https://read.kismetkrystle.com/welcome?session_id={CHECKOUT_SESSION_ID}
   ```
   Type `{CHECKOUT_SESSION_ID}` exactly like that, braces included. Stripe fills it in.
3. Leave the **Buy in Person** link alone. It won't unlock the digital book.

## Part 7 — Test it end to end with a real purchase

1. In a **private window**, go to kismetkrystle.com → **Buy Digital Book** → pay $20 with your own card, using an email you can check.
2. ✅ You land on **"Welcome to The Infinite Bloom"**, and an email arrives from `books@kismetkrystle.com`. Check spam the first time.
3. ✅ Clicking the link opens the book. Try the **Reflections** bubble and **account menu → Write to Kismet**, and check that the note reaches your Gmail.
4. **Refund yourself** in Stripe → Payments → that payment → Refund.
5. ✅ Within a minute or two, refresh the reader: it should say **"We couldn't find your copy."** That proves refunds take access away.

Stripe keeps its processing fee (about $0.90) on a refund. That's the cost of a real test.

## Part 8 — Revoke the email you granted earlier

1. Sign in at `read.kismetkrystle.com` with **your** email (you need the admin role from Part 2, step 3).
2. Go to `https://read.kismetkrystle.com/admin/access-grants`.
3. Find that email → **Revoke**. It's reversible. **Delete** removes it permanently.

Buyers from Payment Links show up on this page too, marked *by stripe*. It doubles as your buyers list.

---

## How it works (for reference)

```
Buy Digital Book (KK-Main)
  → Stripe Payment Link ($20, Stripe collects the email)
  → Stripe redirects to /welcome?session_id=…
       ├─ the server asks Stripe: paid? which price? which email?
       ├─ adds the email to access_grants (once per purchase)
       └─ emails that address a sign-in link (expires in 15 min)
  → buyer clicks the link → signed in → /flipbook → reads
Stripe webhook does the same grant in the background (backup),
and on refund sets revoked_at so access stops.
```

- **Coming back later or on a new device:** read.kismetkrystle.com → enter email → click link. No passwords and no device limit.
- **Someone bought with a different email:** add their real email at `/admin/access-grants`.
- **Turned off for now:** the free time-limited preview, the device limit, password and Google sign-in, the audio page (`/audio` redirects to the book), and the old bento homepage (`/` redirects to the book). The code for audio and the homepage is still in the repo.
