import type { GeoPoint, Timestamp } from "firebase/firestore"

/**
 * Shared value shapes.
 *
 * Every document in the database is built from these, so a place is always a
 * place and a price is always an integer in cents — no `address` here and
 * `addressText` there, no radius in kilometres next to a radius in metres.
 */

/** Where something happens. Always this shape, on every collection. */
export interface Place {
  /** Coordinates, for radius search. */
  geo: GeoPoint
  /** What the user typed or picked, e.g. "Venloer Str. 12, Köln Ehrenfeld". */
  address: string
  /** Coarse label for lists and cards, e.g. "Köln Ehrenfeld". */
  city: string
}

/** How a price is meant to be read. Stable codes — never display text. */
export enum PricingType {
  fixed = "fixed",
  hourly = "hourly",
  unit = "unit",
}

export interface Pricing {
  type: PricingType
  /** Only for PricingType.unit, e.g. "Fenster", "qm". */
  unitLabel?: string
}

/** Denormalised name of a referenced user, so lists render without extra reads. */
export interface PartyRef {
  id: string
  name: string
}

/** Fields every document carries. */
export interface DocumentMeta {
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const MAX_MONEY_IN_CENT = 100_000_000 // 1 000 000 € — a hard upper bound
