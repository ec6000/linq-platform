"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Euro,
  ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { useService } from "@/lib/hooks/useServices"
import { useCreateBooking } from "@/lib/hooks/useBookings"
import { formatEuro, formatPriceRange } from "@/lib/utils/format"

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

    const trimmed = priceInput.trim()
    const priceInCent = trimmed ? Math.round(Number(trimmed.replace(",", ".")) * 100) : undefined
    if (priceInCent !== undefined && (!Number.isFinite(priceInCent) || priceInCent <= 0)) {
      setValidationError("Bitte gib einen gültigen Preisvorschlag ein oder lasse das Feld leer.")
      return
    }

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
          <div className="relative h-[300px] bg-muted md:h-[420px]">
            {service.imageUrl ? (
              <Image
                src={service.imageUrl}
                alt={service.title}
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text/20">
                <ImageIcon size={32} strokeWidth={1.4} aria-hidden />
              </div>
            )}
          </div>

          <div className="p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill pill-primary">{service.categoryName}</span>
              {service.subcategoryName && (
                <span className="pill pill-muted">{service.subcategoryName}</span>
              )}
              <span className="pill pill-accent">
                <ShieldCheck size={12} strokeWidth={2} aria-hidden />
                Geprüfter Anbieter
              </span>
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

            <div className="card-sunken mt-6 p-6">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold text-text">
                <BadgeCheck size={17} strokeWidth={1.9} className="text-accent-ink" aria-hidden />
                Anbieter
              </h2>
              <p className="mt-2 text-[15px] text-text/70">{service.providerName}</p>
              <ul className="mt-5 grid gap-2 text-[13.5px] text-text/55 sm:grid-cols-3">
                <li>Identität geprüft</li>
                <li>Transparenter Preisrahmen</li>
                <li>Anfrage unverbindlich</li>
              </ul>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:self-start">
          <form onSubmit={handleSubmit} className="card bg-background p-6 shadow-sm md:p-7">
            <h2 className="text-[19px] font-semibold text-text">Service anfragen</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text/55">
              Unverbindlich und kostenlos. Der Anbieter meldet sich direkt bei dir.
            </p>

            {createdBookingId && (
              <p className="notice notice-success mt-5 flex items-center gap-2">
                <CheckCircle2 size={16} strokeWidth={2} aria-hidden />
                Anfrage gesendet. Der Anbieter antwortet dir in Kürze.
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
                  Adresse / Einsatzort
                </label>
                <div className="field-group field-h">
                  <MapPin size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
                  <input
                    id="booking-address"
                    value={addressText}
                    onChange={(event) => setAddressText(event.target.value)}
                    placeholder={service.place.city}
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
              {saving && <Loader2 className="animate-spin" size={16} aria-hidden />}
              Anfrage senden
            </button>
            <p className="mt-3 text-center text-[12px] text-text/40">Kostenlos und unverbindlich</p>
          </form>
        </aside>
      </div>
    </main>
  )
}
