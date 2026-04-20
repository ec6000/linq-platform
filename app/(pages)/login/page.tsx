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
      title="Login"
      subtitle="Melde dich an, um LiNQ zu nutzen."
      footerText="Noch kein Konto?"
      footerLinkText="Sign up"
      footerHref="/signup"
    >
      <form onSubmit={handleEmailLogin} className="space-y-3">
        <label className="flex flex-col gap-1 text-sm text-text/70">
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] outline-none transition focus:border-primary/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text/70">
          Passwort
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] outline-none transition focus:border-primary/40"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Einloggen
        </button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-secondary" />
        <span className="text-xs uppercase text-text/45">oder</span>
        <div className="h-px flex-1 bg-secondary" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary px-4 py-2.5 text-sm font-medium text-text transition hover:bg-secondary/40 disabled:opacity-50"
      >
        <Chrome size={16} />
        Mit Google anmelden
      </button>
    </AuthCard>
  )
}
