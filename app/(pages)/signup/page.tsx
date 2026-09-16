"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Chrome } from "lucide-react"
import AuthCard from "@/components/auth/AuthCard"
import { useAuth } from "@/components/auth/AuthProvider"
import { UserRole } from "@/lib/types/user"
import { getHomeForRole } from "@/lib/utils/auth"

const roleOptions = [
  {
    value: "customer" as const,
    title: "Kunde",
    description: "Aufträge erstellen und passende Dienstleister finden.",
  },
  {
    value: "provider" as const,
    title: "Dienstleister",
    description: "Services anbieten und neue Aufträge annehmen.",
  },
]

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
      title="Konto erstellen"
      subtitle="Starte als Kunde oder Dienstleister – in unter einer Minute."
      footerText="Schon registriert?"
      footerLinkText="Anmelden"
      footerHref="/login"
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div>
          <label className="field-label" htmlFor="signup-name">
            Name
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="field field-h"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="signup-email">
            E-Mail
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field field-h"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="signup-password">
            Passwort
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="field field-h"
          />
          <p className="field-hint mt-1.5">Mindestens 6 Zeichen.</p>
        </div>

        <fieldset className="mt-1">
          <legend className="field-label">Registrieren als</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const selected = role === option.value

              return (
                <label
                  key={option.value}
                  data-selected={selected ? "true" : "false"}
                  className="relative cursor-pointer rounded-md border border-secondary p-3.5 transition-all duration-150 hover:border-text/20 data-[selected=true]:border-primary data-[selected=true]:bg-primary/4"
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-text">{option.title}</span>
                    {selected && (
                      <Check size={14} strokeWidth={2.6} className="text-primary" aria-hidden />
                    )}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-text/55">
                    {option.description}
                  </span>
                </label>
              )
            })}
          </div>
          <p className="field-hint mt-2">
            Diese Auswahl gilt auch, wenn du dich mit Google registrierst.
          </p>
        </fieldset>

        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block mt-1">
          {loading ? "Konto wird erstellt…" : "Konto erstellen"}
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
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="btn btn-outline btn-lg btn-block"
      >
        <Chrome size={16} strokeWidth={1.9} aria-hidden />
        Mit Google registrieren
      </button>
    </AuthCard>
  )
}
