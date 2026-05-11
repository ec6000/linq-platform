import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore"
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

async function getOrCreateUserNumericId(uid: string) {
  const userRef = doc(db, "users", uid)
  const counterRef = doc(db, "users", "counter")

  return runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef)
    const existingId = userSnapshot.exists() ? userSnapshot.data().id : undefined

    if (typeof existingId === "number") {
      return existingId
    }

    const counterSnapshot = await transaction.get(counterRef)
    const currentCount = counterSnapshot.exists() ? Number(counterSnapshot.data().count ?? 0) : 0
    const nextId = currentCount + 1

    transaction.set(counterRef, { count: nextId }, { merge: true })
    transaction.set(userRef, { id: nextId, updatedAt: serverTimestamp() }, { merge: true })

    return nextId
  })
}

export async function ensureUserProfile(user: User, role: UserRole = "provider") {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)
  const { firstName, lastName } = splitName(user.displayName ?? "")

  if (!snapshot.exists()) {
    const numericId = await getOrCreateUserNumericId(user.uid)

    await setDoc(userRef, {
      id: numericId,
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

  if (typeof data.id !== "number") {
    updates.id = await getOrCreateUserNumericId(user.uid)
  }

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

export async function getAppUser(user: User, fallbackRole: UserRole = "provider"): Promise<AppUser> {
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    await ensureUserProfile(user, fallbackRole)
    return {
      uid: user.uid,
      numericId: await getOrCreateUserNumericId(user.uid),
      email: user.email ?? "",
      displayName: user.displayName ?? "",
      role: fallbackRole,
    }
  }

  const data = snapshot.data()
  const numericId = typeof data.id === "number" ? data.id : await getOrCreateUserNumericId(user.uid)
  const role: UserRole = data.role === "customer" ? "customer" : "provider"
  const firstName = typeof data.firstName === "string" ? data.firstName : ""
  const lastName = typeof data.lastName === "string" ? data.lastName : ""
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    uid: user.uid,
    numericId,
    email: user.email ?? "",
    displayName: fullName || user.displayName || "",
    role,
  }
}

export function getHomeForRole(role: UserRole) {
  return role === "customer" ? "/customer-dashboard" : "/dashboard"
}

export function getProfileForRole(role: UserRole) {
  return role === "customer" ? "/customer-profile" : "/profile"
}
