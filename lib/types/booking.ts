import { Timestamp, GeoPoint } from "firebase/firestore"
import { PricingType } from "./service"

export interface Booking {
  id: string

  // 🔗 Referenzen
  serviceId: string
  providerId: string
  customerId: string

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

  // 📍 Ort (kann vom Service abweichen)
  location?: GeoPoint
  addressText?: string

  // 🔄 Status
  status: BookingStatus

  // 🔗 Wenn daraus ein Job wird
  jobId?: string

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