"use client"

import ServiceImage from "@/components/ServiceImage"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CalendarClock, CheckCircle2, Euro, MapPin, MessageSquare } from "lucide-react"
import { useService } from "@/lib/hooks/useServices"
import { useCreateBooking } from "@/lib/hooks/useBookings"
import { formatEuro, formatPriceRange } from "@/lib/utils/format"
import { parseEuroInCent } from "@/lib/utils/validation"

export default function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  const { service, loading, error } = useService(serviceId)
  const { submit, loading: saving, error: submitError } = useCreateBooking()

  const [message, setMessage] = useState("")
  const [requestedDateText, setRequestedDateText] = useState("")
  const [addressText, setAddressText] = useState("")
  const [priceInput, setPriceInput] = useState("")
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!service) return
    setValidationError(null)

    let priceInCent: number | undefined
    try {
      priceInCent = priceInput.trim() ? parseEuroInCent(priceInput) : undefined
    } catch {
      return setValidationError("Bitte einen gültigen Preisvorschlag eingeben oder das Feld leer lassen.")
    }
    if (priceInCent === 0) priceInCent = undefined

    const bookingId = await submit({
      serviceId: service.id,
      message,
      requestedDateText,
      priceInCent,
      place: addressText.trim() ? { address: addressText.trim() } : undefined,
    })

    if (bookingId) {
      setCreatedBookingId(bookingId)
      setMessage("")
      setRequestedDateText("")
      setAddressText("")
      setPriceInput("")
    }
  }

  if (loading) {
    return (
      <main id="main" className="shell-wide py-10">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="skeleton h-[560px] rounded-xl" />
          <div className="skeleton h-[480px] rounded-xl" />
        </div>
      </main>
    )
  }

  if (error || !service) {
    return (
      <main id="main" className="shell-wide py-10">
        <Link href="/find-services" className="link-quiet mb-8 inline-flex items-center gap-1.5 text-[13.5px]">
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
          Zur Suche
        </Link>
        <div className="empty">
          <h1 className="text-[17px] font-semibold text-text">Service nicht gefunden</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            Der Service ist nicht mehr verfügbar oder wurde entfernt.
          </p>
          <Link href="/find-services" className="btn btn-outline mt-7">
            Zurück zur Suche
          </Link>
        </div>
      </main>
    )
  }

  const facts = [
    {
      label: "Preisrahmen",
      value: formatPriceRange(service.minPriceInCent, service.maxPriceInCent, service.pricing),
    },
    { label: "Ort", value: service.place.city },
    { label: "Einsatzradius", value: `${service.radiusKm} km` },
  ]

  return (
    <main id="main" className="shell-wide py-8 md:py-10">
      <Link href="/find-services" className="link-quiet mb-6 inline-flex items-center gap-1.5 text-[13.5px]">
        <ArrowLeft size={14} strokeWidth={2} aria-hidden />
        Zur Suche
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <section className="card overflow-hidden">
          <ServiceImage
            src={service.imageUrl}
            sizes="(min-width: 1024px) 62vw, 100vw"
            iconSize={32}
            priority
            className="h-[300px] md:h-[420px]"
          />

          <div className="p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill pill-primary">{service.categoryName}</span>
              {service.subcategoryName && (
                <span className="pill pill-muted">{service.subcategoryName}</span>
              )}
            </div>

            <h1 className="display mt-6 text-[32px] text-primary md:text-[44px]">{service.title}</h1>
            <p className="mt-5 max-w-3xl whitespace-pre-line text-[15.5px] leading-[1.7] text-text/65">
              {service.description}
            </p>

            <dl className="mt-9 grid gap-px overflow-hidden rounded-lg border border-secondary bg-secondary sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-background p-5">
                  <dt className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
                    {fact.label}
                  </dt>
                  <dd className="num mt-1.5 text-[17px] font-semibold text-text">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-[14px] text-text/55">
              Angeboten von <span className="font-medium text-text">{service.providerName}</span>
            </p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:self-start">
          <form onSubmit={handleSubmit} className="card bg-background p-6 shadow-sm md:p-7">
            <h2 className="text-[19px] font-semibold text-text">Service anfragen</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text/55">
              Kostenlos und unverbindlich. Nimmt der Anbieter an, nennt er den Preis und ihr bekommt gegenseitig eure Kontaktdaten.
            </p>

            {createdBookingId && (
              <p className="notice notice-success mt-5 flex items-start gap-2">
                <CheckCircle2 size={16} strokeWidth={2} className="mt-0.5 flex-none" aria-hidden />
                <span>
                  Anfrage gesendet. Die Antwort siehst du in deiner{" "}
                  <Link href="/customer-dashboard" className="font-semibold underline">
                    Übersicht
                  </Link>
                  .
                </span>
              </p>
            )}

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="field-label" htmlFor="booking-date">
                  Wunschtermin
                </label>
                <div className="field-group field-h">
                  <CalendarClock size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
                  <input
                    id="booking-date"
                    value={requestedDateText}
                    onChange={(event) => setRequestedDateText(event.target.value)}
                    placeholder="z. B. Freitagvormittag oder flexibel"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="booking-address">
                  Einsatzort
                </label>
                <div className="field-group field-h">
                  <MapPin size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
                  <input
                    id="booking-address"
                    value={addressText}
                    onChange={(event) => setAddressText(event.target.value)}
                    placeholder="Straße und Hausnummer"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="booking-price">
                  Dein Preisvorschlag <span className="font-normal text-text/40">(optional)</span>
                </label>
                <div className="field-group field-h">
                  <Euro size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
                  <input
                    id="booking-price"
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    inputMode="decimal"
                    placeholder={formatEuro(service.minPriceInCent, { decimals: false })}
                    className="num"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="booking-message">
                  Nachricht
                </label>
                <div className="field-group items-start">
                  <MessageSquare size={15} strokeWidth={1.8} className="mt-1 flex-none text-text/30" aria-hidden />
                  <textarea
                    id="booking-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    required
                    rows={5}
                    placeholder="Beschreibe kurz, was du brauchst…"
                    className="resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {(validationError || submitError) && (
              <p role="alert" className="notice notice-error mt-5">
                {validationError ?? submitError}
              </p>
            )}

            <button type="submit" disabled={saving} className="btn btn-primary btn-lg btn-block mt-6">
              {saving ? "Wird gesendet…" : "Anfrage senden"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  )
}
