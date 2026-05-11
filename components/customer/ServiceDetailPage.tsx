"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, BadgeCheck, CalendarClock, CheckCircle2, Loader2, MapPin, MessageSquare, ShieldCheck, Star } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createBooking } from "@/lib/hooks/useCreateBooking"
import { useCategories } from "@/lib/hooks/useCategory"
import { useServices } from "@/lib/hooks/useServices"
import { PricingType } from "@/lib/types/service"

interface ServiceDetailPageProps {
  serviceId: number
}

function formatBudget(minBudgetInCent: number, maxBudgetInCent: number, pricingType: PricingType, unitName?: string) {
  const min = (minBudgetInCent / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })
  const max = (maxBudgetInCent / 100).toLocaleString("de-DE", { maximumFractionDigits: 0 })
  const suffix = pricingType === PricingType.perHour ? " / Std." : pricingType === PricingType.perUnit && unitName ? ` / ${unitName}` : ""

  return `${min}–${max} €${suffix}`
}

export default function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const { user } = useAuth()
  const { services, loading, error } = useServices()
  const { categories } = useCategories()
  const [message, setMessage] = useState("")
  const [requestedDateText, setRequestedDateText] = useState("")
  const [addressText, setAddressText] = useState("")
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)

  const service = useMemo(() => services.find((item) => item.id === serviceId), [serviceId, services])
  const categoryName = useMemo(() => {
    if (!service) return "Kategorie"
    return service.categoryName || categories.find((category) => category.id === service.categoryId)?.nameDE || "Kategorie"
  }, [categories, service])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!service) return
    if (!user?.numericId) {
      setSubmitError("Deinem Kundenprofil fehlt noch die numerische User-ID. Bitte melde dich neu an oder speichere dein Profil erneut.")
      return
    }

    setSaving(true)
    setSubmitError(null)

    try {
      const bookingId = await createBooking({
        serviceId: service.id,
        providerId: service.providerId,
        customerId: user.numericId,
        serviceTitle: service.title,
        categoryId: service.categoryId,
        pricingType: service.pricingType,
        priceInCent: service.minBudgetInCent,
        unitName: service.unitName,
        message,
        requestedDateText,
        addressText,
        city: service.city,
      })
      setCreatedBookingId(bookingId)
      setMessage("")
      setRequestedDateText("")
      setAddressText("")
    } catch (err) {
      console.error(err)
      setSubmitError("Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-[1200px] px-6 py-10 text-sm text-text/50">Service wird geladen…</main>
  }

  if (error || !service) {
    return <main className="mx-auto max-w-[1200px] px-6 py-10"><Link href="/find-services" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft size={16} /> Zur Suche</Link><div className="mt-6 rounded-3xl border border-secondary p-8"><h1 className="text-xl font-semibold text-text">Service nicht gefunden</h1><p className="mt-2 text-sm text-text/55">Der Service ist nicht mehr verfügbar oder wurde entfernt.</p></div></main>
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8 md:px-10">
      <Link href="/find-services" className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text/60 transition hover:bg-secondary hover:text-text"><ArrowLeft size={16} /> Zurück zur Suche</Link>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-[2rem] border border-secondary bg-background">
          <div className="relative h-[340px] bg-secondary md:h-[440px]">
            {service.imageUrl ? <Image src={service.imageUrl} alt={service.title} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-text/35">Kein Bild vorhanden</div>}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{categoryName}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent"><Star size={14} className="fill-accent" /> 4,9 Bewertung</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-text/60"><ShieldCheck size={14} /> geprüfter Anbieter</span>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text md:text-5xl">{service.title}</h1>
            <p className="mt-4 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-text/65">{service.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-secondary p-4"><p className="text-xs uppercase tracking-wide text-text/40">Preisrahmen</p><p className="mt-1 text-xl font-semibold text-text">{formatBudget(service.minBudgetInCent, service.maxBudgetInCent, service.pricingType, service.unitName)}</p></div>
              <div className="rounded-2xl border border-secondary p-4"><p className="text-xs uppercase tracking-wide text-text/40">Ort</p><p className="mt-1 flex items-center gap-2 text-lg font-semibold text-text"><MapPin size={18} /> {service.city || "Nach Absprache"}</p></div>
              <div className="rounded-2xl border border-secondary p-4"><p className="text-xs uppercase tracking-wide text-text/40">Radius</p><p className="mt-1 text-lg font-semibold text-text">{service.radius} km</p></div>
            </div>

            <div className="mt-8 rounded-3xl bg-secondary/60 p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text"><BadgeCheck className="text-primary" /> Anbieter</h2>
              <p className="mt-2 text-text/70">{service.providerName}</p>
              <div className="mt-4 grid gap-2 text-sm text-text/60 sm:grid-cols-3"><span>✓ Identität geprüft</span><span>✓ Transparenter Preisrahmen</span><span>✓ Anfrage unverbindlich</span></div>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-secondary bg-background p-5 shadow-sm md:p-6">
            <h2 className="text-xl font-semibold text-text">Service anfragen</h2>
            <p className="mt-1 text-sm leading-6 text-text/55">Sende eine unverbindliche Anfrage. Der Anbieter erhält Service-, Kunden- und Booking-ID als numerische Referenzen.</p>

            {createdBookingId && <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary"><CheckCircle2 className="mb-2" size={18} /> Anfrage gesendet. Booking-ID: #{createdBookingId}</div>}

            <label className="mt-5 block text-sm font-medium text-text/75">Wunschtermin</label>
            <div className="relative mt-2"><CalendarClock className="absolute left-4 top-1/2 -translate-y-1/2 text-text/35" size={17} /><input value={requestedDateText} onChange={(event) => setRequestedDateText(event.target.value)} placeholder="z.B. Freitagvormittag oder flexibel" className="h-12 w-full rounded-2xl border border-secondary bg-background pl-11 pr-4 text-sm outline-none focus:border-primary/40" /></div>

            <label className="mt-4 block text-sm font-medium text-text/75">Adresse / Einsatzort</label>
            <div className="relative mt-2"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text/35" size={17} /><input value={addressText} onChange={(event) => setAddressText(event.target.value)} placeholder={service.city || "Wo soll der Service stattfinden?"} className="h-12 w-full rounded-2xl border border-secondary bg-background pl-11 pr-4 text-sm outline-none focus:border-primary/40" /></div>

            <label className="mt-4 block text-sm font-medium text-text/75">Nachricht</label>
            <div className="relative mt-2"><MessageSquare className="absolute left-4 top-4 text-text/35" size={17} /><textarea value={message} onChange={(event) => setMessage(event.target.value)} required rows={5} placeholder="Beschreibe kurz, was du brauchst…" className="w-full resize-none rounded-2xl border border-secondary bg-background py-3 pl-11 pr-4 text-sm leading-6 outline-none focus:border-primary/40" /></div>

            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}

            <button type="submit" disabled={saving} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving && <Loader2 className="animate-spin" size={16} />} Anfrage senden</button>
            <p className="mt-3 text-center text-xs text-text/40">Kostenlos und unverbindlich</p>
          </form>
        </aside>
      </div>
    </main>
  )
}
