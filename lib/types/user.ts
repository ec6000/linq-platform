export type UserRole = "provider" | "customer"

/**
 * The signed-in user.
 *
 * The Firebase Auth UID is the only identity: it is the document ID under
 * `users/` and the value stored as `customerId` / `providerId` everywhere else.
 */
export interface AppUser {
  uid: string
  email: string
  displayName: string
  phone: string
  role: UserRole
}

/** The `users/{uid}` document. */
export interface UserDoc {
  id: string
  role: UserRole
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
}

export function fullName(user: Pick<UserDoc, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`.trim()
}

/** "Kim Müller" → "Kim M." — enough for a public listing, not enough to look someone up. */
export function shortName(name: string) {
  const [first = "", ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  return last ? `${first} ${last.charAt(0)}.` : first
}
