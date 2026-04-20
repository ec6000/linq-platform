import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { User } from "firebase/auth"
import { db } from "@/lib/firebase/firebase"
import { AppUser, UserRole } from "@/lib/types/user"

export async function ensureUserProfile(user: User, role: UserRole = "provider") {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  const data = snapshot.data()
  if (!data.role || !["provider", "customer"].includes(data.role)) {
    await setDoc(userRef, { role, updatedAt: serverTimestamp() }, { merge: true })
  }
}

export async function getAppUser(user: User): Promise<AppUser> {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await ensureUserProfile(user)
    return {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      role: "provider",
    }
  }

  const data = snapshot.data()
  const role: UserRole = data.role === "customer" ? "customer" : "provider"

  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: data.displayName || user.displayName || "",
    role,
  }
}

export function getHomeForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/dashboard"
}

export function getProfileForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/profile"
}
