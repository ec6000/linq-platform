import type { Timestamp } from "firebase/firestore"
import type { DocumentMeta } from "./common"

/**
 * A provider's bid on an order.
 *
 * Lives at `orders/{orderId}/offers/{providerId}`. Using the provider's UID as
 * the document ID makes "one offer per provider per order" a property of the
 * data model instead of a rule the code has to remember to check.
 */
export interface Offer extends DocumentMeta {
  /** Document ID — equal to providerId. */
  id: string

  orderId: string
  orderTitle: string

  providerId: string
  providerName: string

  priceInCent: number
  message: string

  status: OfferStatus
  /** What the customer wrote when accepting or declining. */
  customerComment?: string
  decidedAt?: Timestamp
}

export enum OfferStatus {
  pending = "pending",
  accepted = "accepted",
  declined = "declined",
}

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  [OfferStatus.pending]: "Offen",
  [OfferStatus.accepted]: "Angenommen",
  [OfferStatus.declined]: "Abgelehnt",
}
