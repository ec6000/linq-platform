import type { Timestamp } from "firebase/firestore"
import type { DocumentMeta, Place, Pricing } from "./common"

/** What a provider offers. Flow A starts here: a customer books it. */
export interface Service extends DocumentMeta {
  /** Firestore document ID — the only identity this service has. */
  id: string

  providerId: string
  providerName: string

  title: string
  description: string
  imageUrl?: string

  status: ServiceStatus

  pricing: Pricing
  minPriceInCent: number
  maxPriceInCent: number

  place: Place
  /** How far the provider travels, in kilometres. */
  radiusKm: number

  categoryId: string
  categoryName: string
  subcategoryId?: string
  subcategoryName?: string

  archivedAt?: Timestamp
}

export enum ServiceStatus {
  /** Visible in search, bookable. */
  active = "active",
  /** Hidden from search, kept by the provider. */
  paused = "paused",
  /** Soft-deleted. Never shown, never bookable. */
  archived = "archived",
}

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  [ServiceStatus.active]: "Aktiv",
  [ServiceStatus.paused]: "Pausiert",
  [ServiceStatus.archived]: "Archiviert",
}
