"use client"

import { GeoPoint } from "firebase/firestore"
import { useMemo, useState } from "react"
import LocationField from "@/components/LocationField"
import { useCategories } from "@/lib/hooks/useCategories"
import { PricingType } from "@/lib/types/common"
import { ServiceStatus, type Service } from "@/lib/types/service"
import type { ServiceInput } from "@/lib/data/services"
import { PRICING_LABEL } from "@/lib/utils/format"

interface ServiceFormProps {
  mode: "create" | "edit"
  initialService?: Service | null
  saving?: boolean
  onCancel: () => void
  onSubmit: (values: ServiceInput) => Promise<void>
}

interface FormState {
  title: string
  description: string
  imageUrl: string
  status: ServiceStatus
  pricingType: PricingType
  unitLabel: string
  minEuro: string
  maxEuro: string
  radiusKm: string
  address: string
  city: string
  geo: GeoPoint | null
  categoryId: string
  subcategoryId: string
}

function toFormState(service?: Service | null): FormState {
  if (!service) {
    return {
      title: "",
      description: "",
      imageUrl: "",
      status: ServiceStatus.active,
      pricingType: PricingType.hourly,
      unitLabel: "",
      minEuro: "",
      maxEuro: "",
      radiusKm: "20",
      address: "",
      city: "",
      geo: null,
      categoryId: "",
      subcategoryId: "",
    }
  }

  return {
    title: service.title,
    description: service.description,
    imageUrl: service.imageUrl ?? "",
    status: service.status,
    pricingType: service.pricing.type,
    unitLabel: service.pricing.unitLabel ?? "",
    minEuro: String(service.minPriceInCent / 100),
    maxEuro: String(service.maxPriceInCent / 100),
    radiusKm: String(service.radiusKm),
    address: service.place.address,
    city: service.place.city,
    geo: service.place.geo,
    categoryId: service.categoryId,
    subcategoryId: service.subcategoryId ?? "",
  }
}

/** "Venloer Str. 12, Köln Ehrenfeld" → "Köln Ehrenfeld" */
function cityFromLabel(label: string) {
  const parts = label.split(",").map((part) => part.trim()).filter(Boolean)
  return parts.length > 1 ? parts[parts.length - 1] : label
}

