export type UserRole = "provider" | "customer"

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
}
