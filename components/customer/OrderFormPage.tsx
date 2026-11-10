"use client"

import { GeoPoint, Timestamp } from "firebase/firestore"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import LocationField from "@/components/LocationField"
import CategoryFields from "@/components/CategoryFields"
import { useCategories } from "@/lib/hooks/useCategories"
import { useOrder, useOrderAddress } from "@/lib/hooks/useOrders"
import { createOrder, updateOrder } from "@/lib/data/orders"
import { OrderStatus, type Order, type PrivateAddress } from "@/lib/types/order"
import { findCategory, findSubcategory } from "@/lib/types/category"
import type { LocationSuggestion } from "@/lib/hooks/useLocationSuggestions"
import { centsToInput, parseEuroInCent } from "@/lib/utils/validation"

const HOUR = 3_600_000

function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-10 sm:px-6 md:py-16">
      {children}
    </main>
  )
}

export default function OrderFormPage({ orderId }: { orderId?: string }) {
  const { order, loading, error } = useOrder(orderId)
  const { address, loading: addressLoading } = useOrderAddress(orderId)

  if (orderId && (loading || addressLoading)) {
    return (
      <FormShell>
        <div className="skeleton h-96 rounded-xl" />
      </FormShell>
    )
  }

  if (error || (orderId && (!order || order.status !== OrderStatus.open || order.offerCount > 0))) {
    return (
      <FormShell>
        <div className="empty">
          <h1 className="text-[17px] font-semibold text-text">Dieser Auftrag kann nicht bearbeitet werden.</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            {error ?? "Sobald ein Angebot eingegangen ist, bleiben die Angaben so, wie die Dienstleister sie gelesen haben."}
          </p>
          <Link href="/my-orders" className="btn btn-outline mt-7">
            Zu meinen Aufträgen
          </Link>
        </div>
      </FormShell>
    )
  }

  return <OrderEditor key={orderId ?? "new"} existing={order ?? undefined} address={address} />
}

