import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import type { User } from "firebase/auth"
import { db } from "@/lib/firebase/firebase"
import type { AppUser, UserRole } from "@/lib/types/user"
import { fullName } from "@/lib/types/user"

/**
 * Reads the `users/{uid}` profile, creating it on first sign-in.
 *
 * The auth UID is the document ID and the only user identity in the system, so
 * this needs no counter and therefore no transaction: a plain merge write is
 * idempotent, and two concurrent auth callbacks converge on the same document
 * instead of racing for the next number.
 */
export async function getAppUser(
  user: User,
  fallbackRole: UserRole = "provider",
  displayName = user.displayName ?? "",
): Promise<AppUser> {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)
  const data = snapshot.data() ?? {}

  const [first = "", ...rest] = displayName.trim().split(/\s+/)
  const role: UserRole = data.role === "customer" || data.role === "provider" ? data.role : fallbackRole

  const profile = {
    role,
    email: typeof data.email === "string" && data.email ? data.email : (user.email ?? ""),
    firstName: typeof data.firstName === "string" && data.firstName ? data.firstName : first,
    lastName: typeof data.lastName === "string" && data.lastName ? data.lastName : rest.join(" "),
    phone: typeof data.phone === "string" ? data.phone : "",
    company: typeof data.company === "string" ? data.company : "",
    notificationsEnabled: typeof data.notificationsEnabled === "boolean" ? data.notificationsEnabled : true,
  }

  // Only write when something actually differs, so signing in is a pure read.
  if (!snapshot.exists() || Object.entries(profile).some(([key, value]) => data[key] !== value)) {
    await setDoc(
      userRef,
      {
        ...profile,
        ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  return {
    uid: user.uid,
    email: profile.email,
    displayName: fullName(profile) || displayName || profile.email,
    role,
  }
}

export function getHomeForRole(role: UserRole) {
  return role === "customer" ? "/find-services" : "/dashboard"
}

export function getProfileForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/profile"
}
