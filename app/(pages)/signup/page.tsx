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
  const [role, setRole] = useState<UserRole>("customer")
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
      const appUser = await signInWithGoogle(role)
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
      subtitle="Erstelle dein Konto als Kunde oder Provider und starte direkt."
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

        <fieldset className="space-y-2">
          <legend className="text-sm text-text/70">Registrieren als</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                value: "customer" as const,
                title: "Kunde",
                description: "Aufträge erstellen und passende Provider finden.",
              },
              {
                value: "provider" as const,
                title: "Provider",
                description: "Services anbieten und Jobs annehmen.",
              },
            ].map((option) => {
              const selected = role === option.value

              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selected
                      ? "border-primary bg-primary/5 text-text"
                      : "border-secondary text-text/65 hover:bg-secondary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-medium">{option.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-text/55">
                    {option.description}
                  </span>
                </label>
              )
            })}
          </div>
          <p className="text-xs text-text/45">
            Diese Auswahl gilt auch, wenn du dich mit Google registrierst.
          </p>
        </fieldset>

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
