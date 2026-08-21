"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setStatus("submitting")

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })

    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.")
      setStatus("idle")
      return
    }

    // Always show the same confirmation, whether or not the email exists —
    // don't let this endpoint reveal which addresses have accounts.
    setStatus("sent")
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            {status === "sent"
              ? "Check your email for a reset link."
              : "We'll email you a link to reset it."}
          </p>
        </div>

        {status === "sent" ? (
          <p className="text-sm text-center text-muted-foreground">
            If an account exists for that email, a reset link is on its way. It may take a
            few minutes to arrive.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "submitting"}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === "submitting" ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-muted-foreground">
          <Link href="/login" className="underline hover:text-foreground transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