export default function ServiceForm({
  mode,
  initialService,
  saving = false,
  onCancel,
  onSubmit,
}: ServiceFormProps) {
  const { categories } = useCategories()
  const [values, setValues] = useState<FormState>(() => toFormState(initialService))
  const [error, setError] = useState<string | null>(null)

  const category = useMemo(
    () => categories.find((entry) => entry.id === values.categoryId),
    [categories, values.categoryId],
  )
  const subcategories = category?.subcategories ?? []
  const showUnitLabel = values.pricingType === PricingType.unit

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const minPriceInCent = Math.round(Number(values.minEuro.replace(",", ".")) * 100)
    const maxPriceInCent = Math.round(Number(values.maxEuro.replace(",", ".")) * 100)
    const radiusKm = Number(values.radiusKm)
    const subcategory = subcategories.find((entry) => entry.slug === values.subcategoryId)

    if (!values.geo) {
      setError("Bitte einen Ort aus den Vorschlägen auswählen.")
      return
    }
    if (!category) {
      setError("Bitte eine Kategorie auswählen.")
      return
    }
    if (!Number.isFinite(minPriceInCent) || !Number.isFinite(maxPriceInCent)) {
      setError("Bitte gültige Preise eingeben.")
      return
    }

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        imageUrl: values.imageUrl.trim() || undefined,
        status: values.status,
        pricing: {
          type: values.pricingType,
          ...(showUnitLabel && values.unitLabel.trim() ? { unitLabel: values.unitLabel.trim() } : {}),
        },
        minPriceInCent,
        maxPriceInCent,
        radiusKm,
        place: { geo: values.geo, address: values.address.trim(), city: values.city.trim() },
        categoryId: category.id,
        categoryName: category.nameDE,
        subcategoryId: subcategory?.slug,
        subcategoryName: subcategory?.nameDE,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Service konnte nicht gespeichert werden.")
    }
  }

  return (
    <section className="card bg-background p-6 md:p-7">
      <h2 className="text-[17px] font-semibold text-text">
        {mode === "create" ? "Neuen Service erstellen" : "Service bearbeiten"}
      </h2>
      <p className="mt-1 text-[13.5px] text-text/50">
        Je konkreter die Beschreibung, desto passender die Anfragen.
      </p>

      <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="service-title">
            Titel
          </label>
          <input
            id="service-title"
            required
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="z. B. Wohnungsreinigung mit eigenen Öko-Mitteln"
            className="field field-h"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="service-description">
            Beschreibung
          </label>
          <textarea
            id="service-description"
            required
            rows={5}
            value={values.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="Was genau bietest du an? Was ist inklusive?"
            className="field resize-none"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="service-category">
              Kategorie
            </label>
            <select
              id="service-category"
              required
              value={values.categoryId}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  categoryId: event.target.value,
                  subcategoryId: "",
                }))
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
            <label className="field-label" htmlFor="service-subcategory">
              Unterkategorie
            </label>
            <select
              id="service-subcategory"
              value={values.subcategoryId}
              onChange={(event) => set("subcategoryId", event.target.value)}
              disabled={!category}
              className="field field-h field-select"
            >
              <option value="">Optional</option>
              {subcategories.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.nameDE}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="service-pricing">
              Abrechnungsmodell
            </label>
            <select
              id="service-pricing"
              value={values.pricingType}
              onChange={(event) => set("pricingType", event.target.value as PricingType)}
              className="field field-h field-select"
            >
              {Object.values(PricingType).map((type) => (
                <option key={type} value={type}>
                  {PRICING_LABEL[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="service-status">
              Status
            </label>
            <select
              id="service-status"
              value={values.status}
              onChange={(event) => set("status", event.target.value as ServiceStatus)}
              className="field field-h field-select"
            >
              <option value={ServiceStatus.active}>Aktiv</option>
              <option value={ServiceStatus.paused}>Pausiert</option>
            </select>
          </div>

          {showUnitLabel && (
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="service-unit">
                Einheit
              </label>
              <input
                id="service-unit"
                value={values.unitLabel}
                onChange={(event) => set("unitLabel", event.target.value)}
                placeholder="z. B. Fenster, qm"
                className="field field-h"
              />
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="service-min">
              Ab (€)
            </label>
            <input
              id="service-min"
              required
              inputMode="decimal"
              value={values.minEuro}
              onChange={(event) => set("minEuro", event.target.value)}
              placeholder="z. B. 26"
              className="field field-h num"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="service-max">
              Bis (€)
            </label>
            <input
              id="service-max"
              required
              inputMode="decimal"
              value={values.maxEuro}
              onChange={(event) => set("maxEuro", event.target.value)}
              placeholder="z. B. 32"
              className="field field-h num"
            />
          </div>
        </div>

        <LocationField
          value={values.address}
          onChange={(value) => {
            setValues((previous) => ({ ...previous, address: value, geo: null }))
          }}
          onSelect={(suggestion) => {
            setValues((previous) => ({
              ...previous,
              address: suggestion.label,
              city: cityFromLabel(suggestion.label),
              geo: new GeoPoint(suggestion.lat, suggestion.lon),
            }))
          }}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="service-radius">
              Einsatzradius (km)
            </label>
            <input
              id="service-radius"
              type="number"
              min={1}
              max={100}
              required
              value={values.radiusKm}
              onChange={(event) => set("radiusKm", event.target.value)}
              className="field field-h num"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="service-image">
              Bild-URL <span className="font-normal text-text/40">(optional)</span>
            </label>
            <input
              id="service-image"
              type="url"
              value={values.imageUrl}
              onChange={(event) => set("imageUrl", event.target.value)}
              placeholder="https://…"
              className="field field-h"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-secondary pt-5">
          <button type="button" onClick={onCancel} disabled={saving} className="btn btn-ghost">
            Abbrechen
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Speichern…" : mode === "create" ? "Service erstellen" : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </section>
  )
}