/** Firestore Timestamp → the value a datetime-local input expects. Default: tomorrow, 9:00. */
function toLocalInput(value?: Timestamp) {
  const date = value ? value.toDate() : new Date(new Date(Date.now() + 24 * HOUR).setHours(9, 0, 0, 0))
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function OrderEditor({ existing, address }: { existing?: Order; address: PrivateAddress | null }) {
  const router = useRouter()
  const { categories } = useCategories()

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [budget, setBudget] = useState(centsToInput(existing?.budgetInCent))
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "moving")
  const [subcategoryId, setSubcategoryId] = useState(existing?.subcategoryId ?? "umzugshilfe")
  const [startsAt, setStartsAt] = useState(toLocalInput(existing?.timeWindow.start))
  const [hours, setHours] = useState(
    existing ? String(Math.max(1, Math.round((existing.timeWindow.end.toMillis() - existing.timeWindow.start.toMillis()) / HOUR))) : "3",
  )
  const [isFlexible, setIsFlexible] = useState(existing?.timeWindow.isFlexible ?? false)

  const initialPlace: LocationSuggestion | null =
    existing && address
      ? { label: address.address, lat: address.geo.latitude, lon: address.geo.longitude, area: existing.place.city }
      : null
  const [placeText, setPlaceText] = useState(initialPlace?.label ?? "")
  const [place, setPlace] = useState<LocationSuggestion | null>(initialPlace)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const category = findCategory(categories, categoryId)
    const subcategory = findSubcategory(categories, categoryId, subcategoryId)
    const start = new Date(startsAt)
    let budgetInCent: number
    try {
      budgetInCent = parseEuroInCent(budget)
    } catch (err) {
      return setError(err instanceof Error ? err.message : "Bitte ein gültiges Budget angeben.")
    }
    if (!place) return setError("Bitte die Adresse aus den Vorschlägen auswählen.")
    if (!category || !subcategory) return setError("Bitte eine Kategorie auswählen.")
    if (Number.isNaN(start.getTime())) return setError("Bitte einen gültigen Termin auswählen.")
    if (!existing && start.getTime() < Date.now()) return setError("Der Termin liegt in der Vergangenheit.")

    const startTimestamp = Timestamp.fromDate(start)
    const input = {
      title,
      description,
      budgetInCent,
      place: { geo: new GeoPoint(place.lat, place.lon), address: place.label, city: place.area },
      categoryId: category.id,
      categoryName: category.nameDE,
      subcategoryId: subcategory.slug,
      subcategoryName: subcategory.nameDE,
      timeWindow: {
        start: startTimestamp,
        end: Timestamp.fromMillis(startTimestamp.toMillis() + Math.max(1, Number(hours) || 1) * HOUR),
        isFlexible,
      },
    }

    setSaving(true)
    try {
      if (existing) await updateOrder(existing.id, input)
      else await createOrder(input)
      router.push("/my-orders")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auftrag konnte nicht gespeichert werden.")
      setSaving(false)
    }
  }

  return (
    <FormShell>
      <Link href="/my-orders" className="link-quiet mb-8 inline-flex items-center gap-1.5 text-[13.5px]">
        <ArrowLeft size={14} strokeWidth={2} aria-hidden />
        Meine Aufträge
      </Link>

      <h1 className="display text-[32px] text-primary md:text-[38px]">
        {existing ? "Auftrag bearbeiten" : "Was steht an?"}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-text/55">
        Beschreib kurz, was getragen oder gefahren werden soll. Dienstleister aus Köln schicken dir ihren Preis.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-5 bg-background p-6 md:p-7">
        <div>
          <label className="field-label" htmlFor="order-title">
            Titel
          </label>
          <input
            id="order-title"
            required
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="z. B. 2-Zimmer-Wohnung von Sülz nach Ehrenfeld"
            className="field field-h"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="order-description">
            Beschreibung
          </label>
          <textarea
            id="order-description"
            required
            rows={5}
            maxLength={4000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Etage, Aufzug, große Möbel, Transporter nötig?"
            className="field resize-none"
          />
        </div>

        <CategoryFields
          categories={categories}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          onChange={(nextCategory, nextSubcategory) => {
            setCategoryId(nextCategory)
            setSubcategoryId(nextSubcategory)
          }}
          required
        />

        <LocationField
          value={placeText}
          selected={place}
          onChange={(value) => {
            setPlaceText(value)
            setPlace(null)
          }}
          onSelect={(suggestion) => {
            setPlaceText(suggestion.label)
            setPlace(suggestion)
          }}
          hint="Dienstleister sehen nur den Stadtteil. Die genaue Adresse bekommt, wen du beauftragst."
          required
        />

        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="field-label" htmlFor="order-start">
              Termin
            </label>
            <input
              id="order-start"
              type="datetime-local"
              required
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="field field-h"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="order-hours">
              Dauer (Std.)
            </label>
            <input
              id="order-hours"
              type="number"
              min={1}
              max={24}
              required
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="field field-h num"
            />
          </div>
        </div>

        <label className="-mt-1 flex cursor-pointer items-center gap-3 text-[14px] text-text/70">
          <input
            type="checkbox"
            checked={isFlexible}
            onChange={(event) => setIsFlexible(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Der Termin ist flexibel
        </label>

        <div>
          <label className="field-label" htmlFor="order-budget">
            Budget in €
          </label>
          <input
            id="order-budget"
            required
            inputMode="decimal"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="z. B. 250"
            className="field field-h num"
          />
          <p className="field-hint mt-1.5">Eine Orientierung. Den Preis legt das Angebot fest, das du annimmst.</p>
        </div>

        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-secondary pt-5">
          <Link href="/my-orders" className="btn btn-ghost">
            Abbrechen
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Speichern…" : existing ? "Änderungen speichern" : "Auftrag veröffentlichen"}
          </button>
        </div>
      </form>
    </FormShell>
  )
}
