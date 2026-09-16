"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase/firebase"
import { AppUser, UserRole } from "@/lib/types/user"
import { getAppUser } from "@/lib/utils/auth"

interface AuthContextValue {
  firebaseUser: User | null
  user: AppUser | null
  loading: boolean
  error: string | null
  signUpWithEmail: (params: {
    email: string
    password: string
    role: UserRole
    displayName: string
  }) => Promise<AppUser>
  signInWithEmail: (email: string, password: string) => Promise<AppUser>
  signInWithGoogle: (role?: UserRole) => Promise<AppUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pendingGoogleRole = useRef<UserRole | null>(null)
  const pendingName = useRef<string | undefined>(undefined)

  useEffect(() => {
    let generation = 0
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      const current = ++generation
      setFirebaseUser(nextUser)
      setUser(null)
      setLoading(true)
      setError(null)

      if (!nextUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const appUser = await getAppUser(nextUser, pendingGoogleRole.current ?? "provider", pendingName.current)
        if (generation === current) setUser(appUser)
      } catch (error) {
        console.error(error)
        if (generation === current) {
          setUser(null)
          setError("Dein Profil konnte nicht geladen werden. Bitte melde dich erneut an.")
        }
      } finally {
        if (generation === current) setLoading(false)
      }
    })

    return () => { generation++; unsubscribe() }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      error,
      signUpWithEmail: async ({ email, password, role, displayName }) => {
        pendingGoogleRole.current = role
        pendingName.current = displayName.trim()
        try {
          const credentials = await createUserWithEmailAndPassword(auth, email, password)

          if (displayName.trim()) {
            await updateProfile(credentials.user, { displayName: displayName.trim() })
          }

          const appUser = await getAppUser(credentials.user, role, displayName.trim())
          if (auth.currentUser?.uid === appUser.uid) setUser(appUser)
          return appUser
        } finally {
          pendingGoogleRole.current = null
          pendingName.current = undefined
        }
      },
      signInWithEmail: async (email, password) => {
        const credentials = await signInWithEmailAndPassword(auth, email, password)
        const appUser = await getAppUser(credentials.user)
        if (auth.currentUser?.uid === appUser.uid) setUser(appUser)
        return appUser
      },
      signInWithGoogle: async (role = "provider") => {
        pendingGoogleRole.current = role

        try {
          const credentials = await signInWithPopup(auth, googleProvider)
          const appUser = await getAppUser(credentials.user, role)
          if (auth.currentUser?.uid === appUser.uid) setUser(appUser)
          return appUser
        } finally {
          pendingGoogleRole.current = null
        }
      },
      logout: async () => {
        await signOut(auth)
        setUser(null)
      },
    }),
    [firebaseUser, user, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
