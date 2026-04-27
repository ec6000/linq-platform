"use client"

import { Booking, BookingStatus } from "@/lib/types/booking"
import { PricingType } from "@/lib/types/service"
import { useCategories } from "@/lib/hooks/useCategory"

interface BookingCardProps {
  booking: Booking
}

const statusLabel: Record<BookingStatus, string> = {
  [BookingStatus.requested]: "Angefragt",
  [BookingStatus.accepted]: "Angenommen",
  [BookingStatus.declined]: "Abgelehnt",
  [BookingStatus.cancelled]: "Storniert",
}

const pricingLabel: Record<PricingType, string> = {
  [PricingType.fixed]: "Festpreis",
  [PricingType.perHour]: "Stundensatz",
  [PricingType.perUnit]: "Pro Einheit",
}

function formatMoney(valueInCent?: number) {
  if (valueInCent === undefined) return "–"
  return `${(valueInCent / 100).toLocaleString("de-DE")} €`
}

function formatTimestamp(value?: { toDate: () => Date }) {
  if (!value) return "–"
  return value.toDate().toLocaleString("de-DE")
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { categories } = useCategories()

  const categoryName = categories.find((category) => category.id === booking.categoryId)?.nameDE

  return (
    <article className="rounded-2xl border border-secondary bg-background px-6 py-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-text">{booking.serviceTitle}</h2>
          <p className="mt-1 text-[13px] text-text/55">{booking.message || "Keine Nachricht hinterlegt."}</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[12px] font-medium text-text/70">
          {statusLabel[booking.status]}
        </span>
      </div>

      <dl className="grid gap-x-6 gap-y-2 text-[13px] text-text/75 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-text/45">Kategorie</dt>
          <dd>{categoryName || "–"}</dd>
        </div>
        <div>
          <dt className="text-text/45">Preismodell</dt>
          <dd>{pricingLabel[booking.pricingType]}</dd>
        </div>
        <div>
          <dt className="text-text/45">Preis</dt>
          <dd>{formatMoney(booking.priceInCent)}</dd>
        </div>
        <div>
          <dt className="text-text/45">Budget</dt>
          <dd>
            {formatMoney(booking.minBudgetInCent)} – {formatMoney(booking.maxBudgetInCent)}
          </dd>
        </div>
        <div>
          <dt className="text-text/45">Gewünschter Termin</dt>
          <dd>{booking.requestedDateText || "–"}</dd>
        </div>
        <div>
          <dt className="text-text/45">Angefragt am</dt>
          <dd>{formatTimestamp(booking.requestedAt)}</dd>
        </div>
        <div>
          <dt className="text-text/45">Adresse</dt>
          <dd>{booking.addressText || "–"}</dd>
        </div>
        <div>
          <dt className="text-text/45">Geopunkt</dt>
          <dd>
            {booking.location
              ? `${booking.location.latitude.toFixed(4)}, ${booking.location.longitude.toFixed(4)}`
              : "–"}
          </dd>
        </div>
      </dl>
    </article>
  )
}
