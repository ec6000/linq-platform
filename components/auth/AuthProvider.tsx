"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
import { ensureUserProfile, getAppUser } from "@/lib/utils/auth"

interface AuthContextValue {
  firebaseUser: User | null
  user: AppUser | null
  loading: boolean
  signUpWithEmail: (params: {
    email: string
    password: string
    role: UserRole
    displayName: string
  }) => Promise<AppUser>
  signInWithEmail: (email: string, password: string) => Promise<AppUser>
  signInWithGoogle: () => Promise<AppUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser)

      if (!nextUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const appUser = await getAppUser(nextUser)
        setUser(appUser)
      } catch (error) {
        console.error(error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      user,
      loading,
      signUpWithEmail: async ({ email, password, role, displayName }) => {
        const credentials = await createUserWithEmailAndPassword(auth, email, password)

        if (displayName.trim()) {
          await updateProfile(credentials.user, { displayName: displayName.trim() })
        }

        await ensureUserProfile(credentials.user, role)
        const appUser = await getAppUser(credentials.user)
        setUser(appUser)
        return appUser
      },
      signInWithEmail: async (email, password) => {
        const credentials = await signInWithEmailAndPassword(auth, email, password)
        const appUser = await getAppUser(credentials.user)
        setUser(appUser)
        return appUser
      },
      signInWithGoogle: async () => {
        const credentials = await signInWithPopup(auth, googleProvider)
        await ensureUserProfile(credentials.user, "provider")
        const appUser = await getAppUser(credentials.user)
        setUser(appUser)
        return appUser
      },
      logout: async () => {
        await signOut(auth)
        setUser(null)
      },
    }),
    [firebaseUser, user, loading],
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
