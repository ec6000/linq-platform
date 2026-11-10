"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"
import AuthCard from "@/components/auth/AuthCard"
import { authErrorMessage, useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole } from "@/lib/utils/auth"

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle, resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const appUser = await signInWithEmail(email, password)
      router.replace(getHomeForRole(appUser.role))
    } catch (err) {
      console.error(err)
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  /** Uses the address already typed above; the answer never reveals whether an account exists. */
  const handleReset = async () => {
    setError(null)
    setNotice(null)
    if (!email.trim()) return setError("Trag oben deine E-Mail ein, dann schicken wir dir einen Link.")

    try {
      await resetPassword(email)
    } catch (err) {
      const code = (err as { code?: string } | null)?.code ?? ""
      if (!code.includes("user-not-found")) return setError(authErrorMessage(err))
    }
    setNotice("Wenn es zu dieser Adresse ein Konto gibt, ist jetzt eine E-Mail mit einem Link unterwegs.")
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      const appUser = await signInWithGoogle()
      router.replace(getHomeForRole(appUser.role))
    } catch (err) {
      console.error(err)
      setError(authErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Willkommen zurück"
      subtitle="Melde dich an, um LiNQ zu nutzen."
      footerText="Noch kein Konto?"
      footerLinkText="Jetzt registrieren"
      footerHref="/signup"
    >
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="login-email">
            E-Mail
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field field-h"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="field-label" htmlFor="login-password">
              Passwort
            </label>
            <button type="button" onClick={handleReset} className="link-quiet text-[12.5px]">
              Vergessen?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="field field-h"
          />
        </div>

        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="notice notice-success">
            {notice}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block mt-1">
          {loading ? "Anmelden…" : "Einloggen"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="hairline flex-1" />
        <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-text/35">
          oder
        </span>
        <span className="hairline flex-1" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn btn-outline btn-lg btn-block"
      >
        <Chrome size={16} strokeWidth={1.9} aria-hidden />
        Mit Google anmelden
      </button>
    </AuthCard>
  )
}
