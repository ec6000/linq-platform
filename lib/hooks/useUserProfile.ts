"use client"

import { useCallback, useEffect, useState } from "react"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { Profile } from "@/lib/types/profile"

const emptyProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  notificationsEnabled: true,
}

export function useUserProfile(uid?: string) {
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    if (!uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const snapshot = await getDoc(doc(db, "users", uid))

      if (!snapshot.exists()) {
        setProfile(emptyProfile)
        return
      }

      const data = snapshot.data()
      setProfile({
        firstName: typeof data.firstName === "string" ? data.firstName : "",
        lastName: typeof data.lastName === "string" ? data.lastName : "",
        email: typeof data.email === "string" ? data.email : "",
        phone: typeof data.phone === "string" ? data.phone : "",
        company: typeof data.company === "string" ? data.company : "",
        notificationsEnabled:
          typeof data.notificationsEnabled === "boolean" ? data.notificationsEnabled : true,
      })
    } catch (err) {
      console.error(err)
      setError("Profil konnte nicht geladen werden.")
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const saveProfile = useCallback(
    async (nextProfile: Profile) => {
      if (!uid) {
        throw new Error("No uid provided")
      }

      setSaving(true)
      setError(null)

      try {
        await setDoc(
          doc(db, "users", uid),
          {
            ...nextProfile,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )

        setProfile(nextProfile)
      } catch (err) {
        console.error(err)
        setError("Profil konnte nicht gespeichert werden.")
        throw err
      } finally {
        setSaving(false)
      }
    },
    [uid],
  )

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile,
    reload: loadProfile,
  }
}
