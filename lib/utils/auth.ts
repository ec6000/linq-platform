import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { User } from "firebase/auth"
import { db } from "@/lib/firebase/firebase"
import { AppUser, UserRole } from "@/lib/types/user"

function splitName(displayName: string) {
  const clean = displayName.trim()
  if (!clean) {
    return { firstName: "", lastName: "" }
  }

  const [firstName, ...rest] = clean.split(" ")
  return { firstName, lastName: rest.join(" ") }
}

export async function ensureUserProfile(user: User, role: UserRole = "provider") {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)
  const { firstName, lastName } = splitName(user.displayName ?? "")

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email: user.email ?? "",
      firstName,
      lastName,
      phone: "",
      company: "",
      notificationsEnabled: true,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return
  }

  const data = snapshot.data()
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }

  if (!data.role || !["provider", "customer"].includes(data.role)) {
    updates.role = role
  }

  if (data.notificationsEnabled === undefined) {
    updates.notificationsEnabled = true
  }

  if (data.firstName === undefined && firstName) {
    updates.firstName = firstName
  }

  if (data.lastName === undefined && lastName) {
    updates.lastName = lastName
  }

  if (Object.keys(updates).length > 1) {
    await setDoc(userRef, updates, { merge: true })
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
  const firstName = typeof data.firstName === "string" ? data.firstName : ""
  const lastName = typeof data.lastName === "string" ? data.lastName : ""
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: fullName || user.displayName || "",
    role,
  }
}

export function getHomeForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/dashboard"
}

export function getProfileForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/profile"
}
