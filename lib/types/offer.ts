import { Timestamp } from "firebase/firestore"

export interface Offer {
  id: string
  priceInCent: number
  comment: string
}

export enum OfferStatus {
  pending = "pending",
  accepted = "accepted",
  declined = "declined",
}