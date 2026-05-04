"use client"

import { useMemo, useState } from "react"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Booking, BookingStatus } from "@/lib/types/booking"
import { db } from "@/lib/firebase/firebase"
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
  const [status, setStatus] = useState(booking.status)
  const [declineMessage, setDeclineMessage] = useState(booking.declineMessage ?? "")
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const canRespond = status === BookingStatus.requested

  const declineTextPreview = useMemo(() => {
    const trimmed = declineMessage.trim()
    return trimmed.length > 0 ? trimmed : null
  }, [declineMessage])

  async function handleAccept() {
    setSaving(true)
    setActionError(null)

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: BookingStatus.accepted,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setStatus(BookingStatus.accepted)
    } catch (err) {
      console.error(err)
      setActionError("Booking konnte nicht angenommen werden.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDecline() {
    setSaving(true)
    setActionError(null)

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: BookingStatus.declined,
        declineMessage: declineMessage.trim() || null,
        declinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setStatus(BookingStatus.declined)
      setConfirmDeclineOpen(false)
    } catch (err) {
      console.error(err)
      setActionError("Booking konnte nicht abgelehnt werden.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <article className="rounded-2xl border border-secondary bg-background p-6 transition hover:border-primary/30 hover:shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-[12px] uppercase tracking-wide text-text/45">
            Buchungsanfrage
          </div>

          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}>
            {statusLabel[status]}
          </span>
        </div>

        <h2 className="text-[17px] font-semibold leading-snug text-text">{booking.serviceTitle}</h2>

        {booking.message && (
          <blockquote className="mt-3 border-l-2 border-secondary pl-3 text-[13px] leading-relaxed text-text/65 line-clamp-3">
            {booking.message}
          </blockquote>
        )}

        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-wide text-text/45">Preisvorschlag</div>
          <div className="mt-0.5 text-[20px] font-semibold tracking-tight text-text">
            {formatPrice(booking.priceInCent, booking.pricingType, booking.unitName)}
          </div>
        </div>

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

        {declineTextPreview && status === BookingStatus.declined && (
          <p className="mt-4 rounded-xl bg-secondary px-3 py-2 text-[13px] text-text/70">Kommentar zur Ablehnung: {declineTextPreview}</p>
        )}

        {canRespond && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={saving}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annehmen
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeclineOpen(true)}
              disabled={saving}
              className="rounded-lg border border-secondary px-3 py-2 text-sm font-medium text-text/75 transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ablehnen
            </button>
          </div>
        )}

        {actionError && <p className="mt-3 text-sm text-red-500">{actionError}</p>}
      </article>

      {confirmDeclineOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-text/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-secondary bg-background p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-text">Booking ablehnen?</h3>
            <p className="mt-1 text-sm text-text/65">Du kannst optional einen Kommentar für die Ablehnung hinterlegen.</p>

            <label className="mt-4 block text-sm font-medium text-text/80" htmlFor={`decline-${booking.id}`}>
              Kommentar
            </label>
            <textarea
              id={`decline-${booking.id}`}
              value={declineMessage}
              onChange={(event) => setDeclineMessage(event.target.value)}
              rows={4}
              placeholder="z. B. Termin passt leider nicht in meinen Kalender"
              className="mt-2 w-full rounded-xl border border-secondary bg-background px-3 py-2 text-sm text-text outline-none transition focus:border-primary/40"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeclineOpen(false)}
                disabled={saving}
                className="rounded-lg border border-secondary px-3 py-2 text-sm text-text/70 transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={saving}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Wird gespeichert…" : "Ablehnung bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
