import type { Timestamp } from "firebase/firestore"
import { PricingType, type Pricing } from "@/lib/types/common"

/**
 * One place for every number and date the user reads.
 *
 * Pricing types are stored as codes, so their German wording lives here and can
 * change without touching a single database document.
 */

const PRICING_SUFFIX: Record<PricingType, string> = {
  [PricingType.fixed]: "",
  [PricingType.hourly]: " / Std.",
  [PricingType.unit]: " / Einheit",
}

export const PRICING_LABEL: Record<PricingType, string> = {
  [PricingType.fixed]: "Festpreis",
  [PricingType.hourly]: "Stundensatz",
  [PricingType.unit]: "Pro Einheit",
}

/** " / Std.", " / Fenster", or nothing for a fixed price. */
export function pricingSuffix(pricing: Pricing) {
  if (pricing.type === PricingType.unit && pricing.unitLabel) return ` / ${pricing.unitLabel}`
  return PRICING_SUFFIX[pricing.type]
}

export function formatEuro(valueInCent: number, { decimals = true } = {}) {
  return (valueInCent / 100).toLocaleString("de-DE", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })
}

/** "40,00 € / Std." */
export function formatPrice(valueInCent: number, pricing: Pricing, options?: { decimals?: boolean }) {
  return `${formatEuro(valueInCent, options)} €${pricingSuffix(pricing)}`
}

/** "35–45 € / Std." */
export function formatPriceRange(minInCent: number, maxInCent: number, pricing: Pricing) {
  if (minInCent === maxInCent) return formatPrice(minInCent, pricing, { decimals: false })
  const min = formatEuro(minInCent, { decimals: false })
  const max = formatEuro(maxInCent, { decimals: false })
  return `${min}–${max} €${pricingSuffix(pricing)}`
}

type TimestampLike = { toDate: () => Date }

function toDate(value: TimestampLike | Timestamp | null | undefined) {
  return value ? value.toDate() : null
}

/** "Sa, 14. Mär 2026" */
export function formatDate(value: TimestampLike | Timestamp | null | undefined) {
  const date = toDate(value)
  if (!date) return null
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatTime(value: TimestampLike | Timestamp | null | undefined) {
  const date = toDate(value)
  if (!date) return null
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

/** "Sa, 14. Mär 2026 · 09:00 Uhr" */
export function formatDateTime(value: TimestampLike | Timestamp | null | undefined) {
  const date = formatDate(value)
  return date ? `${date} · ${formatTime(value)} Uhr` : null
}

/** "Sa, 14. Mär 2026 · 09:00–13:00 Uhr" */
export function formatTimeRange(
  start: TimestampLike | Timestamp | null | undefined,
  end: TimestampLike | Timestamp | null | undefined,
) {
  const day = formatDate(start)
  if (!day) return null
  const from = formatTime(start)
  const to = formatTime(end)
  return to ? `${day} · ${from}–${to} Uhr` : `${day} · ${from} Uhr`
}

export function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km`
}
