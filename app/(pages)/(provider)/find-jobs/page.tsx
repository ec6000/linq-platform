"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardList, MapPin, Search, SlidersHorizontal, Tag } from "lucide-react"
import { useOrders } from "@/lib/hooks/useOrders"
import { useCategories } from "@/lib/hooks/useCategory"
import OrderCard from "@/components/find-jobs/OrderCard"
import { OrderStatus } from "@/lib/types/order"
import { findCategoryByOrderValue, matchesCategoryIdentifier } from "@/lib/utils/categoryMatching"

type Coordinates = {
  lat: number
  lon: number
}

type LocationSuggestion = Coordinates & {
  label: string
}

const radiusOptions = [5, 10, 15, 20]

function haversineDistanceInKm(from: Coordinates, to: Coordinates) {
  const earthRadius = 6371
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLon = ((to.lon - from.lon) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

export default function FindOrders() {
  const { orders, loading, error } = useOrders()
  const { categories } = useCategories()

  const [query, setQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState(5)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("")
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )
  const subcategoryOptions = selectedCategory?.subcategories ?? []

  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setLocationSuggestions([])
      setLocationLoading(false)
      setLocationError(null)
      return
    }

    if (selectedLocation && selectedLocation.label === locationQuery.trim()) {
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setLocationLoading(true)
      setLocationError(null)

      try {
        const response = await fetch(
          `/api/geoapify/autocomplete?text=${encodeURIComponent(locationQuery.trim())}&limit=5`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error("Autocomplete request failed")
        }

        const data = (await response.json()) as { results?: LocationSuggestion[] }
        setLocationSuggestions(data.results ?? [])
      } catch (autocompleteError) {
        if (controller.signal.aborted) {
          return
        }

        console.error("[find-jobs][location-autocomplete]", autocompleteError)
        setLocationSuggestions([])
        setLocationError("Ortsvorschläge konnten nicht geladen werden.")
      } finally {
        if (!controller.signal.aborted) {
          setLocationLoading(false)
        }
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [locationQuery, selectedLocation])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const locationFilterActive = Boolean(selectedLocation)

    return orders
      .filter((order) => order.status === OrderStatus.available)
      .map((order) => {
        const titleMatch = order.title.toLowerCase().includes(normalizedQuery)
        const customerMatch = order.customerName.toLowerCase().includes(normalizedQuery)
        const matchesText = normalizedQuery.length === 0 || titleMatch || customerMatch

        const distanceToSelectedLocation = selectedLocation
          ? haversineDistanceInKm(selectedLocation, {
              lat: order.location.latitude,
              lon: order.location.longitude,
            })
          : null

        const matchesLocation = !locationFilterActive || Boolean(distanceToSelectedLocation !== null)

        const matchesRadius =
          !locationFilterActive ||
          (distanceToSelectedLocation !== null && distanceToSelectedLocation <= radiusKm)

        const matchesCategory =
          !selectedCategory || matchesCategoryIdentifier(selectedCategory, order.categoryId)
        const matchesSubcategory =
          !selectedSubcategoryId ||
          order.subcategoryId.toLowerCase().trim() === selectedSubcategoryId.toLowerCase().trim()

        const textScore =
          normalizedQuery.length === 0 ? 20 : titleMatch ? 35 : customerMatch ? 20 : 0
        const categoryScore = !selectedCategory ? 20 : matchesCategory ? 30 : 0
        const subcategoryScore = !selectedSubcategoryId ? 10 : matchesSubcategory ? 15 : 0
        const locationScore =
          !locationFilterActive || distanceToSelectedLocation === null
            ? 20
            : matchesRadius
              ? Math.max(0, Math.round(20 - distanceToSelectedLocation))
              : 0

        return {
          ...order,
          categoryName: selectedCategory
            ? (matchesCategory ? selectedCategory.nameDE : undefined)
            : findCategoryByOrderValue(categories, order.categoryId)?.nameDE,
          matchingScore: textScore + categoryScore + subcategoryScore + locationScore,
          matchesText,
          matchesCategory,
          matchesSubcategory,
          matchesLocation,
          matchesRadius,
        }
      })
      .filter((order) => {
        return (
          order.matchesText &&
          order.matchesCategory &&
          order.matchesSubcategory &&
          order.matchesLocation &&
          order.matchesRadius
        )
      })
      .sort((a, b) => b.matchingScore - a.matchingScore)
  }, [categories, orders, query, radiusKm, selectedCategory, selectedLocation, selectedSubcategoryId])

  useEffect(() => {
    if (orders.length === 0) {
      return
    }

    const unmatchedOrderCategoryIds = orders
      .filter((order) => !findCategoryByOrderValue(categories, order.categoryId))
      .map((order) => order.categoryId)

    console.info("[find-jobs][category-debug]", {
      categoriesLoaded: categories.length,
      selectedCategoryId,
      sampleCategoryMappings: categories.slice(0, 5).map((category) => ({
        id: category.id,
        firestoreId: category.firestoreId,
        nameDE: category.nameDE,
      })),
      uniqueOrderCategoryIds: [...new Set(orders.map((order) => order.categoryId))],
      unmatchedOrderCategoryIds: [...new Set(unmatchedOrderCategoryIds)],
      visibleOrdersAfterFilter: filtered.length,
    })
  }, [categories, filtered.length, orders, selectedCategoryId])

  const locationHint = useMemo(() => {
    if (!locationQuery.trim()) {
      return null
    }

    if (!selectedLocation) {
      return "Bitte einen Ort aus den Vorschlägen auswählen, damit der Radiusfilter aktiv wird."
    }

    return "Es werden nur Orte und Adressen in Köln vorgeschlagen. Radius wird zur ausgewählten Position berechnet."
  }, [locationQuery, selectedLocation])

  const resetFilters = () => {
    setQuery("")
    setLocationQuery("")
    setSelectedLocation(null)
    setLocationSuggestions([])
    setLocationError(null)
    setRadiusKm(5)
    setSelectedCategoryId("")
    setSelectedSubcategoryId("")
  }

  const locationFilterActive = Boolean(selectedLocation)

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <ClipboardList size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-[22px] font-semibold tracking-tight text-text">
          Aufträge finden
        </h1>
      </div>

      <section className="mb-7 rounded-2xl border border-secondary bg-background p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-text/50" />
          <span className="text-sm font-medium text-text">Filter</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30"
              strokeWidth={1.8}
            />
            <input
              type="text"
              placeholder="Titel oder Kunde durchsuchen…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-secondary bg-background py-2.5 pl-9 pr-4 text-[14px] text-text placeholder:text-text/30 outline-none transition focus:border-primary/40"
            />
          </div>

          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3.5 top-3 text-text/30"
              strokeWidth={1.8}
            />
            <input
              type="text"
              placeholder="Ort oder Straße in Köln suchen…"
              value={locationQuery}
              onChange={(e) => {
                const value = e.target.value
                setLocationQuery(value)
                setSelectedLocation(null)
              }}
              className="w-full rounded-xl border border-secondary bg-background py-2.5 pl-9 pr-4 text-[14px] text-text placeholder:text-text/30 outline-none transition focus:border-primary/40"
            />

            {locationQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-secondary bg-background/95 shadow-xl backdrop-blur">
                {locationLoading && (
                  <p className="px-3 py-2 text-xs text-text/60">Ortsvorschläge werden geladen…</p>
                )}

                {!locationLoading && locationSuggestions.length === 0 && !locationError && (
                  <p className="px-3 py-2 text-xs text-text/60">Keine Ortsvorschläge gefunden.</p>
                )}

                {!locationLoading &&
                  locationSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.label}-${suggestion.lat}-${suggestion.lon}`}
                      type="button"
                      onClick={() => {
                        setLocationQuery(suggestion.label)
                        setSelectedLocation(suggestion)
                        setLocationSuggestions([])
                      }}
                      className="block w-full border-b border-secondary/50 px-3 py-2 text-left text-sm text-text last:border-b-0 transition hover:bg-primary/10"
                    >
                      {suggestion.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-secondary bg-white/30 px-3 py-2.5 shadow-sm">
            <label htmlFor="radius" className="text-[13px] text-text/70 whitespace-nowrap">
              Radius
            </label>
            <select
              id="radius"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="flex-1 appearance-none bg-transparent text-[14px] text-text outline-none"
              disabled={!locationFilterActive}
            >
              {radiusOptions.map((radius) => (
                <option key={radius} value={radius}>
                  {radius} km
                </option>
              ))}
            </select>
          </div>
        </div>

        {(locationHint || locationError) && (
          <p className="mt-2 text-xs text-text/50">{locationError ?? locationHint}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label
            htmlFor="category"
            className="flex items-center gap-1.5 pr-2 text-[13px] text-text/60"
          >
            <Tag size={14} />
            Kategorien
          </label>

          <select
            id="category"
            value={selectedCategoryId}
            onChange={(event) => {
              setSelectedCategoryId(event.target.value)
              setSelectedSubcategoryId("")
            }}
            className="min-w-[220px] appearance-none rounded-2xl border border-secondary bg-white/30 px-3 py-2.5 text-[14px] text-text shadow-sm outline-none transition focus:border-primary/40"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameDE}
              </option>
            ))}
          </select>

          <select
            id="subcategory"
            value={selectedSubcategoryId}
            onChange={(event) => setSelectedSubcategoryId(event.target.value)}
            disabled={!selectedCategory}
            className="min-w-[220px] appearance-none rounded-2xl border border-secondary bg-white/30 px-3 py-2.5 text-[14px] text-text shadow-sm outline-none transition focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Alle Subkategorien</option>
            {subcategoryOptions.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.nameDE}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto text-[12px] font-medium text-text/60 transition hover:text-text"
          >
            Filter zurücksetzen
          </button>
        </div>
      </section>

      {loading && <p className="text-sm text-text/40">Aufträge werden geladen…</p>}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-text/40">Keine Aufträge mit den gewählten Filtern gefunden.</p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            matchingScore={order.matchingScore}
            categoryName={order.categoryName}
          />
        ))}
      </div>
    </main>
  )
}
