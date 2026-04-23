"use client"

import { useMemo, useState } from "react"
import { ClipboardList, MapPin, Search, SlidersHorizontal, Tag } from "lucide-react"
import { useOrders } from "@/lib/hooks/useOrders"
import { useCategories } from "@/lib/hooks/useCategory"
import OrderCard from "@/components/find-jobs/OrderCard"
import { OrderStatus } from "@/lib/types/order"
import { matchesCategoryIdentifier } from "@/lib/utils/categoryMatching"

type Coordinates = {
  lat: number
  lon: number
}

const radiusOptions = [5, 10, 15, 20]
const cologneCenter: Coordinates = { lat: 50.9375, lon: 6.9603 }

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
  const [radiusKm, setRadiusKm] = useState(20)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const normalizedLocationQuery = locationQuery.trim().toLowerCase()
    const locationFilterActive = normalizedLocationQuery.length > 0
    const searchForCologne =
      normalizedLocationQuery.includes("köln") || normalizedLocationQuery.includes("koeln")

    const selectedCategories = categories.filter((category) =>
      selectedCategoryIds.includes(category.id)
    )

    return orders
      .filter((order) => order.status === OrderStatus.available)
      .map((order) => {
        const titleMatch = order.title.toLowerCase().includes(normalizedQuery)
        const customerMatch = order.customerName.toLowerCase().includes(normalizedQuery)
        const matchesText = normalizedQuery.length === 0 || titleMatch || customerMatch

        const distanceToCologne = haversineDistanceInKm(cologneCenter, {
          lat: order.location.latitude,
          lon: order.location.longitude,
        })

        const matchesLocation =
          !locationFilterActive || (searchForCologne && distanceToCologne <= 20)

        const matchesRadius =
          !locationFilterActive || (searchForCologne && distanceToCologne <= radiusKm)

        const matchesCategory =
          selectedCategoryIds.length === 0 ||
          selectedCategories.some((category) =>
            matchesCategoryIdentifier(category, order.categoryId)
          )

        const textScore =
          normalizedQuery.length === 0 ? 20 : titleMatch ? 35 : customerMatch ? 20 : 0
        const categoryScore =
          selectedCategoryIds.length === 0 ? 20 : matchesCategory ? 30 : 0
        const locationScore = !locationFilterActive
          ? 20
          : searchForCologne && matchesRadius
            ? Math.max(0, Math.round(20 - distanceToCologne))
            : 0

        return {
          ...order,
          matchingScore: textScore + categoryScore + locationScore,
          matchesText,
          matchesCategory,
          matchesLocation,
          matchesRadius,
        }
      })
      .filter((order) => {
        return (
          order.matchesText &&
          order.matchesCategory &&
          order.matchesLocation &&
          order.matchesRadius
        )
      })
      .sort((a, b) => b.matchingScore - a.matchingScore)
  }, [categories, locationQuery, orders, query, radiusKm, selectedCategoryIds])

  const locationHint = useMemo(() => {
    if (!locationQuery.trim()) {
      return null
    }

    const normalizedLocationQuery = locationQuery.trim().toLowerCase()

    if (!normalizedLocationQuery.includes("köln") && !normalizedLocationQuery.includes("koeln")) {
      return "Aktuell wird nur Köln unterstützt. Bitte „Köln“ eingeben."
    }

    return "Radius wird als Distanz zum Kölner Zentrum berechnet (max. 20 km)."
  }, [locationQuery])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    )
  }

  const resetFilters = () => {
    setQuery("")
    setLocationQuery("")
    setRadiusKm(20)
    setSelectedCategoryIds([])
  }

  const locationFilterActive = locationQuery.trim().length > 0

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
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30"
              strokeWidth={1.8}
            />
            <input
              type="text"
              placeholder="Aktuell unterstützt: Köln"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full rounded-xl border border-secondary bg-background py-2.5 pl-9 pr-4 text-[14px] text-text placeholder:text-text/30 outline-none transition focus:border-primary/40"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-secondary px-3 py-2.5">
            <label htmlFor="radius" className="text-[13px] text-text/70 whitespace-nowrap">
              Radius
            </label>
            <select
              id="radius"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="flex-1 bg-transparent text-[14px] text-text outline-none"
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

        {locationHint && <p className="mt-2 text-xs text-text/50">{locationHint}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 pr-2 text-[13px] text-text/60">
            <Tag size={14} />
            Kategorien
          </div>

          {categories.map((category) => {
            const active = selectedCategoryIds.includes(category.id)

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`rounded-full border px-3 py-1 text-[12px] transition ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-secondary text-text/70 hover:border-primary/30"
                }`}
              >
                {category.name}
              </button>
            )
          })}

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
          <OrderCard key={order.id} order={order} matchingScore={order.matchingScore} />
        ))}
      </div>
    </main>
  )
}
