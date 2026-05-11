import { Timestamp, GeoPoint } from "firebase/firestore"
import { PricingType } from "./service"

export interface Booking {
  id: number
  firestoreId: string

  // 🔗 Referenzen
  serviceId: number
  providerId: number
  customerId: number

  // 📄 Mini-Snapshot vom Service (zum Zeitpunkt der Anfrage)
  serviceTitle: string
  categoryId: string
  pricingType: PricingType
  priceInCent?: number
  unitName?: string

  // 📝 Anfrage vom Kunden
  message?: string
  requestedDateText?: string
  requestedAt?: Timestamp

  // Antwort Dienstleister
  declineMessage?: string

  // 📍 Ort (kann vom Service abweichen)
  location?: GeoPoint
  addressText?: string

  // 🔄 Status
  status: BookingStatus

  // 🔗 Wenn daraus ein Job wird
  jobId?: number

  // 🧾 Meta
  createdAt: Timestamp
  updatedAt: Timestamp
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