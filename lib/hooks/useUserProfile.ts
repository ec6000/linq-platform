"use client"

import { useCallback, useMemo, useState } from "react"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/firebase"
import type { Profile } from "@/lib/types/profile"
import { useFirestoreDocument } from "@/lib/hooks/useFirestoreQuery"
import { isValidDocumentId } from "@/lib/utils/validation"

const EMPTY_PROFILE: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  notificationsEnabled: true,
}

type ProfileDoc = Profile & { id: string }

function toProfile(data: Partial<ProfileDoc> | null): Profile {
  if (!data) return EMPTY_PROFILE
  return {
    firstName: typeof data.firstName === "string" ? data.firstName : "",
    lastName: typeof data.lastName === "string" ? data.lastName : "",
    email: typeof data.email === "string" ? data.email : "",
    phone: typeof data.phone === "string" ? data.phone : "",
    company: typeof data.company === "string" ? data.company : "",
    notificationsEnabled:
      typeof data.notificationsEnabled === "boolean" ? data.notificationsEnabled : true,
  }
}

/** The user document is keyed by auth UID, so this is a direct document read. */
export function useUserProfile(uid?: string) {
  const source = useMemo(() => (isValidDocumentId(uid) ? doc(db, "users", uid) : null), [uid])
  const { data, loading, error: loadError } = useFirestoreDocument<ProfileDoc>(
    source,
    "Profil konnte nicht geladen werden.",
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveProfile = useCallback(
    async (profile: Profile) => {
      setSaving(true)
      setError(null)
      try {
        if (!uid || auth.currentUser?.uid !== uid) throw new Error("Bitte erneut anmelden.")
        await updateDoc(doc(db, "users", uid), {
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          company: profile.company.trim(),
          notificationsEnabled: profile.notificationsEnabled,
          updatedAt: serverTimestamp(),
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Profil konnte nicht gespeichert werden.")
        throw err
      } finally {
        setSaving(false)
      }
    },
    [uid],
  )

  return { profile: toProfile(data), loading, saving, error: error ?? loadError, saveProfile }
}
