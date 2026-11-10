"use client"

import { useState } from "react"
import { CalendarClock, Euro, MapPin } from "lucide-react"
import { BookingStatus, type Booking } from "@/lib/types/booking"
import type { UserRole } from "@/lib/types/user"
import { useRespondToBooking } from "@/lib/hooks/useBookings"
import { cancelBooking } from "@/lib/data/bookings"
import { formatPrice } from "@/lib/utils/format"
import { centsToInput, parseEuroInCent } from "@/lib/utils/validation"
import ConfirmationModal from "@/components/ConfirmationModal"
import StatusPill from "@/components/StatusPill"

type Action = "accept" | "decline" | "cancel"

/**
 * A request for a service. The provider answers it — accepting means naming
 * the price, because a job without an agreed price cannot exist. The customer
 * can withdraw it until then.
 */
export default function BookingCard({ booking, role }: { booking: Booking; role: UserRole }) {
  const { respond, loading, error } = useRespondToBooking()
  const [action, setAction] = useState<Action | null>(null)
  const [price, setPrice] = useState(centsToInput(booking.priceInCent))
  const [note, setNote] = useState("")
  const [cancelError, setCancelError] = useState<string | null>(null)

  const open = booking.status === BookingStatus.requested
  let priceInCent: number | null = null
  try {
    priceInCent = parseEuroInCent(price)
  } catch {
    // Keeps "Annehmen" disabled until the price parses.
  }

  async function confirm() {
    if (action === "cancel") {
      setCancelError(null)
      try {
        await cancelBooking(booking.id)
        setAction(null)
      } catch (err) {
        setCancelError(err instanceof Error ? err.message : "Anfrage konnte nicht zurückgezogen werden.")
      }
      return
    }
    const ok =
      action === "accept"
        ? await respond(booking.id, BookingStatus.accepted, { priceInCent: priceInCent ?? undefined })
        : await respond(booking.id, BookingStatus.declined, { message: note })
    if (ok) setAction(null)
  }

  const dialog = {
    accept: {
      title: "Anfrage annehmen?",
      text: "Nenne den vereinbarten Preis. Daraus wird ein Job, und ihr seht gegenseitig eure Kontaktdaten.",
      label: "Annehmen",
    },
    decline: { title: "Anfrage ablehnen?", text: "Ein kurzer Grund hilft dem Kunden weiter.", label: "Ablehnen" },
    cancel: { title: "Anfrage zurückziehen?", text: "Der Anbieter sieht danach, dass du sie zurückgezogen hast.", label: "Zurückziehen" },
  }

  return (
    <>
      <article className="card p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-text/50">
            {role === "provider" ? `Anfrage von ${booking.customerName}` : `An ${booking.providerName}`}
          </p>
          <StatusPill status={booking.status} />
        </div>

        <h2 className="text-[17px] font-semibold leading-snug text-text">{booking.serviceTitle}</h2>

        {booking.message && (
          <blockquote className="mt-3 line-clamp-3 border-l-2 border-secondary pl-3.5 text-[13.5px] leading-relaxed text-text/60">
            {booking.message}
          </blockquote>
        )}

        <div className="mt-4 flex flex-col gap-2 text-[13px] text-text/60">
          <p className="flex items-center gap-2">
            <Euro size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            <span className="num">
              {booking.priceInCent === undefined ? "Preis auf Anfrage" : formatPrice(booking.priceInCent, booking.pricing)}
            </span>
          </p>
          {booking.requestedDateText && (
            <p className="flex items-center gap-2">
              <CalendarClock size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
              {booking.requestedDateText}
            </p>
          )}
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
            {booking.place.address}
          </p>
        </div>

        {booking.declineMessage && (
          <p className="card-sunken mt-4 px-3.5 py-2.5 text-[13px] text-text/65">{booking.declineMessage}</p>
        )}

        {(error || cancelError) && (
          <p role="alert" className="notice notice-error mt-4">
            {error ?? cancelError}
          </p>
        )}

        {open && (
          <div className="mt-5 flex items-center justify-end gap-2">
            {role === "provider" ? (
              <>
                <button type="button" onClick={() => setAction("decline")} className="btn btn-ghost btn-sm">
                  Ablehnen
                </button>
                <button type="button" onClick={() => setAction("accept")} className="btn btn-primary btn-sm">
                  Annehmen
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setAction("cancel")} className="btn btn-danger btn-sm">
                Zurückziehen
              </button>
            )}
          </div>
        )}
      </article>

      <ConfirmationModal
        open={action !== null}
        title={action ? dialog[action].title : ""}
        description={action ? dialog[action].text : ""}
        confirmLabel={action ? dialog[action].label : ""}
        destructive={action !== "accept"}
        loading={loading}
        confirmDisabled={action === "accept" && !priceInCent}
        onCancel={() => setAction(null)}
        onConfirm={confirm}
      >
        {action === "accept" && (
          <div className="field-group field-h">
            <Euro size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <input
              aria-label="Vereinbarter Preis in Euro"
              inputMode="decimal"
              autoFocus
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              className="num"
            />
          </div>
        )}
        {action === "decline" && (
          <textarea
            aria-label="Grund"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="z. B. Der Termin passt leider nicht."
            className="field resize-none"
          />
        )}
      </ConfirmationModal>
    </>
  )
}
