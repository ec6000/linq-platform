import { auth } from "@/lib/firebase/firebase"
import { getAppUser } from "@/lib/utils/auth"
import type { UserRole } from "@/lib/types/user"

/**
 * UX validation only. Firestore Security Rules must independently enforce
 * ownership — this can only ever make the interface honest, not the data safe.
 */
export async function requireAppUser(role?: UserRole) {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) throw new Error("Bitte zuerst anmelden.")
  const user = await getAppUser(firebaseUser)
  if (role && user.role !== role) throw new Error("Diese Aktion ist für dein Konto nicht verfügbar.")
  if (auth.currentUser?.uid !== user.uid) throw new Error("Die Sitzung hat sich geändert. Bitte erneut versuchen.")
  return user
}
