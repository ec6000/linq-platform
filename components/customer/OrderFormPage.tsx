"use client"

import { GeoPoint, Timestamp } from "firebase/firestore"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import LocationField from "@/components/LocationField"
import { useCategories } from "@/lib/hooks/useCategories"
import { useOrder } from "@/lib/hooks/useOrders"
import { createOrder, updateOrder, type OrderInput } from "@/lib/data/orders"
import { ORDER_PRIORITY_LABEL, OrderPriority, OrderStatus, type Order } from "@/lib/types/order"

function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      {children}
    </main>
  )
}

export default function OrderFormPage({ orderId }: { orderId?: string }) {
  const { order, loading, error } = useOrder(orderId)

  if (orderId && loading) {
    return (
      <FormShell>
        <div className="skeleton h-96 rounded-xl" />
      </FormShell>
    )
  }

  if (error) {
    return (
      <FormShell>
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      </FormShell>
    )
  }

  if (orderId && (!order || order.status !== OrderStatus.open)) {
    return (
      <FormShell>
        <div className="empty">
          <h1 className="text-[17px] font-semibold text-text">
            Dieser Auftrag kann nicht bearbeitet werden.
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
            Sobald ein Auftrag vergeben oder abgeschlossen ist, bleiben die Angaben unverändert.
          </p>
          <Link href="/my-orders" className="btn btn-outline mt-7">
            Zu meinen Aufträgen
          </Link>
        </div>
      </FormShell>
    )
  }

  return <OrderEditor key={orderId ?? "new"} existing={order ?? undefined} />
}

/** Firestore Timestamp → the value a datetime-local input expects. */
function toLocalInput(value: Timestamp | undefined) {
  const date = value ? value.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000)
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function cityFromLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 1] : label
}

