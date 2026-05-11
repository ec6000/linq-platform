import { Timestamp, GeoPoint } from "firebase/firestore"
import { PricingType } from "./service"

export interface Job {
  id: number
  firestoreId: string

  // Herkunft
  sourceType: JobSourceType
  sourceId: number // orderId oder serviceId
  offerId?: number
  bookingId?: number

  // Beteiligte
  customerId: number
  providerId: number

  // Snapshot
  title: string
  description?: string
  categoryId: string
  subcategoryId?: string
  pricingType: PricingType
  priceInCent: number
  unitName?: string

  // Ort & Zeit
  location?: GeoPoint
  addressText?: string
  scheduledAt?: Timestamp

  // Status
  status: JobStatus

  // Abschluss / Bewertung
  customerRating?: number
  providerRating?: number

  // Meta
  createdAt: Timestamp
  updatedAt: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  cancelledAt?: Timestamp
}

export enum JobSourceType {
  order = "order",
  service = "service",
}

export enum JobStatus {
  open = "open",
  pending = "pending",
  inProgress = "inProgress",
  completed = "completed",
  accepted = "accepted",
  cancelled = "cancelled",
}
