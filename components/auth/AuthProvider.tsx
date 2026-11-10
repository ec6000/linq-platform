"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase/firebase"
import type { AppUser, UserRole } from "@/lib/types/user"
import { getAppUser } from "@/lib/utils/auth"

interface AuthContextValue {
  user: AppUser | null
  loading: boolean
  error: string | null
  signUpWithEmail: (params: { email: string; password: string; role: UserRole; displayName: string }) => Promise<AppUser>
  signInWithEmail: (email: string, password: string) => Promise<AppUser>
  signInWithGoogle: (role?: UserRole) => Promise<AppUser>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Firebase error codes → something a person can act on. */
export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string } | null)?.code ?? ""
  if (code.includes("email-already-in-use")) return "Für diese E-Mail gibt es schon ein Konto. Bitte melde dich an."
  if (code.includes("weak-password")) return "Das Passwort braucht mindestens 6 Zeichen."
  if (code.includes("invalid-email") || code.includes("missing-email")) return "Diese E-Mail-Adresse ist ungültig."
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "E-Mail oder Passwort stimmen nicht."
  }
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "Die Anmeldung wurde abgebrochen."
  if (code.includes("too-many-requests")) return "Zu viele Versuche. Bitte kurz warten."
  if (code.includes("network")) return "Keine Verbindung. Bitte später erneut versuchen."
  return "Das hat nicht geklappt. Bitte erneut versuchen."
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /**
   * Role and name chosen on the sign-up form. The auth listener fires before
   * the sign-up call returns, so it must already know them when it creates
   * the profile — otherwise a new customer would briefly become the default.
   */
  const pending = useRef<{ role?: UserRole; name?: string }>({})

  useEffect(() => {
    let generation = 0
    const unsubscribe = onAuthStateChanged(auth, async (next) => {
      const current = ++generation
      setUser(null)
      setError(null)
      setLoading(Boolean(next))
      if (!next) return

      try {
        const appUser = await getAppUser(next, pending.current.role, pending.current.name)
        if (generation === current) setUser(appUser)
      } catch (err) {
        console.error(err)
        if (generation === current) setError("Dein Profil konnte nicht geladen werden. Bitte melde dich erneut an.")
      } finally {
        if (generation === current) setLoading(false)
      }
    })
    return () => {
      generation++
      unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    async function finish(firebaseUser: User, role?: UserRole, name?: string) {
      const appUser = await getAppUser(firebaseUser, role, name)
      if (auth.currentUser?.uid === appUser.uid) setUser(appUser)
      return appUser
    }

    async function withPending<T>(role: UserRole | undefined, name: string | undefined, run: () => Promise<T>) {
      pending.current = { role, name }
      try {
        return await run()
      } finally {
        pending.current = {}
      }
    }

    return {
      user,
      loading,
      error,
      signUpWithEmail: ({ email, password, role, displayName }) => {
        const name = displayName.trim()
        return withPending(role, name, async () => {
          const { user: created } = await createUserWithEmailAndPassword(auth, email, password)
          if (name) await updateProfile(created, { displayName: name })
          return finish(created, role, name)
        })
      },
      signInWithEmail: async (email, password) => {
        const { user: signedIn } = await signInWithEmailAndPassword(auth, email, password)
        return finish(signedIn)
      },
      signInWithGoogle: (role) =>
        withPending(role, undefined, async () => {
          const { user: signedIn } = await signInWithPopup(auth, googleProvider)
          return finish(signedIn, role)
        }),
      resetPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
      logout: async () => {
        await signOut(auth)
        setUser(null)
      },
    }
  }, [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
