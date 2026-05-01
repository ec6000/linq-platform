import { Timestamp, GeoPoint } from "firebase/firestore"
import { PricingType } from "./service"

export interface Job {
  id: string

  // Herkunft
  sourceType: JobSourceType
  sourceId: string // orderId oder serviceId
  offerId?: string
  bookingId?: string

  // Beteiligte
  customerId: string
  providerId: string

  // Snapshot
  title: string
  description?: string
  categoryId: string
  pricingType: PricingType
  priceInCent?: number

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
  pending = "pending",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}