"use client"

import { Booking, BookingStatus } from "@/lib/types/booking"
import { PricingType } from "@/lib/types/service"

interface BookingCardProps {
  booking: Booking
}

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.requested]: "bg-accent/10 text-accent",
  [BookingStatus.accepted]: "bg-primary/10 text-primary",
  [BookingStatus.declined]: "bg-secondary text-text/40",
  [BookingStatus.cancelled]: "bg-secondary text-text/40",
}

const statusLabel: Record<BookingStatus, string> = {
  [BookingStatus.requested]: "Angefragt",
  [BookingStatus.accepted]: "Angenommen",
  [BookingStatus.declined]: "Abgelehnt",
  [BookingStatus.cancelled]: "Storniert",
}

const pricingSuffix: Record<PricingType, string> = {
  [PricingType.fixed]: "",
  [PricingType.perHour]: " / Std.",
  [PricingType.perUnit]: " / Einheit",
}

function formatPrice(valueInCent: number | undefined, pricingType: PricingType, unitName?: string) {
  if (valueInCent === undefined) return "Preis auf Anfrage"
  const value = (valueInCent / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const suffix =
    pricingType === PricingType.perUnit && unitName
      ? ` / ${unitName}`
      : pricingSuffix[pricingType]
  return `${value} €${suffix}`
}

function formatScheduledAt(value?: { toDate: () => Date }) {
  if (!value) return null
  const date = value.toDate()
  const datePart = date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  const timePart = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${datePart} · ${timePart} Uhr`
}

export default function BookingCard({ booking }: BookingCardProps) {
  const requestedText = formatScheduledAt(booking.requestedAt)

  return (
    <article className="rounded-2xl border border-secondary bg-background p-6 transition hover:border-primary/30 hover:shadow-sm">
      {/* Header: Label + Status */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[12px] uppercase tracking-wide text-text/45">
          Buchungsanfrage
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[booking.status]}`}>
          {statusLabel[booking.status]}
        </span>
      </div>

      {/* Service-Titel als Anker */}
      <h2 className="text-[17px] font-semibold leading-snug text-text">{booking.serviceTitle}</h2>

      {/* Kunden-Nachricht als Zitat */}
      {booking.message && (
        <blockquote className="mt-3 border-l-2 border-secondary pl-3 text-[13px] leading-relaxed text-text/65 line-clamp-3">
          {booking.message}
        </blockquote>
      )}

      {/* Preisvorschlag prominent */}
      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-wide text-text/45">Preisvorschlag</div>
        <div className="mt-0.5 text-[20px] font-semibold tracking-tight text-text">
          {formatPrice(booking.priceInCent, booking.pricingType, booking.unitName)}
        </div>
      </div>

      {/* Sekundär-Infos: Termin & Adresse */}
      {(requestedText || booking.addressText) && (
        <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-text/65">
          {requestedText && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-text/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>{requestedText}</span>
            </div>
          )}
          {booking.addressText && (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-text/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{booking.addressText}</span>
            </div>
          )}
        </div>
      )}
    </article>
  )
}