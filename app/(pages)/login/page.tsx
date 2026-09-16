"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"
import AuthCard from "@/components/auth/AuthCard"
import { useAuth } from "@/components/auth/AuthProvider"
import { getHomeForRole } from "@/lib/utils/auth"

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
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
      setError("Login fehlgeschlagen. Bitte Daten prüfen.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      const appUser = await signInWithGoogle()
      router.replace(getHomeForRole(appUser.role))
    } catch (err) {
      console.error(err)
      setError("Google Login fehlgeschlagen.")
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
          <label className="field-label" htmlFor="login-password">
            Passwort
          </label>
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