function OrderEditor({ existing }: { existing?: Order }) {
  const router = useRouter()
  const { categories } = useCategories()

  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState(existing?.title ?? "")
  const [description, setDescription] = useState(existing?.description ?? "")
  const [budgetEuro, setBudgetEuro] = useState(existing ? String(existing.budgetInCent / 100) : "")
  const [address, setAddress] = useState(existing?.place.address ?? "")
  const [city, setCity] = useState(existing?.place.city ?? "")
  const [geo, setGeo] = useState<GeoPoint | null>(existing?.place.geo ?? null)
  const [radiusKm, setRadiusKm] = useState(String(existing?.radiusKm ?? 10))
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "")
  const [subcategoryId, setSubcategoryId] = useState(existing?.subcategoryId ?? "")
  const [priority, setPriority] = useState<OrderPriority>(existing?.priority ?? OrderPriority.normal)
  const [startsAt, setStartsAt] = useState(toLocalInput(existing?.timeWindow.start))
  const [durationHours, setDurationHours] = useState(
    existing
      ? String(
          Math.max(
            1,
            Math.round(
              (existing.timeWindow.end.toMillis() - existing.timeWindow.start.toMillis()) / 3_600_000,
            ),
          ),
        )
      : "3",
  )
  const [isFlexible, setIsFlexible] = useState(existing?.timeWindow.isFlexible ?? true)

  const category = useMemo(
    () => categories.find((entry) => entry.id === categoryId),
    [categories, categoryId],
  )
  const subcategories = category?.subcategories ?? []

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (saving) return
    setError(null)

    const subcategory = subcategories.find((entry) => entry.slug === subcategoryId)
    const start = new Date(startsAt)

    if (!geo) {
      setError("Bitte einen Ort aus den Vorschlägen auswählen.")
      return
    }
    if (!category || !subcategory) {
      setError("Bitte Kategorie und Unterkategorie auswählen.")
      return
    }
    if (Number.isNaN(start.getTime())) {
      setError("Bitte einen gültigen Starttermin auswählen.")
      return
    }

    const startTimestamp = Timestamp.fromDate(start)
    const input: OrderInput = {
      title: title.trim(),
      description: description.trim(),
      budgetInCent: Math.round(Number(budgetEuro.replace(",", ".")) * 100),
      place: { geo, address: address.trim(), city: city.trim() || cityFromLabel(address) },
      radiusKm: Number(radiusKm),
      categoryId: category.id,
      categoryName: category.nameDE,
      subcategoryId: subcategory.slug,
      subcategoryName: subcategory.nameDE,
      priority,
      timeWindow: {
        start: startTimestamp,
        end: Timestamp.fromMillis(startTimestamp.toMillis() + Number(durationHours) * 3_600_000),
        isFlexible,
      },
      imageUrls: existing?.imageUrls ?? [],
    }

    setSaving(true)
    try {
      if (existing) {
        await updateOrder(existing.id, input)
      } else {
        await createOrder(input)
      }
      router.push("/my-orders")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auftrag konnte nicht gespeichert werden.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormShell>
      <Link href="/my-orders" className="link-quiet mb-8 inline-flex items-center gap-1.5 text-[13.5px]">
        <ArrowLeft size={14} strokeWidth={2} aria-hidden />
        Zurück zu meinen Aufträgen
      </Link>

      <h1 className="display text-[32px] text-primary md:text-[38px]">
        {existing ? "Auftrag bearbeiten" : "Auftrag erstellen"}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-text/55">
        Je klarer die Beschreibung, desto passender die Angebote. Zwei Minuten reichen.
      </p>

      {error && (
        <p role="alert" className="notice notice-error mt-6">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card mt-8 flex flex-col gap-5 bg-background p-6 md:p-7">
        <div>
          <label className="field-label" htmlFor="order-title">
            Titel
          </label>
          <input
            id="order-title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="z. B. Umzugshilfe für 2-Zimmer-Wohnung"
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
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Was soll gemacht werden? Wie sieht es vor Ort aus?"
            className="field resize-none"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="order-category">
              Kategorie
            </label>
            <select
              id="order-category"
              required
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value)
                setSubcategoryId("")
              }}
              className="field field-h field-select"
            >
              <option value="">Bitte auswählen</option>
              {categories.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.nameDE}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="order-subcategory">
              Unterkategorie
            </label>
            <select
              id="order-subcategory"
              required
              value={subcategoryId}
              onChange={(event) => setSubcategoryId(event.target.value)}
              disabled={!category}
              className="field field-h field-select"
            >
              <option value="">Bitte auswählen</option>
              {subcategories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.nameDE}
                </option>
              ))}
            </select>
          </div>
        </div>

        <LocationField
          value={address}
          onChange={(value) => {
            setAddress(value)
            setGeo(null)
          }}
          onSelect={(suggestion) => {
            setAddress(suggestion.label)
            setCity(cityFromLabel(suggestion.label))
            setGeo(new GeoPoint(suggestion.lat, suggestion.lon))
          }}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="order-budget">
              Budget in €
            </label>
            <input
              id="order-budget"
              required
              inputMode="decimal"
              value={budgetEuro}
              onChange={(event) => setBudgetEuro(event.target.value)}
              placeholder="z. B. 150"
              className="field field-h num"
            />
            <p className="field-hint mt-1.5">Eine Orientierung reicht, der Preis wird verhandelt.</p>
          </div>

          <div>
            <label className="field-label" htmlFor="order-radius">
              Suchradius (km)
            </label>
            <input
              id="order-radius"
              type="number"
              min={1}
              max={100}
              required
              value={radiusKm}
              onChange={(event) => setRadiusKm(event.target.value)}
              className="field field-h num"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="order-start">
              Wunschtermin
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
            <label className="field-label" htmlFor="order-duration">
              Dauer (Std.)
            </label>
            <input
              id="order-duration"
              type="number"
              min={1}
              max={24}
              required
              value={durationHours}
              onChange={(event) => setDurationHours(event.target.value)}
              className="field field-h num"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="order-priority">
              Dringlichkeit
            </label>
            <select
              id="order-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as OrderPriority)}
              className="field field-h field-select"
            >
              {Object.values(OrderPriority).map((value) => (
                <option key={value} value={value}>
                  {ORDER_PRIORITY_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 self-end rounded-md border border-secondary px-4 py-3 text-[14px] text-text/75 transition-colors hover:border-text/20">
            <input
              type="checkbox"
              checked={isFlexible}
              onChange={(event) => setIsFlexible(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Termin ist flexibel
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-secondary pt-5">
          <button type="button" onClick={() => router.push("/my-orders")} className="btn btn-ghost">
            Abbrechen
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Speichern…" : existing ? "Änderungen speichern" : "Auftrag veröffentlichen"}
          </button>
        </div>
      </form>
    </FormShell>
  )
}
