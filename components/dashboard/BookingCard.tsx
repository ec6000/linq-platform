"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { BOOKING_STATUS_LABEL, BookingStatus, type Booking } from "@/lib/types/booking"
import { useRespondToBooking } from "@/lib/hooks/useBookings"
import { formatPrice } from "@/lib/utils/format"
import ConfirmationModal from "@/components/ConfirmationModal"

const statusStyles: Record<BookingStatus, string> = {
  [BookingStatus.requested]: "pill-accent",
  [BookingStatus.accepted]: "pill-success",
  [BookingStatus.declined]: "pill-muted",
  [BookingStatus.cancelled]: "pill-muted",
}

export default function BookingCard({ booking }: { booking: Booking }) {
  const [status, setStatus] = useState(booking.status)
  const [declineMessage, setDeclineMessage] = useState(booking.declineMessage ?? "")
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false)
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false)
  const { respond, loading, error } = useRespondToBooking()

  const canRespond = status === BookingStatus.requested

  async function handleAccept() {
    if (await respond(booking.id, BookingStatus.accepted)) {
      setStatus(BookingStatus.accepted)
      setConfirmAcceptOpen(false)
    }
  }

  async function handleDecline() {
    if (await respond(booking.id, BookingStatus.declined, declineMessage)) {
      setStatus(BookingStatus.declined)
      setConfirmDeclineOpen(false)
    }
  }

  return (
    <>
      <article className="card card-interactive p-6">
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
            Anfrage von {booking.customerName}
          </span>
          <span className={`pill ${statusStyles[status]}`}>{BOOKING_STATUS_LABEL[status]}</span>
        </div>

        <h2 className="text-[17px] font-semibold leading-snug text-text">{booking.serviceTitle}</h2>

        {booking.message && (
          <blockquote className="mt-3.5 line-clamp-3 border-l-2 border-secondary pl-3.5 text-[13.5px] leading-relaxed text-text/60">
            {booking.message}
          </blockquote>
        )}

        <div className="mt-5">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
            Preisvorschlag
          </p>
          <p className="num mt-1 text-[22px] font-semibold text-text">
            {booking.priceInCent === undefined
              ? "Preis auf Anfrage"
              : formatPrice(booking.priceInCent, booking.pricing)}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-[13px] text-text/60">
          {booking.requestedDateText && (
            <p className="flex items-center gap-2">
              <span className="text-text/35">Wunschtermin</span>
              {booking.requestedDateText}
            </p>
          )}
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            {booking.place.address}
          </p>
        </div>

        {booking.declineMessage && status === BookingStatus.declined && (
          <p className="card-sunken mt-4 px-3.5 py-2.5 text-[13px] text-text/65">
            Kommentar zur Ablehnung: {booking.declineMessage}
          </p>
        )}

        {error && (
          <p role="alert" className="notice notice-error mt-4">
            {error}
          </p>
        )}

        {canRespond && (
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-secondary pt-5">
            <button
              type="button"
              onClick={() => setConfirmDeclineOpen(true)}
              disabled={loading}
              className="btn btn-ghost btn-sm"
            >
              Ablehnen
            </button>
            <button
              type="button"
              onClick={() => setConfirmAcceptOpen(true)}
              disabled={loading}
              className="btn btn-primary btn-sm"
            >
              Annehmen
            </button>
          </div>
        )}
      </article>

      <ConfirmationModal
        open={confirmAcceptOpen}
        title="Anfrage annehmen?"
        description="Aus der Anfrage wird ein Job, den du anschließend in deinem Dashboard verwaltest."
        confirmLabel="Ja, annehmen"
        loading={loading}
        onCancel={() => setConfirmAcceptOpen(false)}
        onConfirm={handleAccept}
      />

      {confirmDeclineOpen && (
        <div className="overlay items-center justify-center">
          <div className="sheet w-full max-w-lg p-6">
            <h3 className="text-[17px] font-semibold text-text">Anfrage ablehnen?</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-text/60">
              Du kannst optional einen Kommentar für die Ablehnung hinterlegen.
            </p>

            <label className="field-label mt-6" htmlFor={`decline-${booking.id}`}>
              Kommentar
            </label>
            <textarea
              id={`decline-${booking.id}`}
              value={declineMessage}
              onChange={(event) => setDeclineMessage(event.target.value)}
              rows={4}
              placeholder="z. B. Termin passt leider nicht in meinen Kalender"
              className="field resize-none"
            />

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeclineOpen(false)}
                disabled={loading}
                className="btn btn-ghost"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={loading}
                className="btn btn-danger-solid"
              >
                {loading ? "Wird gespeichert…" : "Ablehnung bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
