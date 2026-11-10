import type { Timestamp } from "firebase/firestore"
import type { Contact, DocumentMeta, Place, Pricing } from "./common"

/**
 * Agreed work. Both flows converge here.
 *
 * Flow A: booking accepted  → job (source = booking)
 * Flow B: offer accepted    → job (source = order)
 *
 * A job is a snapshot: it keeps its own copy of title, price and place so that
 * editing the originating service or order never changes what was agreed.
 */
export interface Job extends DocumentMeta {
  /** Firestore document ID — the only identity this job has. */
  id: string

  /** Where this job came from, and the document it came from. */
  sourceType: JobSourceType
  sourceId: string

  customerId: string
  customerName: string
  providerId: string
  providerName: string

  /** Snapshotted when the job was agreed, so each side can reach the other. */
  customerContact?: Contact
  providerContact?: Contact

  title: string
  description: string
  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string

  pricing: Pricing
  priceInCent: number

  place: Place
  scheduledAt: Timestamp
  /** A booking names its date in the customer's own words; shown instead of `scheduledAt`. */
  dateText?: string

  status: JobStatus

  startedAt?: Timestamp
  completedAt?: Timestamp
  cancelledAt?: Timestamp
}

export enum JobSourceType {
  /** Flow B — grew out of an accepted offer on an order. */
  order = "order",
  /** Flow A — grew out of an accepted booking on a service. */
  booking = "booking",
}

/**
 * Four states, not six. The old model had `open`, `pending` and `accepted` all
 * meaning "agreed but not started", which is why every transition table had to
 * collapse them back together.
 */
export enum JobStatus {
  scheduled = "scheduled",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}
