import { Timestamp, GeoPoint } from "firebase/firestore"

export interface Service {
  id: number
  firestoreId: string

  providerId: number
  providerName: string

  title: string
  description: string
  imageUrl?: string

  status: ServiceStatus

  pricingType: PricingType
  minBudgetInCent: number
  maxBudgetInCent: number
  unitName?: string

  location: GeoPoint
  radius: number
  city?: string

  categoryId: string
  categoryName?: string
  subcategoryId?: string
  subcategoryName?: string
  bookingIds?: number[]

  createdAt: Timestamp
  updatedAt: Timestamp
}

export enum ServiceStatus {
  active = "active",
  inactive = "inactive",
  deleted = "deleted",
}

export enum PricingType {
  fixed = "Gesamt",
  perHour = "/ Stunde",
  perUnit = "pro Einheit"
}