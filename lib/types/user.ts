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
  notificationsEnabled: boolean
}

export function fullName(user: Pick<UserDoc, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`.trim()
}
