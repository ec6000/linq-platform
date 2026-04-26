"use client"

import { useEffect, useMemo, useState } from "react"
import { PricingType, Service, ServiceStatus } from "@/lib/types/service"
import { CreateServiceInput } from "@/lib/hooks/useCreateService"

export type ServiceFormValues = Omit<CreateServiceInput, "providerId" | "providerName">

const defaultValues: ServiceFormValues = {
  title: "",
  description: "",
  imageUrl: "",
  status: ServiceStatus.active,
  pricingType: PricingType.fixed,
  minBudgetInCent: 0,
  maxBudgetInCent: 0,
  unitName: "",
  radius: 25,
  city: "",
  categoryId: "allgemein",
  categoryName: "Allgemein",
}

interface ServiceFormProps {
  mode: "create" | "edit"
  initialService?: Service | null
  saving?: boolean
  onCancel: () => void
  onSubmit: (values: ServiceFormValues) => Promise<void>
}

export default function ServiceForm({
  mode,
  initialService,
  saving = false,
  onCancel,
  onSubmit,
}: ServiceFormProps) {
  const initialValues = useMemo<ServiceFormValues>(() => {
    if (!initialService) return defaultValues

    return {
      title: initialService.title,
      description: initialService.description,
      imageUrl: initialService.imageUrl ?? "",
      status: initialService.status,
      pricingType: initialService.pricingType,
      minBudgetInCent: initialService.minBudgetInCent,
      maxBudgetInCent: initialService.maxBudgetInCent,
      unitName: initialService.unitName ?? "",
      radius: initialService.radius,
      city: initialService.city ?? "",
      categoryId: initialService.categoryId,
      categoryName: initialService.categoryName ?? "",
    }
  }, [initialService])

  const [values, setValues] = useState<ServiceFormValues>(initialValues)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(initialValues)
    setError(null)
  }, [initialValues])

  const showUnitName = values.pricingType === PricingType.perUnit

  function handleChange<K extends keyof ServiceFormValues>(field: K, value: ServiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!values.title.trim() || !values.description.trim()) {
      setError("Bitte Titel und Beschreibung ausfüllen.")
      return
    }

    if (values.maxBudgetInCent < values.minBudgetInCent) {
      setError("Das Maximalbudget muss größer oder gleich dem Mindestbudget sein.")
      return
    }

    await onSubmit({
      ...values,
      unitName: values.pricingType === PricingType.perUnit ? values.unitName : "",
      imageUrl: values.imageUrl?.trim() || "",
      city: values.city?.trim() || "",
      categoryName: values.categoryName?.trim() || "",
    })
  }

  return (
    <section className="rounded-2xl border border-secondary bg-background p-5">
      <h2 className="mb-4 text-base font-semibold text-text">
        {mode === "create" ? "Neuen Service erstellen" : "Service bearbeiten"}
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-text/75 md:col-span-2">
            Titel
            <input
              required
              value={values.title}
              onChange={(event) => handleChange("title", event.target.value)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75 md:col-span-2">
            Beschreibung
            <textarea
              required
              value={values.description}
              onChange={(event) => handleChange("description", event.target.value)}
              rows={4}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Mindestbudget (€)
            <input
              type="number"
              min={0}
              value={Math.floor(values.minBudgetInCent / 100)}
              onChange={(event) => handleChange("minBudgetInCent", Number(event.target.value || 0) * 100)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Maximalbudget (€)
            <input
              type="number"
              min={0}
              value={Math.floor(values.maxBudgetInCent / 100)}
              onChange={(event) => handleChange("maxBudgetInCent", Number(event.target.value || 0) * 100)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Abrechnungsmodell
            <select
              value={values.pricingType}
              onChange={(event) => handleChange("pricingType", event.target.value as PricingType)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            >
              {Object.values(PricingType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Status
            <select
              value={values.status}
              onChange={(event) => handleChange("status", event.target.value as ServiceStatus)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            >
              <option value={ServiceStatus.active}>Aktiv</option>
              <option value={ServiceStatus.inactive}>Inaktiv</option>
            </select>
          </label>

          {showUnitName && (
            <label className="flex flex-col gap-1.5 text-sm text-text/75">
              Einheit (z. B. Fenster)
              <input
                value={values.unitName}
                onChange={(event) => handleChange("unitName", event.target.value)}
                className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Stadt
            <input
              value={values.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-text/75">
            Radius (km)
            <input
              type="number"
              min={1}
              value={values.radius}
              onChange={(event) => handleChange("radius", Number(event.target.value || 1))}
              className="rounded-xl border border-secondary px-3 py-2.5 text-[14px] text-text outline-none transition focus:border-primary/40"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-text/60 transition hover:bg-secondary disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern…" : mode === "create" ? "Service erstellen" : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </section>
  )
}
