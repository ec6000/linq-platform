import type { Timestamp } from "firebase/firestore"
import type { DocumentMeta, Place } from "./common"

/**
 * What a customer publishes. Flow B starts here: providers bid on it.
 *
 * The order itself is readable by every provider, so its `place` is only the
 * neighbourhood: coordinates rounded to about a kilometre and the district as
 * address. The exact address lives in `orders/{id}/private/address`, which only
 * the customer can read, and is copied into the job once an offer is accepted.
 */
export interface Order extends DocumentMeta {
  /** Firestore document ID — the only identity this order has. */
  id: string

  customerId: string
  customerName: string

  title: string
  description: string

  status: OrderStatus

  /** When the work should happen. */
  timeWindow: TimeWindow

  /** What the customer is willing to pay, in cents. */
  budgetInCent: number

  /** Neighbourhood only. See the note above. */
  place: Place

  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string

  imageUrls?: string[]

  /** Live count of open offers, kept in sync so lists need no subcollection read. */
  offerCount: number

  assignedProviderId?: string
  assignedProviderName?: string
  /** The job the accepted offer became. */
  jobId?: string
  assignedAt?: Timestamp
  startedAt?: Timestamp
  cancelledAt?: Timestamp
  completedAt?: Timestamp
}

/** `orders/{id}/private/address` — only the customer reads this. */
export interface PrivateAddress {
  address: string
  geo: Place["geo"]
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
