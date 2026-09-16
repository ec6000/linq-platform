"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ImageIcon,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { haversineDistanceInKm } from "@/lib/utils/geo"
import { useLocationSuggestions } from "@/lib/hooks/useLocationSuggestions"
import { useCategories } from "@/lib/hooks/useCategories"
import { useActiveServices } from "@/lib/hooks/useServices"
import { PricingType } from "@/lib/types/common"
import type { Service } from "@/lib/types/service"
import { PRICING_LABEL, formatDistance, formatPriceRange } from "@/lib/utils/format"
import PageHeader from "@/components/layout/PageHeader"

type SortKey = "newest" | "priceAsc" | "priceDesc" | "distance"

type LocationSuggestion = { lat: number; lon: number; label: string }

type RankedService = Service & { distanceKm: number | null }

const RADIUS_OPTIONS = [5, 10, 15, 20, 30]

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function SelectField({
  children,
  label,
  value,
  onChange,
  disabled,
}: {
  children: React.ReactNode
  label: string
  value: string | number
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="field field-h field-select"
      >
        {children}
      </select>
    </label>
  )
}

export default function ServiceSearchPage() {
  const { services, loading, error } = useActiveServices()
  const { categories } = useCategories()

  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("all")
  const [subcategoryId, setSubcategoryId] = useState("all")
  const [pricingType, setPricingType] = useState("all")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const {
    suggestions: locationSuggestions,
    loading: locationLoading,
    error: locationError,
  } = useLocationSuggestions(locationQuery, selectedLocation)
  const [radiusKm, setRadiusKm] = useState(10)
  const [maxBudget, setMaxBudget] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const category = useMemo(
    () => categories.find((entry) => entry.id === categoryId),
    [categories, categoryId],
  )
  const subcategories = category?.subcategories ?? []

  const results = useMemo<RankedService[]>(() => {
    const search = normalize(query.trim())
    const maxBudgetInCent = maxBudget ? Math.round(Number(maxBudget.replace(",", ".")) * 100) : null

    return services
      .map((service) => ({
        ...service,
        distanceKm: selectedLocation
          ? haversineDistanceInKm(selectedLocation, {
              lat: service.place.geo.latitude,
              lon: service.place.geo.longitude,
            })
          : null,
      }))
      .filter((service) => {
        const haystack = normalize(
          [
            service.title,
            service.description,
            service.providerName,
            service.place.city,
            service.categoryName,
            service.subcategoryName,
          ]
            .filter(Boolean)
            .join(" "),
        )

        if (search && !haystack.includes(search)) return false
        if (categoryId !== "all" && service.categoryId !== categoryId) return false
        if (subcategoryId !== "all" && service.subcategoryId !== subcategoryId) return false
        if (pricingType !== "all" && service.pricing.type !== pricingType) return false
        if (maxBudgetInCent !== null && service.minPriceInCent > maxBudgetInCent) return false
        if (selectedLocation && (service.distanceKm ?? Infinity) > radiusKm) return false
        return true
      })
      .sort((a, b) => {
        if (sortKey === "priceAsc") return a.minPriceInCent - b.minPriceInCent
        if (sortKey === "priceDesc") return b.maxPriceInCent - a.maxPriceInCent
        if (sortKey === "distance") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
        return b.createdAt.toMillis() - a.createdAt.toMillis()
      })
  }, [
    categoryId,
    maxBudget,
    pricingType,
    query,
    radiusKm,
    selectedLocation,
    services,
    sortKey,
    subcategoryId,
  ])

  const hasFilters = Boolean(
    query ||
      categoryId !== "all" ||
      subcategoryId !== "all" ||
      pricingType !== "all" ||
      locationQuery ||
      maxBudget ||
      selectedLocation,
  )

  function resetFilters() {
    setQuery("")
    setCategoryId("all")
    setSubcategoryId("all")
    setPricingType("all")
    setLocationQuery("")
    setSelectedLocation(null)
    setRadiusKm(10)
    setMaxBudget("")
    setSortKey("newest")
  }

  return (
    <main id="main" className="shell-wide py-10 md:py-12">
      <PageHeader
        title="Service finden"
        description="Suche nach Tätigkeit, Anbieter, Kategorie oder Ort. Die Filter grenzen Budget, Einsatzgebiet und Abrechnungsmodell ein."
        count={results.length}
      />

      {/* Filter bar: sticks under the navbar so it stays reachable while scrolling. */}
      <section className="card sticky top-[calc(var(--nav-h)+8px)] z-20 mb-6 bg-background/90 p-3 backdrop-blur-xl md:p-3.5">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((open) => !open)}
          aria-expanded={mobileFiltersOpen}
          className="flex w-full items-center justify-between rounded-md border border-secondary px-4 py-2.5 text-[14px] font-medium text-text md:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={15} strokeWidth={1.9} aria-hidden />
            Suche &amp; Filter
          </span>
          <ChevronDown
            size={16}
            aria-hidden
            className={`transition-transform duration-200 ${mobileFiltersOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`${mobileFiltersOpen ? "mt-3 grid" : "hidden"} gap-2.5 md:mt-0 md:grid lg:grid-cols-[1.4fr_1fr_0.6fr]`}
        >
          <div className="field-group field-h">
            <Search size={16} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Was brauchst du? z. B. Umzug, Fenster, Nachhilfe…"
              aria-label="Suche"
            />
          </div>

          <div className="relative">
            <div className="field-group field-h">
              <MapPin size={16} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
              <input
                value={locationQuery}
                onChange={(event) => {
                  setLocationQuery(event.target.value)
                  setSelectedLocation(null)
                }}
                placeholder="Ort oder Straße suchen…"
                aria-label="Ort"
              />
            </div>

            {locationQuery.trim().length >= 2 && !selectedLocation && (
              <div className="sheet absolute left-0 right-0 z-30 mt-2 overflow-hidden p-1">
                {locationLoading && (
                  <p className="px-3 py-2.5 text-[13px] text-text/50">Ortsvorschläge werden geladen…</p>
                )}
                {!locationLoading && locationSuggestions.length === 0 && !locationError && (
                  <p className="px-3 py-2.5 text-[13px] text-text/50">Keine Ortsvorschläge gefunden.</p>
                )}
                {!locationLoading &&
                  locationSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.lat}-${suggestion.lon}`}
                      type="button"
                      onClick={() => {
                        setLocationQuery(suggestion.label)
                        setSelectedLocation(suggestion)
                        setSortKey("distance")
                      }}
                      className="block w-full rounded-sm px-3 py-2.5 text-left text-[13.5px] text-text transition-colors hover:bg-muted"
                    >
                      {suggestion.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <SelectField
            label="Radius"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
            disabled={!selectedLocation}
          >
            {RADIUS_OPTIONS.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km
              </option>
            ))}
          </SelectField>
        </div>

        <div
          className={`${mobileFiltersOpen ? "mt-2.5 grid" : "hidden"} gap-2.5 md:mt-2.5 md:grid lg:grid-cols-[1fr_1fr_0.75fr_0.75fr_0.9fr]`}
        >
          <SelectField
            label="Kategorie"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value)
              setSubcategoryId("all")
            }}
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.nameDE}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Unterkategorie"
            value={subcategoryId}
            onChange={(event) => setSubcategoryId(event.target.value)}
            disabled={!category}
          >
            <option value="all">Alle Unterkategorien</option>
            {subcategories.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.nameDE}
              </option>
            ))}
          </SelectField>

          <input
            value={maxBudget}
            onChange={(event) => setMaxBudget(event.target.value)}
            inputMode="decimal"
            placeholder="Max. €"
            aria-label="Maximalbudget"
            className="field field-h num"
          />

          <SelectField
            label="Preisart"
            value={pricingType}
            onChange={(event) => setPricingType(event.target.value)}
          >
            <option value="all">Preisart</option>
            {Object.values(PricingType).map((value) => (
              <option key={value} value={value}>
                {PRICING_LABEL[value]}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Sortierung"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            <option value="newest">Neueste zuerst</option>
            <option value="priceAsc">Preis aufsteigend</option>
            <option value="priceDesc">Preis absteigend</option>
            <option value="distance" disabled={!selectedLocation}>
              Nächste zuerst
            </option>
          </SelectField>
        </div>

        {(locationError || hasFilters) && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
            {locationError ? <p className="text-[12px] text-error">{locationError}</p> : <span />}
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="btn btn-ghost btn-sm">
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="skeleton h-96 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="empty">
            <h2 className="text-[17px] font-semibold text-text">Keine Services gefunden</h2>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-text/50">
              Passe deine Filter an oder suche nach einem allgemeineren Begriff.
            </p>
            {hasFilters && (
              <button type="button" onClick={resetFilters} className="btn btn-outline mt-7">
                Filter zurücksetzen
              </button>
            )}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((service) => (
            <article
              key={service.id}
              className="card card-interactive group flex flex-col overflow-hidden"
            >
              <div className="relative h-44 overflow-hidden bg-muted">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text/20">
                    <ImageIcon size={26} strokeWidth={1.5} aria-hidden />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="pill pill-primary">{service.categoryName}</span>
                  {service.subcategoryName && (
                    <span className="pill pill-muted">{service.subcategoryName}</span>
                  )}
                </div>

                <h2 className="line-clamp-2 text-[17px] font-semibold leading-snug text-text">
                  {service.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-text/55">
                  {service.description}
                </p>

                <div className="mt-4 flex flex-col gap-1.5 text-[13px] text-text/60">
                  <p className="flex items-center gap-2">
                    <BadgeCheck size={14} strokeWidth={1.8} className="flex-none text-accent-ink" aria-hidden />
                    {service.providerName}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.8} className="flex-none text-text/35" aria-hidden />
                    {service.place.city}
                    {service.distanceKm === null ? (
                      <span className="text-text/40">· {service.radiusKm} km Radius</span>
                    ) : (
                      <span className="num text-text/40">· {formatDistance(service.distanceKm)} entfernt</span>
                    )}
                  </p>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-secondary pt-5">
                  <div>
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-text/40">
                      Preis
                    </p>
                    <p className="num mt-1 text-[17px] font-semibold text-text">
                      {formatPriceRange(service.minPriceInCent, service.maxPriceInCent, service.pricing)}
                    </p>
                  </div>
                  <Link href={`/find-services/${service.id}`} className="btn btn-primary btn-sm">
                    Details
                    <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
