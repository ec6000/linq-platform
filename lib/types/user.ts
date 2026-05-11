export type UserRole = "provider" | "customer"

export interface AppUser {
  uid: string
  numericId?: number
  email: string
  displayName: string
  role: UserRole
}
