"use client"

import { GeoPoint } from "firebase/firestore"
import { useState } from "react"
import LocationField from "@/components/LocationField"
import CategoryFields from "@/components/CategoryFields"
import { findCategory, findSubcategory } from "@/lib/types/category"
import type { LocationSuggestion } from "@/lib/hooks/useLocationSuggestions"
import { centsToInput, parseEuroInCent } from "@/lib/utils/validation"
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
  placeText: string
  place: LocationSuggestion | null
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
      radiusKm: "15",
      placeText: "",
      place: null,
      categoryId: "moving",
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
    minEuro: centsToInput(service.minPriceInCent),
    maxEuro: centsToInput(service.maxPriceInCent),
    radiusKm: String(service.radiusKm),
    placeText: service.place.address,
    place: {
      label: service.place.address,
      area: service.place.city,
      lat: service.place.geo.latitude,
      lon: service.place.geo.longitude,
    },
    categoryId: service.categoryId,
    subcategoryId: service.subcategoryId ?? "",
  }
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

  const showUnitLabel = values.pricingType === PricingType.unit

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const category = findCategory(categories, values.categoryId)
    const subcategory = findSubcategory(categories, values.categoryId, values.subcategoryId)
    const radiusKm = Number(values.radiusKm)
    const { place } = values

    if (!place) return setError("Bitte einen Ort aus den Vorschlägen auswählen.")
    if (!category) return setError("Bitte eine Kategorie auswählen.")

    try {
      const minPriceInCent = parseEuroInCent(values.minEuro)
      const maxPriceInCent = parseEuroInCent(values.maxEuro)
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
        place: { geo: new GeoPoint(place.lat, place.lon), address: place.label, city: place.area },
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

        <CategoryFields
          categories={categories}
          categoryId={values.categoryId}
          subcategoryId={values.subcategoryId}
          onChange={(categoryId, subcategoryId) => setValues((previous) => ({ ...previous, categoryId, subcategoryId }))}
        />

        <div className="grid gap-5 md:grid-cols-2">
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

          {showUnitLabel && (
            <div>
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
          label="Standort"
          value={values.placeText}
          selected={values.place}
          onChange={(placeText) => setValues((previous) => ({ ...previous, placeText, place: null }))}
          onSelect={(place) => setValues((previous) => ({ ...previous, placeText: place.label, place }))}
          hint="Gespeichert wird nur der Stadtteil. Er dient dazu, Kunden in deinem Einsatzradius zu finden."
          required
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
