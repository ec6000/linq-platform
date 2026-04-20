import { Timestamp, GeoPoint } from "firebase/firestore"
import { Category } from "./category"

export interface Service {
  id: string
  title: string
  providerName: string
  status: ServiceStatus
  minBudgetInCent: number
  maxBudgetInCent: number
  location: GeoPoint
  radius: number
  categoryId: string
}

export enum ServiceStatus {
  active = "active",
  inactive = "inactive",
  deleted = "deleted",
}