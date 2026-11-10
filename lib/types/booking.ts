import type { Timestamp } from "firebase/firestore"
import type { Contact, DocumentMeta, Place, Pricing } from "./common"

/**
 * A customer's request against a published service.
 *
 * Flow A: service → booking → job. The snapshot fields freeze what the service
 * looked like when it was requested, so a later edit cannot rewrite history.
 */
export interface Booking extends DocumentMeta {
  /** Firestore document ID — the only identity this booking has. */
  id: string

  serviceId: string
  serviceTitle: string

  customerId: string
  customerName: string
  customerContact?: Contact
  providerId: string
  providerName: string

  categoryId: string
  categoryName: string

  pricing: Pricing
  /**
   * What the customer proposes to pay; absent means "ask the provider".
   * On acceptance the provider confirms the final price, which replaces it.
   */
  priceInCent?: number

  /** The customer's message and preferred date, as free text. */
  message: string
  requestedDateText: string

  place: Place

  status: BookingStatus
  /** Why the provider said no. */
  declineMessage?: string

  /** Set once the booking turned into a job. */
  jobId?: string

  acceptedAt?: Timestamp
  declinedAt?: Timestamp
  cancelledAt?: Timestamp
}

export enum BookingStatus {
  requested = "requested",
  accepted = "accepted",
  declined = "declined",
  cancelled = "cancelled",
}
