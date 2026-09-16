import type { Timestamp } from "firebase/firestore"
import type { DocumentMeta, Place } from "./common"

/** What a customer publishes. Flow B starts here: providers bid on it. */
export interface Order extends DocumentMeta {
  /** Firestore document ID — the only identity this order has. */
  id: string

  customerId: string
  customerName: string

  title: string
  description: string

  status: OrderStatus
  priority: OrderPriority

  /** When the work should happen. */
  timeWindow: TimeWindow

  /** What the customer is willing to pay, in cents. */
  budgetInCent: number

  place: Place
  /** How far the customer will look for a provider, in kilometres. */
  radiusKm: number

  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string

  imageUrls: string[]

  /** Live count of open offers, kept in sync so lists need no subcollection read. */
  offerCount: number

  assignedProviderId?: string
  assignedProviderName?: string
  assignedAt?: Timestamp
  cancelledAt?: Timestamp
  completedAt?: Timestamp
}

export interface TimeWindow {
  start: Timestamp
  end: Timestamp
  isFlexible: boolean
}

export enum OrderStatus {
  /** Published, collecting offers. */
  open = "open",
  /** An offer was accepted; a job exists. */
  assigned = "assigned",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}

export enum OrderPriority {
  low = "low",
  normal = "normal",
  high = "high",
  urgent = "urgent",
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.open]: "Offen",
  [OrderStatus.assigned]: "Vergeben",
  [OrderStatus.inProgress]: "In Arbeit",
  [OrderStatus.completed]: "Abgeschlossen",
  [OrderStatus.cancelled]: "Storniert",
}

export const ORDER_PRIORITY_LABEL: Record<OrderPriority, string> = {
  [OrderPriority.low]: "Niedrig",
  [OrderPriority.normal]: "Normal",
  [OrderPriority.high]: "Hoch",
  [OrderPriority.urgent]: "Dringend",
}
