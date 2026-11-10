"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { LayoutGrid, Map as MapIcon, MapPin, Search, SlidersHorizontal } from "lucide-react"
import { haversineDistanceInKm } from "@/lib/utils/geo"
import { useOpenOrders } from "@/lib/hooks/useOrders"
import { useCategories } from "@/lib/hooks/useCategories"
import { useGoogleMaps } from "@/lib/hooks/useGoogleMaps"
import type { LocationSuggestion } from "@/lib/hooks/useLocationSuggestions"
import { DetailPanel, MapView, type RankedOrder } from "@/components/find-jobs/OrderMap"
import OrderCard from "@/components/find-jobs/OrderCard"
import LocationField from "@/components/LocationField"
import ListState from "@/components/ListState"
import { formatDate, formatEuro } from "@/lib/utils/format"

const RADIUS_OPTIONS = [5, 10, 20, 30]
const PAGE_SIZE = 10

/** Open orders, nearest first once a place is picked, newest first otherwise. */
export default function FindOrders() {
  const { orders, loading, error } = useOpenOrders()
  const { categories } = useCategories()

  const [query, setQuery] = useState("")
  const [placeText, setPlaceText] = useState("")
  const [place, setPlace] = useState<LocationSuggestion | null>(null)
  const [radiusKm, setRadiusKm] = useState(10)
  const [categoryId, setCategoryId] = useState("")

  const [view, setView] = useState<"map" | "list">("list")
  // Filters start open on wide screens and folded on phones, where the map needs the room.
  const [filtersOpen, setFiltersOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 768px)").matches,
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(1)
  const { ready: mapsReady, error: mapsError } = useGoogleMaps(view === "map")
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo<RankedOrder[]>(() => {
    const search = query.trim().toLowerCase()
    const ranked = orders
      .map((order) => ({
        ...order,
        distanceKm: place
          ? haversineDistanceInKm(place, { lat: order.place.geo.latitude, lon: order.place.geo.longitude })
          : null,
      }))
      .filter((order) => {
        if (categoryId && order.categoryId !== categoryId) return false
        if (order.distanceKm !== null && order.distanceKm > radiusKm) return false
        return !search || `${order.title} ${order.description}`.toLowerCase().includes(search)
      })
    return place ? ranked.sort((a, b) => a.distanceKm! - b.distanceKm!) : ranked
  }, [categoryId, orders, place, query, radiusKm])

  const selected = results.find((order) => order.id === selectedId) ?? null
  const visible = results.slice(0, pageCount * PAGE_SIZE)
  const filtered = Boolean(query || place || categoryId)

  const select = useCallback((order: RankedOrder | null) => {
    setSelectedId(order?.id ?? null)
    if (order) {
      listRef.current?.querySelector(`[data-order-id="${order.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [])

  function reset() {
    setQuery("")
    setPlaceText("")
    setPlace(null)
    setCategoryId("")
    setSelectedId(null)
  }

  return (
    <main id="main" className="app-viewport flex min-h-[600px] flex-col overflow-hidden">
      <div className="flex-none border-b border-secondary bg-background px-4 py-4 sm:px-6 md:px-10 md:py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h1 className="page-title whitespace-nowrap">Aufträge</h1>
            {!loading && <span className="pill pill-primary num">{results.length}</span>}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="job-filters"
              data-active={filtersOpen}
              className="icon-btn data-[active=true]:text-primary"
              aria-label="Filter"
            >
              <SlidersHorizontal size={17} strokeWidth={1.9} aria-hidden />
            </button>
            <div className="flex items-center gap-1 rounded-md border border-secondary p-1">
              {([
                { key: "list", label: "Liste", icon: LayoutGrid },
                { key: "map", label: "Karte", icon: MapIcon },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  data-active={view === key}
                  aria-pressed={view === key}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] font-medium text-text/55 transition-colors hover:text-text data-[active=true]:bg-primary data-[active=true]:text-white"
                >
                  <Icon size={14} strokeWidth={1.9} aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="job-filters" hidden={!filtersOpen} className="mt-4 grid gap-2.5 md:grid-cols-[1.2fr_1.4fr_0.7fr_1fr]">
          <div className="field-group field-h">
            <Search size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Stichwort"
              aria-label="Suche"
            />
          </div>

          <LocationField
            label={null}
            placeholder="Von wo aus fährst du?"
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
          />

          <select
            aria-label="Umkreis"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
            disabled={!place}
            className="field field-h field-select"
          >
            {RADIUS_OPTIONS.map((radius) => (
              <option key={radius} value={radius}>
                {radius} km
              </option>
            ))}
          </select>

          <select
            aria-label="Kategorie"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="field field-h field-select"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameDE}
              </option>
            ))}
          </select>
        </div>
      </div>

      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-10">
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <ListState
              loading={loading}
              error={error}
              empty={results.length === 0}
              emptyText={filtered ? "Keine Aufträge mit diesen Filtern." : "Gerade sind keine Aufträge offen. Neue erscheinen hier sofort."}
            >
              {filtered && (
                <button type="button" onClick={reset} className="btn btn-outline">
                  Filter zurücksetzen
                </button>
              )}
            </ListState>

            {visible.map((order) => (
              <OrderCard key={order.id} order={order} distanceKm={order.distanceKm} />
            ))}

            {visible.length < results.length && (
              <button type="button" onClick={() => setPageCount((count) => count + 1)} className="btn btn-outline mx-auto mt-2">
                Mehr anzeigen
              </button>
            )}
          </div>
        </div>
      )}

      {view === "map" && (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="job-map relative">
            {mapsReady && !loading ? (
              <MapView orders={results} selectedOrder={selected} onOrderSelect={select} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted px-6 text-center">
                <p className="text-[13px] text-text/40">{error ?? mapsError ?? "Karte wird geladen…"}</p>
              </div>
            )}
          </div>

          <div className="relative flex min-h-0 flex-1 border-t border-secondary">
            <div
              className={`map-detail-panel overflow-hidden border-r border-secondary transition-all duration-300 ${
                selected ? "is-open sm:w-[420px] lg:w-[500px]" : "w-0"
              }`}
            >
              {selected && <DetailPanel order={selected} onClose={() => setSelectedId(null)} />}
            </div>

            <div ref={listRef} className="map-results flex-1 overflow-y-auto">
              {results.length === 0 ? (
                <p className="flex h-full items-center justify-center text-[13px] text-text/40">Keine Aufträge gefunden.</p>
              ) : (
                <div className="flex flex-col divide-y divide-secondary">
                  {results.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      data-order-id={order.id}
                      onClick={() => select(selectedId === order.id ? null : order)}
                      data-active={selectedId === order.id}
                      className="w-full border-l-2 border-l-transparent px-4 py-3.5 text-left transition-colors duration-150 hover:bg-muted data-[active=true]:border-l-accent data-[active=true]:bg-accent/6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium leading-snug text-text">{order.title}</p>
                          <p className="mt-1 flex items-center gap-1 truncate text-[11.5px] text-text/45">
                            <MapPin size={10} strokeWidth={1.8} aria-hidden />
                            {order.place.city}
                          </p>
                        </div>
                        <div className="flex-none text-right">
                          <p className="num text-[13.5px] font-semibold text-primary">
                            {formatEuro(order.budgetInCent, { decimals: false })} €
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-text/40">{formatDate(order.timeWindow.start)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
