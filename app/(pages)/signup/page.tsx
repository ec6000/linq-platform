"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"
import AuthCard from "@/components/auth/AuthCard"
import { useAuth } from "@/components/auth/AuthProvider"
import { UserRole } from "@/lib/types/user"
import { getHomeForRole } from "@/lib/utils/auth"

export default function SignUpPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("provider")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const appUser = await signUpWithEmail({
        displayName: name,
        email,
        password,
        role,
      })
      router.replace(getHomeForRole(appUser.role))
    } catch (err) {
      console.error(err)
      setError("Sign up fehlgeschlagen. Bitte versuche es erneut.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      const appUser = await signInWithGoogle()
      router.replace(getHomeForRole(appUser.role))
    } catch (err) {
      console.error(err)
      setError("Google Sign up fehlgeschlagen.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Sign up"
      subtitle="Erstelle dein Konto und starte direkt."
      footerText="Schon registriert?"
      footerLinkText="Login"
      footerHref="/login"
    >
      <form onSubmit={handleSignUp} className="space-y-3">
        <label className="flex flex-col gap-1 text-sm text-text/70">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] outline-none transition focus:border-primary/40"
          />
        </label>

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] outline-none transition focus:border-primary/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text/70">
          Rolle
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-xl border border-secondary bg-background px-3 py-2.5 text-[14px] outline-none transition focus:border-primary/40"
          >
            <option value="provider">Provider</option>
            <option value="customer">Customer</option>
          </select>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Konto erstellen
        </button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-secondary" />
        <span className="text-xs uppercase text-text/45">oder</span>
        <div className="h-px flex-1 bg-secondary" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-secondary px-4 py-2.5 text-sm font-medium text-text transition hover:bg-secondary/40 disabled:opacity-50"
      >
        <Chrome size={16} />
        Mit Google registrieren
      </button>
    </AuthCard>
  )
}
