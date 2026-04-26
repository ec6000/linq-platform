import { Timestamp, GeoPoint } from "firebase/firestore"
import { Category } from "./category"

export interface Service {
  id: string

  providerId: string
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